package com.emp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Employee Repository
 *
 * Extends JpaRepository which provides built-in database methods:
 *   - findAll()   → SELECT * FROM employee
 *   - save()      → INSERT INTO employee ...
 *   - findById()  → SELECT * FROM employee WHERE id = ?
 *   - deleteById()→ DELETE FROM employee WHERE id = ?
 *
 * No SQL queries needed — Spring Data JPA generates them automatically.
 *
 * JpaRepository<Employee, Long>:
 *   - Employee → the entity type
 *   - Long     → the type of the primary key (id)
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // No custom methods needed for this simple application
    // JpaRepository already provides findAll() and save()
}
