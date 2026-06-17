CREATE DATABASE IF NOT EXISTS goldsmith_db;
USE goldsmith_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gold_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  silver_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  metal_type ENUM('gold','silver') NOT NULL,
  ornament_type VARCHAR(50) NOT NULL,
  work_type ENUM('new_jewel','repair','old_to_new') NOT NULL,
  gross_weight DECIMAL(10,3) DEFAULT 0,
  stone_weight DECIMAL(10,3) DEFAULT 0,
  net_weight DECIMAL(10,3) DEFAULT 0,
  wastage DECIMAL(5,2) DEFAULT 0,
  rate DECIMAL(10,2) DEFAULT 0,
  making_charge DECIMAL(10,2) DEFAULT 0,
  repair_charge DECIMAL(10,2) DEFAULT 0,
  advance_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  balance_amount DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending','in_progress','completed','delivered','cancelled') DEFAULT 'pending',
  order_date DATE,
  delivery_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
