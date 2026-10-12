package com.globalpay.compensation.domain.model;

import java.math.BigDecimal;

public record SalaryAnomaly(
    Long employeeId,
    String employeeName,
    String email,
    String department,
    String country,
    String jobTitle,
    BigDecimal salary,
    String currency,
    String anomalyType,
    BigDecimal departmentAverage,
    Double ratio,
    String description
) {
    public static final String TYPE_MISSING_SALARY = "MISSING_SALARY";
    public static final String TYPE_EXTREME_OUTLIER = "EXTREME_OUTLIER";
}
