package com.globalpay.compensation.adapters.outbound.persistence;

import com.globalpay.compensation.adapters.outbound.persistence.schema.EmployeeTableDefinition;
import com.globalpay.compensation.domain.model.Country;
import com.globalpay.compensation.domain.model.Department;
import com.globalpay.compensation.domain.model.Employee;
import com.globalpay.compensation.domain.model.EmployeeQuery;
import com.globalpay.compensation.domain.model.PageResult;
import com.globalpay.compensation.ports.outbound.EmployeeRepositoryPort;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.InsertValuesStep9;
import org.jooq.OrderField;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.globalpay.compensation.adapters.outbound.persistence.schema.EmployeeTableDefinition.*;

@Repository
public class JooqEmployeeRepositoryAdapter implements EmployeeRepositoryPort {

    private final DSLContext dsl;

    public JooqEmployeeRepositoryAdapter(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public PageResult<Employee> findEmployees(EmployeeQuery query) {
        Condition condition = buildCondition(query);
        OrderField<?> orderField = buildSortOrder(query);

        long total = dsl.selectCount()
                .from(EMPLOYEES)
                .where(condition)
                .fetchOne(0, Long.class);

        List<Employee> employees = dsl.select(
                        ID, FIRST_NAME, LAST_NAME, EMAIL, DEPARTMENT,
                        COUNTRY, JOB_TITLE, SALARY, CURRENCY, HIRE_DATE, UPDATED_AT
                )
                .from(EMPLOYEES)
                .where(condition)
                .orderBy(orderField)
                .limit(query.getSize())
                .offset(query.getOffset())
                .fetch(this::mapRecordToEmployee);

        return PageResult.of(employees, total, query.getPage(), query.getSize());
    }

    @Override
    public Optional<Employee> findById(Long id) {
        Record record = dsl.select(
                        ID, FIRST_NAME, LAST_NAME, EMAIL, DEPARTMENT,
                        COUNTRY, JOB_TITLE, SALARY, CURRENCY, HIRE_DATE, UPDATED_AT
                )
                .from(EMPLOYEES)
                .where(ID.eq(id))
                .fetchOne();

        return Optional.ofNullable(record).map(this::mapRecordToEmployee);
    }

    @Override
    public Employee updateSalary(Long id, BigDecimal newSalary) {
        OffsetDateTime now = OffsetDateTime.now();
        dsl.update(EMPLOYEES)
                .set(SALARY, newSalary)
                .set(UPDATED_AT, now)
                .where(ID.eq(id))
                .execute();

        return findById(id).orElse(null);
    }

    @Override
    public int bulkAdjustSalary(String department, String country, BigDecimal percentage) {
        Condition condition = DSL.noCondition();
        if (department != null && !department.isBlank() && !"ALL".equalsIgnoreCase(department)) {
            condition = condition.and(DEPARTMENT.equalIgnoreCase(department.trim()));
        }
        if (country != null && !country.isBlank() && !"ALL".equalsIgnoreCase(country)) {
            condition = condition.and(COUNTRY.equalIgnoreCase(country.trim()));
        }

        // Multiplier: 1 + (percentage / 100)
        BigDecimal multiplier = BigDecimal.ONE.add(percentage.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));

        return dsl.update(EMPLOYEES)
                .set(SALARY, DSL.round(SALARY.mul(multiplier), 2))
                .set(UPDATED_AT, OffsetDateTime.now())
                .where(condition)
                .execute();
    }

    @Override
    public List<Employee> findAllMatching(EmployeeQuery query) {
        Condition condition = buildCondition(query);
        OrderField<?> orderField = buildSortOrder(query);

        return dsl.select(
                        ID, FIRST_NAME, LAST_NAME, EMAIL, DEPARTMENT,
                        COUNTRY, JOB_TITLE, SALARY, CURRENCY, HIRE_DATE, UPDATED_AT
                )
                .from(EMPLOYEES)
                .where(condition)
                .orderBy(orderField)
                .fetch(this::mapRecordToEmployee);
    }

    @Override
    public long countEmployees() {
        Long count = dsl.selectCount().from(EMPLOYEES).fetchOne(0, Long.class);
        return count != null ? count : 0L;
    }

