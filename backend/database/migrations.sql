-- Create database (run this manually if database doesn't exist)
-- CREATE DATABASE IF NOT EXISTS appointment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE appointment_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    preferred_timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Jakarta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    creator_id INT NOT NULL,
    start DATETIME NOT NULL,
    end DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_creator_id (creator_id),
    INDEX idx_start (start),
    INDEX idx_deleted_at (deleted_at),
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointment participants table
CREATE TABLE IF NOT EXISTS appointment_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_participant (appointment_id, user_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample users (optional)
-- INSERT INTO users (name, username, preferred_timezone) VALUES
-- ('John Doe', 'john', 'Asia/Jakarta'),
-- ('Jane Smith', 'jane', 'Pacific/Auckland'),
-- ('Bob Wilson', 'bob', 'America/New_York');

