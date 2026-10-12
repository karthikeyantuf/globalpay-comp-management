package com.globalpay.compensation.adapters.inbound.rest.dto;

import java.util.List;

public record JsonApiErrorResponse(List<JsonApiError> errors) {

    public record JsonApiError(
        String status,
        String title,
        String detail
    ) {}

    public static JsonApiErrorResponse of(String status, String title, String detail) {
        return new JsonApiErrorResponse(List.of(new JsonApiError(status, title, detail)));
    }
}
