package com.emp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Employee Entity
 *
 * This class is a JPA Entity — it maps directly to the 'employee' table
 * in the PostgreSQL database.
 *
 * Each field corresponds to a column in the table.
 */
@Entity                      // Marks this class as a database entity
@Table(name = "employee")    // Maps to the 'employee' table in PostgreSQL
public class Employee {

    @Id                                                    // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // Auto-increment (SERIAL in PostgreSQL)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "department")
    private String department;

    @Column(name = "salary")
    private Double salary;

    // --- Constructors ---

    // Required by JPA
    public Employee() {}

    // Used when creating a new employee from request body
    public Employee(String name, String department, Double salary) {
        this.name       = name;
        this.department = department;
        this.salary     = salary;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }
}