    @Override
    public void batchInsert(List<Employee> employees) {
        int batchSize = 1000;
        for (int i = 0; i < employees.size(); i += batchSize) {
            List<Employee> batch = employees.subList(i, Math.min(i + batchSize, employees.size()));
            
            var insertStep = dsl.insertInto(EMPLOYEES,
                    FIRST_NAME, LAST_NAME, EMAIL, DEPARTMENT,
                    COUNTRY, JOB_TITLE, SALARY, CURRENCY, HIRE_DATE
            );

            for (Employee emp : batch) {
                insertStep = insertStep.values(
                        emp.getFirstName(),
                        emp.getLastName(),
                        emp.getEmail(),
                        emp.getDepartment() != null ? emp.getDepartment().getDisplayName() : "Engineering",
                        emp.getCountry() != null ? emp.getCountry().getCode() : "US",
                        emp.getJobTitle(),
                        emp.getSalary(),
                        emp.getCurrency(),
                        emp.getHireDate()
                );
            }
            insertStep.execute();
        }
    }

    private Condition buildCondition(EmployeeQuery query) {
        Condition condition = DSL.noCondition();

        if (query.getSearch() != null && !query.getSearch().isBlank()) {
            String term = "%" + query.getSearch().trim().toLowerCase() + "%";
            condition = condition.and(
                    DSL.lower(FIRST_NAME).like(term)
                            .or(DSL.lower(LAST_NAME).like(term))
                            .or(DSL.lower(EMAIL).like(term))
                            .or(DSL.lower(JOB_TITLE).like(term))
            );
        }

        if (query.getDepartment() != null && !query.getDepartment().isBlank() && !"ALL".equalsIgnoreCase(query.getDepartment())) {
            condition = condition.and(DEPARTMENT.equalIgnoreCase(query.getDepartment().trim()));
        }

        if (query.getCountry() != null && !query.getCountry().isBlank() && !"ALL".equalsIgnoreCase(query.getCountry())) {
            condition = condition.and(COUNTRY.equalIgnoreCase(query.getCountry().trim()));
        }

        if (query.getMinSalary() != null) {
            condition = condition.and(SALARY.ge(query.getMinSalary()));
        }

        if (query.getMaxSalary() != null) {
            condition = condition.and(SALARY.le(query.getMaxSalary()));
        }

        return condition;
    }

    private OrderField<?> buildSortOrder(EmployeeQuery query) {
        boolean isDesc = "desc".equalsIgnoreCase(query.getSortDirection());
        String sortBy = query.getSortBy() != null ? query.getSortBy().toLowerCase() : "id";

        return switch (sortBy) {
            case "firstname", "first_name" -> isDesc ? FIRST_NAME.desc() : FIRST_NAME.asc();
            case "lastname", "last_name" -> isDesc ? LAST_NAME.desc() : LAST_NAME.asc();
            case "department" -> isDesc ? DEPARTMENT.desc() : DEPARTMENT.asc();
            case "country" -> isDesc ? COUNTRY.desc() : COUNTRY.asc();
            case "jobtitle", "job_title" -> isDesc ? JOB_TITLE.desc() : JOB_TITLE.asc();
            case "salary" -> isDesc ? SALARY.desc() : SALARY.asc();
            case "hiredate", "hire_date" -> isDesc ? HIRE_DATE.desc() : HIRE_DATE.asc();
            default -> isDesc ? ID.desc() : ID.asc();
        };
    }

    private Employee mapRecordToEmployee(Record r) {
        Department dept = null;
        try {
            dept = Department.fromString(r.get(DEPARTMENT));
        } catch (Exception ignored) {}

        Country country = null;
        try {
            country = Country.fromString(r.get(COUNTRY));
        } catch (Exception ignored) {}

        return new Employee(
                r.get(ID),
                r.get(FIRST_NAME),
                r.get(LAST_NAME),
                r.get(EMAIL),
                dept,
                country,
                r.get(JOB_TITLE),
                r.get(SALARY),
                r.get(CURRENCY),
                r.get(HIRE_DATE),
                r.get(UPDATED_AT)
        );
    }
}
