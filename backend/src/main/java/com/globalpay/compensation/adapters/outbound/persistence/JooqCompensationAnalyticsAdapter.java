package com.globalpay.compensation.adapters.outbound.persistence;

import com.globalpay.compensation.domain.model.CompensationAuditSummary;
import com.globalpay.compensation.domain.model.CountryDistribution;
import com.globalpay.compensation.domain.model.DepartmentDistribution;
import com.globalpay.compensation.domain.model.SalaryAnomaly;
import com.globalpay.compensation.ports.outbound.CompensationAnalyticsPort;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.jooq.impl.SQLDataType;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.globalpay.compensation.adapters.outbound.persistence.schema.EmployeeTableDefinition.*;

@Repository
public class JooqCompensationAnalyticsAdapter implements CompensationAnalyticsPort {

    private final DSLContext dsl;

    public JooqCompensationAnalyticsAdapter(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public CompensationAuditSummary calculateAuditSummary() {
        // 1. Overall Aggregates
        Record summaryRecord = dsl.select(
                DSL.count().as("total_headcount"),
                DSL.coalesce(DSL.sum(SALARY), BigDecimal.ZERO).as("total_payroll"),
                DSL.coalesce(DSL.avg(SALARY), BigDecimal.ZERO).as("avg_salary")
        ).from(EMPLOYEES).fetchOne();

        long totalHeadcount = summaryRecord != null && summaryRecord.get("total_headcount") != null
                ? ((Number) summaryRecord.get("total_headcount")).longValue()
                : 0L;

        BigDecimal totalPayroll = summaryRecord != null && summaryRecord.get("total_payroll") != null
                ? new BigDecimal(summaryRecord.get("total_payroll").toString()).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal globalAvgSalary = summaryRecord != null && summaryRecord.get("avg_salary") != null
                ? new BigDecimal(summaryRecord.get("avg_salary").toString()).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 2. Department Distribution & Avg map for Anomaly detection
        Map<String, BigDecimal> deptAvgMap = new HashMap<>();
        List<DepartmentDistribution> departmentDistributions = new ArrayList<>();

        var deptRecords = dsl.select(
                DEPARTMENT,
                DSL.count().as("headcount"),
                DSL.coalesce(DSL.sum(SALARY), BigDecimal.ZERO).as("total_payroll"),
                DSL.coalesce(DSL.avg(SALARY), BigDecimal.ZERO).as("avg_salary"),
                DSL.coalesce(DSL.min(SALARY), BigDecimal.ZERO).as("min_salary"),
                DSL.coalesce(DSL.max(SALARY), BigDecimal.ZERO).as("max_salary")
        ).from(EMPLOYEES)
         .groupBy(DEPARTMENT)
         .orderBy(DEPARTMENT)
         .fetch();

        for (var r : deptRecords) {
            String dept = r.get(DEPARTMENT);
            long hc = ((Number) r.get("headcount")).longValue();
            BigDecimal tp = new BigDecimal(r.get("total_payroll").toString()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal avg = new BigDecimal(r.get("avg_salary").toString()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal min = new BigDecimal(r.get("min_salary").toString()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal max = new BigDecimal(r.get("max_salary").toString()).setScale(2, RoundingMode.HALF_UP);

            departmentDistributions.add(new DepartmentDistribution(dept, hc, tp, avg, min, max));
            deptAvgMap.put(dept != null ? dept.toLowerCase() : "", avg);
        }

        // 3. Country Distribution
        List<CountryDistribution> countryDistributions = new ArrayList<>();
        var countryRecords = dsl.select(
                COUNTRY,
                CURRENCY,
                DSL.count().as("headcount"),
                DSL.coalesce(DSL.sum(SALARY), BigDecimal.ZERO).as("total_payroll"),
                DSL.coalesce(DSL.avg(SALARY), BigDecimal.ZERO).as("avg_salary")
        ).from(EMPLOYEES)
         .groupBy(COUNTRY, CURRENCY)
         .orderBy(COUNTRY)
         .fetch();

        for (var r : countryRecords) {
            String country = r.get(COUNTRY);
            String curr = r.get(CURRENCY);
            long hc = ((Number) r.get("headcount")).longValue();
            BigDecimal tp = new BigDecimal(r.get("total_payroll").toString()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal avg = new BigDecimal(r.get("avg_salary").toString()).setScale(2, RoundingMode.HALF_UP);

            countryDistributions.add(new CountryDistribution(country, curr, hc, tp, avg));
        }

        // 4. Anomaly Detection
        // Missing salaries (salary <= 0 or null) + Extreme outliers (> 3x department average)
        List<SalaryAnomaly> anomalies = new ArrayList<>();

        // Fetch missing/zero salary records
        var missingRecords = dsl.select(
                ID, FIRST_NAME, LAST_NAME, EMAIL, DEPARTMENT, COUNTRY, JOB_TITLE, SALARY, CURRENCY
        ).from(EMPLOYEES)
         .where(SALARY.isNull().or(SALARY.le(BigDecimal.ZERO)))
         .fetch();

        for (var r : missingRecords) {
            String dept = r.get(DEPARTMENT);
            BigDecimal deptAvg = deptAvgMap.getOrDefault(dept != null ? dept.toLowerCase() : "", BigDecimal.ZERO);
            BigDecimal currentSalary = r.get(SALARY) != null ? r.get(SALARY) : BigDecimal.ZERO;

            anomalies.add(new SalaryAnomaly(
                    r.get(ID),
                    r.get(FIRST_NAME) + " " + r.get(LAST_NAME),
                    r.get(EMAIL),
                    dept,
                    r.get(COUNTRY),
                    r.get(JOB_TITLE),
                    currentSalary,
                    r.get(CURRENCY),
                    SalaryAnomaly.TYPE_MISSING_SALARY,
                    deptAvg,
                    0.0,
                    "Salary is unassigned or recorded as $0.00"
            ));
        }

        // Fetch potential outliers per department where salary > 3 * deptAvg
        for (Map.Entry<String, BigDecimal> entry : deptAvgMap.entrySet()) {
            BigDecimal deptAvg = entry.getValue();
            if (deptAvg.compareTo(BigDecimal.ZERO) <= 0) continue;

            BigDecimal threshold = deptAvg.multiply(BigDecimal.valueOf(3));
            var outlierRecords = dsl.select(
                    ID, FIRST_NAME, LAST_NAME, EMAIL, DEPARTMENT, COUNTRY, JOB_TITLE, SALARY, CURRENCY
            ).from(EMPLOYEES)
             .where(DSL.lower(DEPARTMENT).eq(entry.getKey()).and(SALARY.gt(threshold)))
             .fetch();

            for (var r : outlierRecords) {
                BigDecimal currentSalary = r.get(SALARY);
                double ratio = currentSalary.divide(deptAvg, 2, RoundingMode.HALF_UP).doubleValue();

                anomalies.add(new SalaryAnomaly(
                        r.get(ID),
                        r.get(FIRST_NAME) + " " + r.get(LAST_NAME),
                        r.get(EMAIL),
                        r.get(DEPARTMENT),
                        r.get(COUNTRY),
                        r.get(JOB_TITLE),
                        currentSalary,
                        r.get(CURRENCY),
                        SalaryAnomaly.TYPE_EXTREME_OUTLIER,
                        deptAvg,
                        ratio,
                        String.format("Salary is %.1fx the department average (threshold: 3.0x)", ratio)
                ));
            }
        }

        // Sort anomalies: missing salaries first, then highest outliers
        anomalies.sort((a, b) -> {
            if (a.anomalyType().equals(b.anomalyType())) {
                return b.salary().compareTo(a.salary());
            }
            return a.anomalyType().equals(SalaryAnomaly.TYPE_MISSING_SALARY) ? -1 : 1;
        });

        return CompensationAuditSummary.of(
                totalHeadcount,
                totalPayroll,
                globalAvgSalary,
                departmentDistributions,
                countryDistributions,
                anomalies
        );
    }
}
