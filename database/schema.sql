-- ============================================================
-- HMoni Society & Dynamic CMS (এইচমনি ওয়েবসাইট)
-- Complete Database Schema for cPanel MySQL / MariaDB (phpMyAdmin)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table: users (Auth Users & Member Accounts)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'member',
  `member_id` INT NULL,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Table: hero_slides

-- ------------------------------------------------------------
-- 5. Table: hero_slides
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` TEXT,
  `button_text` VARCHAR(100) DEFAULT 'Explore More',
  `button_link` VARCHAR(255) DEFAULT '#projects',
  `image_url` VARCHAR(500) NOT NULL,
  `order_index` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. Table: projects (Projects & Highlighted Projects)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Web Development',
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `project_url` VARCHAR(255),
  `is_highlighted` TINYINT(1) DEFAULT 0,
  `order_index` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. Table: services
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(100) DEFAULT 'Code',
  `short_description` TEXT NOT NULL,
  `full_description` TEXT,
  `price_starting` VARCHAR(100),
  `order_index` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. Table: process_philosophy
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `process_philosophy` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `step_number` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(100) DEFAULT 'Compass',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. Table: testimonials (Happy Customers & Testimonials)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_name` VARCHAR(150) NOT NULL,
  `designation` VARCHAR(150),
  `company` VARCHAR(150),
  `comment` TEXT NOT NULL,
  `rating` INT DEFAULT 5,
  `avatar_url` VARCHAR(500),
  `order_index` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. Table: faqs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question` VARCHAR(500) NOT NULL,
  `answer` TEXT NOT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `order_index` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. Table: experiences
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `experiences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `designation` VARCHAR(200) NOT NULL,
  `company_name` VARCHAR(200) NOT NULL,
  `duration` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `location` VARCHAR(150),
  `order_index` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 12. Table: tech_stack (Tech Stack & Tools)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tech_stack` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Frontend',
  `icon_url` VARCHAR(500),
  `proficiency_level` INT DEFAULT 90,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. Table: blogs (Blog & Resources)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `excerpt` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `cover_image` VARCHAR(500),
  `author_name` VARCHAR(100) DEFAULT 'HMoni Team',
  `read_time` VARCHAR(50) DEFAULT '5 min read',
  `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 14. Table: social_links
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `social_links` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `platform` VARCHAR(100) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `icon` VARCHAR(100) DEFAULT 'Globe',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 15. Table: contacts (Contact Inquiries)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50),
  `subject` VARCHAR(255),
  `message` TEXT NOT NULL,
  `status` ENUM('unread', 'read', 'replied') DEFAULT 'unread',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed Sample Data
-- ============================================================

INSERT INTO `hero_slides` (`title`, `subtitle`, `button_text`, `button_link`, `image_url`, `order_index`) VALUES
('Welcome to HMoni Digital Platform', 'Innovating web & real estate management solutions with cutting-edge technology.', 'View Projects', '#projects', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200', 1),
('Building Modern Web Experiences', 'Full-stack development, cloud architecture, and high performance applications.', 'Our Services', '#services', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200', 2);

INSERT INTO `services` (`title`, `icon`, `short_description`, `full_description`, `price_starting`, `order_index`) VALUES
('Full-Stack Web Development', 'Code', 'Custom web applications built with Next.js, React, Node.js, and MySQL.', 'End-to-end full stack web application engineering, optimized for performance and security.', '$500', 1),
('Cloud Infrastructure & cPanel', 'Server', 'Seamless hosting, cPanel configuration, MySQL database optimization, and deployment.', 'Complete server provisioning, domain management, SSL setup, and cPanel configuration.', '$300', 2),
('UI/UX Design & Branding', 'Layout', 'Pixel-perfect, modern responsive interface design for Web & Mobile apps.', 'User-centered visual design, responsive layouts, design systems, and brand identity.', '$400', 3);

INSERT INTO `process_philosophy` (`step_number`, `title`, `description`, `icon`) VALUES
(1, 'Discovery & Analysis', 'Understanding project requirements, user goals, and technical feasibility.', 'Search'),
(2, 'Architecture & Design', 'Creating wireframes, system database schemas, and modern responsive UI.', 'Compass'),
(3, 'Development & Testing', 'Clean code implementation, automated testing, and API integration.', 'Code'),
(4, 'Deployment & Growth', 'Cloud deployment, continuous integration, and ongoing optimization.', 'Rocket');

INSERT INTO `testimonials` (`client_name`, `designation`, `company`, `comment`, `rating`, `avatar_url`, `order_index`) VALUES
('Rahim Ahmed', 'CEO', 'TechVision BD', 'HMoni team delivered our platform ahead of deadline. Excellent code quality and support!', 5, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 1),
('Sharmin Akter', 'Managing Director', 'Urban Living Ltd', 'Outstanding work on our real estate management portal. Highly recommended!', 5, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200', 2);

INSERT INTO `faqs` (`question`, `answer`, `category`, `order_index`) VALUES
('What tech stack do you use?', 'We build modern applications using Next.js, React, TypeScript, Node.js, Tailwind CSS, MySQL, and cPanel deployment.', 'General', 1),
('How do I manage site content?', 'You can log in to the integrated Admin Dashboard to add, edit, or delete any content in real time.', 'Support', 2);

INSERT INTO `experiences` (`designation`, `company_name`, `duration`, `description`, `location`, `order_index`) VALUES
('Senior Web Architect', 'HMoni Solutions', '2022 - Present', 'Leading full-stack engineering team, architecting Next.js & MySQL cloud solutions.', 'Dhaka, Bangladesh', 1),
('Full-Stack Engineer', 'Global Tech Inc.', '2020 - 2022', 'Developed high throughput web APIs and microservices.', 'Remote', 2);

INSERT INTO `tech_stack` (`name`, `category`, `icon_url`, `proficiency_level`) VALUES
('Next.js', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', 95),
('React', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', 95),
('TypeScript', 'Languages', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', 90),
('Node.js', 'Backend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', 90),
('MySQL', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', 88),
('Tailwind CSS', 'Styling', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', 95);

INSERT INTO `blogs` (`title`, `slug`, `excerpt`, `content`, `cover_image`, `author_name`, `read_time`) VALUES
('Building High Performance Next.js Apps with MySQL', 'building-high-performance-nextjs-apps-with-mysql', 'Learn how to optimize database connections and connection pooling for Next.js 13+ App Router.', 'Next.js 13+ with App Router provides server components and API routes that seamlessly connect to MySQL databases. By leveraging connection pooling with mysql2/promise, applications can handle thousands of concurrent queries with sub-millisecond response times.', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800', 'HMoni Tech Team', '4 min read');

INSERT INTO `social_links` (`platform`, `url`, `icon`, `is_active`) VALUES
('Facebook', 'https://facebook.com', 'Facebook', 1),
('LinkedIn', 'https://linkedin.com', 'Linkedin', 1),
('GitHub', 'https://github.com', 'Github', 1),
('Twitter', 'https://twitter.com', 'Twitter', 1);
