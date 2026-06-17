USE goldsmith_db;

INSERT INTO users (name, username, password, role) VALUES
('Admin User', 'admin', '$2a$10$7DaTLQxj12thgy00j447K.H1tj8bYsCon3Lu5cNtphVXLMM7ne8Hq', 'admin'),
('Staff User', 'staff', '$2a$10$7DaTLQxj12thgy00j447K.H1tj8bYsCon3Lu5cNtphVXLMM7ne8Hq', 'staff');
-- Default password: "password" (bcrypt hashed)

INSERT INTO rates (gold_rate, silver_rate) VALUES (6500.00, 85.00);

INSERT INTO customers (name, phone, address) VALUES
('Rajesh Kumar', '9876543210', '12, Anna Nagar, Chennai'),
('Priya Lakshmi', '9123456789', '45, T Nagar, Chennai');

INSERT INTO orders (customer_id, metal_type, ornament_type, work_type, gross_weight, stone_weight, net_weight, wastage, rate, making_charge, repair_charge, advance_amount, total_amount, balance_amount, status, order_date, delivery_date) VALUES
(1, 'gold', 'Ring', 'new_jewel', 5.500, 0.500, 5.000, 5.00, 6500.00, 500.00, 0.00, 10000.00, 33000.00, 23000.00, 'pending', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
(2, 'gold', 'Chain', 'repair', 10.000, 0.000, 10.000, 0.00, 6500.00, 0.00, 300.00, 300.00, 300.00, 0.00, 'completed', CURDATE(), CURDATE());
