package com.globalpay.compensation.domain.model;

import java.math.BigDecimal;
import java.util.List;

public record CompensationAuditSummary(
    long totalHeadcount,
    BigDecimal totalAnnualPayroll,
    BigDecimal globalAverageSalary,
    List<DepartmentDistribution> departmentDistribution,
    List<CountryDistribution> countryDistribution,
    List<SalaryAnomaly> anomalies,
    int anomalyCount
) {
    public static CompensationAuditSummary of(
        long totalHeadcount,
        BigDecimal totalAnnualPayroll,
        BigDecimal globalAverageSalary,
        List<DepartmentDistribution> departmentDistribution,
        List<CountryDistribution> countryDistribution,
        List<SalaryAnomaly> anomalies
    ) {
        return new CompensationAuditSummary(
            totalHeadcount,
            totalAnnualPayroll,
            globalAverageSalary,
            departmentDistribution,
            countryDistribution,
            anomalies,
            anomalies != null ? anomalies.size() : 0
        );
    }
}
