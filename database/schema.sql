-- ============================================================
-- Nobodhara Aryan Society (নবধারা আরিয়ান সোসাইটি)
-- Database Schema for cPanel MySQL / MariaDB (phpMyAdmin)
-- ============================================================

-- Create Database (Run this in cPanel MySQL Database Wizard or phpMyAdmin if needed)
-- CREATE DATABASE IF NOT EXISTS nobodhara_aryan_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE nobodhara_aryan_db;

-- 1. Table: Plots / Properties
CREATE TABLE IF NOT EXISTS `plots` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `plot_number` VARCHAR(50) NOT NULL,
  `block` VARCHAR(20) NOT NULL,
  `size_katha` DECIMAL(5,2) NOT NULL,
  `price_bdt` DECIMAL(12,2) NOT NULL,
  `facing` VARCHAR(50) DEFAULT 'North',
  `road_width_ft` INT DEFAULT 30,
  `status` ENUM('available', 'booked', 'sold') DEFAULT 'available',
  `description` TEXT,
  `image_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: Notices & Announcements
CREATE TABLE IF NOT EXISTS `notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(50) DEFAULT 'General',
  `is_urgent` TINYINT(1) DEFAULT 0,
  `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: Booking Inquiries & Contact Messages
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `applicant_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100),
  `plot_id` INT NULL,
  `message` TEXT,
  `status` ENUM('pending', 'contacted', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`plot_id`) REFERENCES `plots`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: Admin Users
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed Sample Data
-- ============================================================

INSERT INTO `plots` (`plot_number`, `block`, `size_katha`, `price_bdt`, `facing`, `road_width_ft`, `status`, `description`, `image_url`) VALUES
('A-102', 'Block A', 3.00, 4500000.00, 'South-East', 40, 'available', 'Prime corner plot near central park and mosque. Ready for handover.', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'),
('A-105', 'Block A', 5.00, 7500000.00, 'North', 35, 'available', 'Spacious 5 katha plot adjacent to 40ft wide avenue road.', 'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800'),
('B-201', 'Block B', 3.50, 5250000.00, 'South', 30, 'booked', 'Beautiful lakeside view plot in Block B residential area.', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800'),
('B-204', 'Block B', 4.00, 6000000.00, 'East', 30, 'available', 'Ideal for residential duplex building with full utility connection.', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800'),
('C-302', 'Block C', 5.00, 7000000.00, 'North-East', 50, 'available', 'Main commercial avenue front plot in Block C.', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'),
('C-310', 'Block C', 10.00, 14000000.00, 'South', 60, 'sold', 'Large premium commercial / multi-story building block.', 'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800');

INSERT INTO `notices` (`title`, `content`, `category`, `is_urgent`) VALUES
('Annual General Meeting (AGM) 2026', 'The Annual General Meeting of Nobodhara Aryan Society will take place at the Society Community Center on 25th September 2026 at 10:00 AM. All members are cordially requested to attend.', 'AGM', 1),
('Road Widening & Electric Line Installation Update', 'Phase-2 road carpet paving and underground electrification work in Block A & B is currently underway. Completion expected by October 2026.', 'Development', 0),
('Plot Registration & Mutation Support Camp', 'A dedicated mutation and plot registration support desk will be open at the main office every Saturday this month.', 'Notice', 0);
