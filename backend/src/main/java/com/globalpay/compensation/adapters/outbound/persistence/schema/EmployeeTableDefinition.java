package com.globalpay.compensation.adapters.outbound.persistence.schema;

import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.jooq.impl.SQLDataType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * jOOQ Table and Field Definitions for Employee persistence.
 */
public final class EmployeeTableDefinition {
    private EmployeeTableDefinition() {}

    public static final Table<Record> EMPLOYEES = DSL.table("employees");

    public static final Field<Long> ID = DSL.field("id", SQLDataType.BIGINT);
    public static final Field<String> FIRST_NAME = DSL.field("first_name", SQLDataType.VARCHAR(100));
    public static final Field<String> LAST_NAME = DSL.field("last_name", SQLDataType.VARCHAR(100));
    public static final Field<String> EMAIL = DSL.field("email", SQLDataType.VARCHAR(150));
    public static final Field<String> DEPARTMENT = DSL.field("department", SQLDataType.VARCHAR(50));
    public static final Field<String> COUNTRY = DSL.field("country", SQLDataType.VARCHAR(50));
    public static final Field<String> JOB_TITLE = DSL.field("job_title", SQLDataType.VARCHAR(100));
    public static final Field<BigDecimal> SALARY = DSL.field("salary", SQLDataType.NUMERIC(15, 2));
    public static final Field<String> CURRENCY = DSL.field("currency", SQLDataType.VARCHAR(10));
    public static final Field<LocalDate> HIRE_DATE = DSL.field("hire_date", SQLDataType.LOCALDATE);
    public static final Field<OffsetDateTime> UPDATED_AT = DSL.field("updated_at", SQLDataType.OFFSETDATETIME);
}
