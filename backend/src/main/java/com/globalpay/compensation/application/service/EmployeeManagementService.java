package com.globalpay.compensation.application.service;

import com.globalpay.compensation.domain.exception.ResourceNotFoundException;
import com.globalpay.compensation.domain.model.BulkAdjustmentCommand;
import com.globalpay.compensation.domain.model.BulkAdjustmentResult;
import com.globalpay.compensation.domain.model.Employee;
import com.globalpay.compensation.domain.model.EmployeeQuery;
import com.globalpay.compensation.domain.model.PageResult;
import com.globalpay.compensation.ports.inbound.EmployeeManagementUseCase;
import com.globalpay.compensation.ports.outbound.EmployeeRepositoryPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@Transactional
public class EmployeeManagementService implements EmployeeManagementUseCase {

    private final EmployeeRepositoryPort employeeRepository;

    public EmployeeManagementService(EmployeeRepositoryPort employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<Employee> getEmployees(EmployeeQuery query) {
        return employeeRepository.findEmployees(query);
    }

    @Override
    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    @Override
    public Employee updateSalary(Long id, BigDecimal newSalary) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employee.updateSalary(newSalary);
        return employeeRepository.updateSalary(id, employee.getSalary());
    }

    @Override
    public BulkAdjustmentResult bulkAdjustSalaries(BulkAdjustmentCommand command) {
        int affected = employeeRepository.bulkAdjustSalary(
                command.department(),
                command.country(),
                command.percentage()
        );
        return BulkAdjustmentResult.of(affected, command.department(), command.country(), command.percentage());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportEmployeesCsv(EmployeeQuery query) {
        List<Employee> employees = employeeRepository.findAllMatching(query);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            // Write CSV Header
            writer.println("ID,First Name,Last Name,Email,Department,Country,Job Title,Salary,Currency,Hire Date,Updated At");

            for (Employee e : employees) {
                writer.println(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,\"%s\",%s,%s",
                        e.getId(),
                        escapeCsv(e.getFirstName()),
                        escapeCsv(e.getLastName()),
                        escapeCsv(e.getEmail()),
                        e.getDepartment() != null ? e.getDepartment().getDisplayName() : "",
                        e.getCountry() != null ? e.getCountry().getDisplayName() : "",
                        escapeCsv(e.getJobTitle()),
                        e.getSalary() != null ? e.getSalary() : BigDecimal.ZERO,
                        e.getCurrency() != null ? e.getCurrency() : "USD",
                        e.getHireDate() != null ? e.getHireDate().toString() : "",
                        e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : ""
                ));
            }
        }
        return out.toByteArray();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
