package com.globalpay.compensation.adapters.inbound.rest.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record JsonApiResponse<T>(
    T data,
    Map<String, Object> meta,
    Map<String, String> links
) {
    public static <T> JsonApiResponse<T> of(T data) {
        return new JsonApiResponse<>(data, null, null);
    }

    public static <T> JsonApiResponse<T> of(T data, Map<String, Object> meta) {
        return new JsonApiResponse<>(data, meta, null);
    }

    public static <T> JsonApiResponse<T> of(T data, Map<String, Object> meta, Map<String, String> links) {
        return new JsonApiResponse<>(data, meta, links);
    }
}
