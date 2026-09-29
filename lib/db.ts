import mysql from 'mysql2/promise';

// Create high-performance MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '51.79.229.154',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'hmoni24',
    password: process.env.DB_PASSWORD || '15HBF&~AVNqu',
    database: process.env.DB_NAME || 'hmoni24_db',
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

        // 5. Plots table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS plots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plot_number VARCHAR(50) NOT NULL,
                block VARCHAR(20) NOT NULL,
                size_katha DECIMAL(5,2) NOT NULL,
                price_bdt DECIMAL(12,2) NOT NULL,
                facing VARCHAR(50) DEFAULT 'North',
                road_width_ft INT DEFAULT 30,
                status ENUM('available', 'booked', 'sold') DEFAULT 'available',
                description TEXT,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 6. Notices table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(50) DEFAULT 'General',
                is_urgent TINYINT(1) DEFAULT 0,
                published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 7. Inquiries table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inquiries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                applicant_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(100),
                plot_id INT NULL,
                message TEXT,
                status ENUM('pending', 'contacted', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 8. Admin Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 9. Hero Slides table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS hero_slides (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle TEXT,
                button_text VARCHAR(100) DEFAULT 'Explore More',
                button_link VARCHAR(255) DEFAULT '#projects',
                image_url VARCHAR(500) NOT NULL,
                order_index INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 10. Projects table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) DEFAULT 'Web Development',
                description TEXT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                project_url VARCHAR(255),
                is_highlighted TINYINT(1) DEFAULT 0,
                order_index INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 11. Services table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                icon VARCHAR(100) DEFAULT 'Code',
                short_description TEXT NOT NULL,
                full_description TEXT,
                price_starting VARCHAR(100),
                order_index INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 12. Process Philosophy table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS process_philosophy (
                id INT AUTO_INCREMENT PRIMARY KEY,
                step_number INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                icon VARCHAR(100) DEFAULT 'Compass',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 13. Testimonials table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS testimonials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_name VARCHAR(150) NOT NULL,
                designation VARCHAR(150),
                company VARCHAR(150),
                comment TEXT NOT NULL,
                rating INT DEFAULT 5,
                avatar_url VARCHAR(500),
                order_index INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 14. FAQs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS faqs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question VARCHAR(500) NOT NULL,
                answer TEXT NOT NULL,
                category VARCHAR(100) DEFAULT 'General',
                order_index INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 15. Experiences table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS experiences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                designation VARCHAR(200) NOT NULL,
                company_name VARCHAR(200) NOT NULL,
                duration VARCHAR(100) NOT NULL,
                description TEXT,
                location VARCHAR(150),
                order_index INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 16. Tech Stack table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tech_stack (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(100) DEFAULT 'Frontend',
                icon_url VARCHAR(500),
                proficiency_level INT DEFAULT 90,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 17. Blogs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS blogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                excerpt TEXT NOT NULL,
                content LONGTEXT NOT NULL,
                cover_image VARCHAR(500),
                author_name VARCHAR(100) DEFAULT 'HMoni Team',
                read_time VARCHAR(50) DEFAULT '5 min read',
                published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 18. Social Links table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS social_links (
                id INT AUTO_INCREMENT PRIMARY KEY,
                platform VARCHAR(100) NOT NULL,
                url VARCHAR(500) NOT NULL,
                icon VARCHAR(100) DEFAULT 'Globe',
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 19. Contacts table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(150) NOT NULL,
                phone VARCHAR(50),
                subject VARCHAR(255),
                message TEXT NOT NULL,
                status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        isInitialized = true;
    } catch (error) {
        console.error('Failed to initialize database tables:', error);
        throw error;
    }
}

export default pool;
