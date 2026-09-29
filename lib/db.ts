import mysql from 'mysql2/promise';

// Create high-performance MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '51.79.229.154',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'ashastd24',
    password: process.env.DB_PASSWORD || 'T%va(oyL[anE',
    database: process.env.DB_NAME || 'ashastd24_nobodhara-aryan-society',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

let isInitialized = false;

// Initialize Database Tables automatically
export async function initDB() {
    if (isInitialized) return;

    try {
        // 1. Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'member',
                member_id INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Migration check for member_id column in users table
        try {
            await pool.query(`ALTER TABLE users ADD COLUMN member_id INT NULL AFTER role`);
        } catch {
            // Column already exists
        }

        // Migration check to update role 'user' to 'member'
        try {
            await pool.query(`UPDATE users SET role = 'member' WHERE role = 'user'`);
        } catch {
            // Role updated
        }

        // 2. Members Table (PDF 2: Members Overview Sheet)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sl_no INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                joining_date VARCHAR(100),
                mobile VARCHAR(50),
                address VARCHAR(255),
                share_count INT DEFAULT 1,
                expected_amount DECIMAL(12, 2) DEFAULT 00.00,
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Ensure email column exists in case members table was created earlier
        try {
            await pool.query(`ALTER TABLE members ADD COLUMN email VARCHAR(255) AFTER name`);
        } catch {
            // Column already exists or error ignored
        }

        // 3. Member Installments Table (PDF 1: Member Individual Installment Sheet)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS member_installments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                installment_type VARCHAR(100) NOT NULL,
                month_name VARCHAR(100),
                deposit_date DATE,
                deposit_amount DECIMAL(12, 2) DEFAULT 0.00,
                penalty_amount DECIMAL(12, 2) DEFAULT 0.00,
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 4. Expenses Table (PDF 3: Monthly Expense Ledger)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sl_no INT NOT NULL,
                expense_title VARCHAR(255) NOT NULL,
                location VARCHAR(255),
                payment_method VARCHAR(50) DEFAULT 'Check',
                expense_date DATE,
                amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Migration check for deleted_at columns across all tables (Soft Delete)
        try {
            await pool.query(`ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL`);
        } catch {}

        try {
            await pool.query(`ALTER TABLE members ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL`);
        } catch {}

        try {
            await pool.query(`ALTER TABLE member_installments ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL`);
        } catch {}

        try {
            await pool.query(`ALTER TABLE expenses ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL`);
        } catch {}

        try {
            await pool.query(`ALTER TABLE member_installments MODIFY COLUMN deposit_date VARCHAR(100)`);
        } catch {}

        try {
            await pool.query(`ALTER TABLE expenses MODIFY COLUMN expense_date VARCHAR(100)`);
        } catch {}

        isInitialized = true;
    } catch (error) {
        console.error('Failed to initialize database tables:', error);
        throw error;
    }
}

export default pool;
