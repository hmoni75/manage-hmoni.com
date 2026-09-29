import mysql from 'mysql2/promise';

// Serverless-safe MySQL Connection Pool
// Caches pool on globalThis across warm serverless Lambda invocations
declare global {
    var _mysqlPool: mysql.Pool | undefined;
}

const getPool = (): mysql.Pool => {
    if (!global._mysqlPool) {
        global._mysqlPool = mysql.createPool({
            host: process.env.DB_HOST || '51.79.229.154',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'hmoni24_hmoni24',
            password: process.env.DB_PASSWORD || '15HBF&~AVNqu',
            database: process.env.DB_NAME || 'hmoni24_hmoni',
            waitForConnections: true,
            connectionLimit: 3, // Conservative limit per serverless lambda to prevent connection exhaustion
            queueLimit: 0,
            connectTimeout: 15000,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });
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
