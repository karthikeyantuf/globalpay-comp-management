package com.globalpay.compensation.ports.outbound;

import com.globalpay.compensation.domain.model.Employee;
import com.globalpay.compensation.domain.model.EmployeeQuery;
import com.globalpay.compensation.domain.model.PageResult;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepositoryPort {
    PageResult<Employee> findEmployees(EmployeeQuery query);
    Optional<Employee> findById(Long id);
    Employee updateSalary(Long id, BigDecimal newSalary);
    int bulkAdjustSalary(String department, String country, BigDecimal percentage);
    List<Employee> findAllMatching(EmployeeQuery query);
    long countEmployees();
    void batchInsert(List<Employee> employees);
}
