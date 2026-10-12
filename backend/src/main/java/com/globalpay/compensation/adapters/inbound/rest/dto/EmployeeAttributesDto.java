package com.globalpay.compensation.adapters.inbound.rest.dto;

import com.globalpay.compensation.domain.model.Employee;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record EmployeeAttributesDto(
    String firstName,
    String lastName,
    String fullName,
    String email,
    String department,
    String country,
    String countryDisplayName,
    String jobTitle,
    BigDecimal salary,
    String currency,
    String currencySymbol,
    LocalDate hireDate,
    OffsetDateTime updatedAt
) {
    public static EmployeeAttributesDto fromDomain(Employee employee) {
        String deptName = employee.getDepartment() != null ? employee.getDepartment().getDisplayName() : "";
        String countryCode = employee.getCountry() != null ? employee.getCountry().getCode() : "";
        String countryDisplay = employee.getCountry() != null ? employee.getCountry().getDisplayName() : "";
        String currencySymbol = employee.getCountry() != null ? employee.getCountry().getCurrencySymbol() : "$";

        return new EmployeeAttributesDto(
                employee.getFirstName(),
                employee.getLastName(),
                employee.getFullName(),
                employee.getEmail(),
                deptName,
                countryCode,
                countryDisplay,
                employee.getJobTitle(),
                employee.getSalary(),
                employee.getCurrency(),
                currencySymbol,
                employee.getHireDate(),
                employee.getUpdatedAt()
        );
    }
}
