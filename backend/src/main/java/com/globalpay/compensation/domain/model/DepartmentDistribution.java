package com.globalpay.compensation.domain.model;

import java.math.BigDecimal;

public record DepartmentDistribution(
    String department,
    long headcount,
    BigDecimal totalPayroll,
    BigDecimal averageSalary,
    BigDecimal minSalary,
    BigDecimal maxSalary
) {}
