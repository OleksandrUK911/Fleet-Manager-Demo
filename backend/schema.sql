-- schema.sql — MySQL database schema for Fleet Manager
-- Run this script to set up the database before starting the backend.
--
-- Usage:
--   mysql -u root -p < schema.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- Create database and user
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS fleet_manager
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Create a dedicated application user (change the password!)
CREATE USER IF NOT EXISTS 'fleet_user'@'localhost' IDENTIFIED BY 'fleet_pass';
GRANT ALL PRIVILEGES ON fleet_manager.* TO 'fleet_user'@'localhost';
FLUSH PRIVILEGES;

USE fleet_manager;

-- ─────────────────────────────────────────────────────────────────────────────
-- Vehicles table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vehicles (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL                COMMENT 'Human-readable vehicle label',
    license_plate VARCHAR(20)   NOT NULL UNIQUE          COMMENT 'Unique license plate number',
    model         VARCHAR(100)                          COMMENT 'Vehicle make/model',
    status        VARCHAR(50)   DEFAULT 'active'        COMMENT 'active | inactive | maintenance',
    is_active     BOOLEAN       DEFAULT TRUE             COMMENT 'Soft-delete flag',
    current_lat   DOUBLE                                COMMENT 'Latest GPS latitude',
    current_lng   DOUBLE                                COMMENT 'Latest GPS longitude',
    last_seen     DATETIME                              COMMENT 'Timestamp of last GPS update',
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────────────────────
-- Positions table (GPS history log)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS positions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id  INT     NOT NULL                        COMMENT 'FK → vehicles.id',
    latitude    DOUBLE  NOT NULL                        COMMENT 'GPS latitude at recording time',
    longitude   DOUBLE  NOT NULL                        COMMENT 'GPS longitude at recording time',
    speed       FLOAT   DEFAULT 0.0                    COMMENT 'Speed in km/h',
    timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP     COMMENT 'When this position was recorded',

    CONSTRAINT fk_positions_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
        ON DELETE CASCADE,

    -- Index for fast historical queries filtered by vehicle + time range
    INDEX idx_vehicle_timestamp (vehicle_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────────────────────
-- Optional: Seed sample data for testing
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO vehicles (name, license_plate, model, current_lat, current_lng, last_seen)
VALUES
    ('Truck-01', 'LN72 ACT', 'Mercedes Actros 1845',  51.5074, -0.1278, NOW()),
    ('Truck-02', 'SW21 KDB', 'Volvo FH 500',           51.5274, -0.0978, NOW()),
    ('Van-01',   'WE19 SDH', 'Ford Transit Custom',    51.4974, -0.1678, NOW()),
    ('Van-02',   'BX65 TJH', 'Mercedes Sprinter 316',  51.5374, -0.0778, NOW()),
    ('Car-01',   'KG22 NPL', 'BMW 5 Series',            51.4874, -0.1478, NOW());
