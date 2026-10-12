package com.globalpay.compensation.ports.outbound;

import com.globalpay.compensation.domain.model.CompensationAuditSummary;

public interface CompensationAnalyticsPort {
    CompensationAuditSummary calculateAuditSummary();
}
