package com.globalpay.compensation.application.service;

import com.globalpay.compensation.domain.model.CompensationAuditSummary;
import com.globalpay.compensation.ports.inbound.CompensationAuditUseCase;
import com.globalpay.compensation.ports.outbound.CompensationAnalyticsPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CompensationAuditService implements CompensationAuditUseCase {

    private final CompensationAnalyticsPort analyticsPort;

    public CompensationAuditService(CompensationAnalyticsPort analyticsPort) {
        this.analyticsPort = analyticsPort;
    }

    @Override
    public CompensationAuditSummary getAuditSummary() {
        return analyticsPort.calculateAuditSummary();
    }
}
