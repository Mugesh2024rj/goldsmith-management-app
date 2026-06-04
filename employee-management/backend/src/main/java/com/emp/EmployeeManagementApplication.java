package com.emp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Employee Management System.
 *
 * @SpringBootApplication enables:
 *   - @Configuration     : allows registering extra beans
 *   - @EnableAutoConfiguration : auto-configures Spring (DB, web, etc.)
 *   - @ComponentScan     : scans this package for components
 */
@SpringBootApplication
public class EmployeeManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmployeeManagementApplication.class, args);
    }
}
