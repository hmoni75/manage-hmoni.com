import mysql from 'mysql2/promise';

// Serverless-safe MySQL Connection Pool
// Caches pool on globalThis across warm serverless Lambda invocations
declare global {
    var _mysqlPool: mysql.Pool | undefined;
}

const getPool = (): mysql.Pool => {
    if (!global._mysqlPool) {
        const poolInstance = mysql.createPool({
            host: process.env.DB_HOST || '51.79.229.154',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'hmoni24_hmoni24',
            password: process.env.DB_PASSWORD || '15HBF&~AVNqu',
            database: process.env.DB_NAME || 'hmoni24_hmoni',
            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 0,
            connectTimeout: 15000,
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000,
            maxIdle: 2,
            idleTimeout: 30000
        });

        // Transparent auto-retry for transient socket disconnects (ECONNRESET, PROTOCOL_CONNECTION_LOST)
        const originalExecute = poolInstance.execute.bind(poolInstance);
        poolInstance.execute = (async (...args: any[]) => {
            try {
                return await (originalExecute as any)(...args);
            } catch (err: any) {
                const isTransient =
                    err.code === 'ECONNRESET' ||
                    err.code === 'PROTOCOL_CONNECTION_LOST' ||
                    err.code === 'ETIMEDOUT' ||
                    err.message?.includes('ECONNRESET') ||
                    err.message?.includes('Connection lost');

                if (isTransient) {
                    console.warn('[MySQL Pool] Auto-retrying query after transient connection reset:', err.message);
                    return await (originalExecute as any)(...args);
                }
                throw err;
            }
        }) as any;

        global._mysqlPool = poolInstance;
    }
    return global._mysqlPool;
};

const pool = getPool();

// Fast No-op initDB for Serverless Lambdas:
// Prevents concurrent DDL (CREATE/ALTER TABLE) locks and foreign key race conditions on Vercel
export async function initDB() {
    return;
}

export default pool;
