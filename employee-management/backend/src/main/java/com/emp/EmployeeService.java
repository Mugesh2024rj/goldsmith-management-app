package com.emp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Employee Service
 *
 * This is the Service Layer — it sits between the Controller and Repository.
 * It contains the business logic of the application.
 *
 * In this simple app, the logic is straightforward:
 *   - Get all employees from the database
 *   - Save a new employee to the database
 *
 * @Service tells Spring to create and manage an instance of this class.
 */
@Service
public class EmployeeService {

    // Spring automatically injects the EmployeeRepository instance here
    @Autowired
    private EmployeeRepository employeeRepository;

    /**
     * Fetch all employees from the database.
     *
     * @return List of all Employee records
     */
    public List<Employee> getAllEmployees() {
        // findAll() is provided by JpaRepository — runs: SELECT * FROM employee
        return employeeRepository.findAll();
    }

    /**
     * Save a new employee to the database.
     *
     * @param employee The employee object received from the HTTP request body
     */
    public void addEmployee(Employee employee) {
        // save() is provided by JpaRepository — runs: INSERT INTO employee (...)
        employeeRepository.save(employee);
    }
}
