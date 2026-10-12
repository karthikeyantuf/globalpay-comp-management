package com.globalpay.compensation.ports.inbound;

import com.globalpay.compensation.domain.model.BulkAdjustmentCommand;
import com.globalpay.compensation.domain.model.BulkAdjustmentResult;
import com.globalpay.compensation.domain.model.Employee;
import com.globalpay.compensation.domain.model.EmployeeQuery;
import com.globalpay.compensation.domain.model.PageResult;

import java.math.BigDecimal;

public interface EmployeeManagementUseCase {
    PageResult<Employee> getEmployees(EmployeeQuery query);
    Employee getEmployeeById(Long id);
    Employee updateSalary(Long id, BigDecimal newSalary);
    BulkAdjustmentResult bulkAdjustSalaries(BulkAdjustmentCommand command);
    byte[] exportEmployeesCsv(EmployeeQuery query);
}
