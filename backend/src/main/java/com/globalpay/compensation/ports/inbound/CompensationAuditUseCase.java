package com.globalpay.compensation.ports.inbound;

import com.globalpay.compensation.domain.model.CompensationAuditSummary;

public interface CompensationAuditUseCase {
    CompensationAuditSummary getAuditSummary();
}
