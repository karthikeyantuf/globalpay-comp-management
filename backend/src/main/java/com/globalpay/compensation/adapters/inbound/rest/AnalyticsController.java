package com.globalpay.compensation.adapters.inbound.rest;

import com.globalpay.compensation.adapters.inbound.rest.dto.JsonApiResource;
import com.globalpay.compensation.adapters.inbound.rest.dto.JsonApiResponse;
import com.globalpay.compensation.domain.model.CompensationAuditSummary;
import com.globalpay.compensation.ports.inbound.CompensationAuditUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final CompensationAuditUseCase compensationAuditUseCase;

    public AnalyticsController(CompensationAuditUseCase compensationAuditUseCase) {
        this.compensationAuditUseCase = compensationAuditUseCase;
    }

    @GetMapping(value = "/summary", produces = "application/vnd.api+json")
    public ResponseEntity<JsonApiResponse<JsonApiResource<CompensationAuditSummary>>> getSummary() {
        CompensationAuditSummary summary = compensationAuditUseCase.getAuditSummary();
        JsonApiResource<CompensationAuditSummary> resource = JsonApiResource.of(
                "analytics-summary",
                "current",
                summary
        );

        Map<String, Object> meta = Map.of(
                "generatedAt", System.currentTimeMillis(),
                "status", "AUDITED",
                "anomalyThresholdMultiplier", 3.0
        );

        return ResponseEntity.ok(JsonApiResponse.of(resource, meta));
    }
}
