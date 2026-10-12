package com.globalpay.compensation.domain.model;

import com.globalpay.compensation.domain.exception.DomainValidationException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Objects;

public class Employee {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Department department;
    private Country country;
    private String jobTitle;
    private BigDecimal salary;
    private String currency;
    private LocalDate hireDate;
    private OffsetDateTime updatedAt;

    public Employee() {
    }

    public Employee(Long id, String firstName, String lastName, String email,
                    Department department, Country country, String jobTitle,
                    BigDecimal salary, String currency, LocalDate hireDate,
                    OffsetDateTime updatedAt) {
        validate(firstName, lastName, email, salary);
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.country = country;
        this.jobTitle = jobTitle;
        this.salary = salary;
        this.currency = currency != null ? currency : (country != null ? country.getDefaultCurrency() : "USD");
        this.hireDate = hireDate != null ? hireDate : LocalDate.now();
        this.updatedAt = updatedAt != null ? updatedAt : OffsetDateTime.now();
    }

    private void validate(String firstName, String lastName, String email, BigDecimal salary) {
        if (firstName == null || firstName.isBlank()) {
            throw new DomainValidationException("First name cannot be empty");
        }
        if (lastName == null || lastName.isBlank()) {
            throw new DomainValidationException("Last name cannot be empty");
        }
        if (email == null || !email.contains("@")) {
            throw new DomainValidationException("Invalid email format: " + email);
        }
        if (salary != null && salary.compareTo(BigDecimal.ZERO) < 0) {
            throw new DomainValidationException("Salary cannot be negative: " + salary);
        }
    }

    public void updateSalary(BigDecimal newSalary) {
        if (newSalary == null || newSalary.compareTo(BigDecimal.ZERO) < 0) {
            throw new DomainValidationException("Salary cannot be null or negative");
        }
        this.salary = newSalary;
        this.updatedAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Country getCountry() {
        return country;
    }

    public void setCountry(Country country) {
        this.country = country;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return Objects.equals(id, employee.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
