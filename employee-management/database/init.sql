-- ============================================================
-- Employee Management System - Database Initialization Script
-- This script runs automatically when PostgreSQL container starts
-- ============================================================

-- Create the employee table
CREATE TABLE employee (
    id         BIGSERIAL PRIMARY KEY,    -- Auto-incrementing unique ID (BIGINT)
    name       VARCHAR(100),             -- Employee full name
    department VARCHAR(100),             -- Department name
    salary     FLOAT8                    -- Salary amount (matches Java Double)
);

-- Insert sample employee records for testing
INSERT INTO employee (name, department, salary)
VALUES
    ('Mugesh', 'DevOps',  30000),
    ('Alex',   'Cloud',   45000),
    ('Sara',   'Backend', 52000),
    ('James',  'Frontend',41000);
