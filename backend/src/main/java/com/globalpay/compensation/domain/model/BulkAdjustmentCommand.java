package com.globalpay.compensation.domain.model;

import com.globalpay.compensation.domain.exception.DomainValidationException;

import java.math.BigDecimal;

public record BulkAdjustmentCommand(
    String department,
    String country,
    BigDecimal percentage
) {
    public BulkAdjustmentCommand {
        if (percentage == null) {
            throw new DomainValidationException("Adjustment percentage cannot be null");
        }
        if (percentage.compareTo(BigDecimal.valueOf(-100)) < 0 || percentage.compareTo(BigDecimal.valueOf(500)) > 0) {
            throw new DomainValidationException("Percentage must be between -100% and +500%");
        }
    }
}
