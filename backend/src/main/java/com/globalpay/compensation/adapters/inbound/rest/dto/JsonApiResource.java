package com.globalpay.compensation.adapters.inbound.rest.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record JsonApiResource<T>(
    String type,
    String id,
    T attributes,
    Map<String, String> links
) {
    public static <T> JsonApiResource<T> of(String type, String id, T attributes) {
        return new JsonApiResource<>(type, id, attributes, Map.of("self", "/api/" + type + "/" + id));
    }
}
