package com.globalpay.compensation.domain.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BulkAdjustmentResult(
    int affectedEmployees,
    String department,
    String country,
    BigDecimal percentage,
    OffsetDateTime executedAt
) {
    public static BulkAdjustmentResult of(int affectedEmployees, String department, String country, BigDecimal percentage) {
        return new BulkAdjustmentResult(affectedEmployees, department, country, percentage, OffsetDateTime.now());
    }
}
