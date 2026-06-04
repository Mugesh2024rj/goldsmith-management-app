package com.emp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Employee Controller
 *
 * This is the Controller Layer — it handles incoming HTTP requests and
 * returns HTTP responses.
 *
 * @RestController = @Controller + @ResponseBody
 *   Automatically converts Java objects to JSON responses.
 *
 * @RequestMapping("/employees")
 *   All endpoints in this class are prefixed with /employees
 *
 * @CrossOrigin("*")
 *   Allows requests from ANY origin (needed so the HTML frontend
 *   running on a different port can call this API).
 */
@RestController
@RequestMapping("/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    // Spring injects the EmployeeService instance here
    @Autowired
    private EmployeeService employeeService;

    /**
     * GET /employees
     *
     * Returns a list of all employees as JSON.
     *
     * Example response:
     * [
     *   { "id": 1, "name": "Mugesh", "department": "DevOps", "salary": 30000 },
     *   { "id": 2, "name": "Alex",   "department": "Cloud",  "salary": 45000 }
     * ]
     */
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    /**
     * POST /employees
     *
     * Accepts a JSON body, saves the employee, and returns a success message.
     *
     * Example request body:
     * { "name": "John", "department": "DevOps", "salary": 30000 }
     *
     * Example response:
     * { "message": "Employee Added Successfully" }
     *
     * @RequestBody tells Spring to convert the incoming JSON into an Employee object
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> addEmployee(@RequestBody Employee employee) {
        employeeService.addEmployee(employee);

        // Build the response message as a simple key-value map
        Map<String, String> response = new HashMap<>();
        response.put("message", "Employee Added Successfully");

        return ResponseEntity.ok(response);
    }
}
