package com.globalpay.compensation.adapters.inbound.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateSalaryRequest {

    private BigDecimal salary;
    private JsonApiData data;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JsonApiData {
        private String type;
        private String id;
        private JsonApiAttributes attributes;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public JsonApiAttributes getAttributes() { return attributes; }
        public void setAttributes(JsonApiAttributes attributes) { this.attributes = attributes; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JsonApiAttributes {
        private BigDecimal salary;

        public BigDecimal getSalary() { return salary; }
        public void setSalary(BigDecimal salary) { this.salary = salary; }
    }

    public BigDecimal getResolvedSalary() {
        if (salary != null) {
            return salary;
        }
        if (data != null && data.getAttributes() != null && data.getAttributes().getSalary() != null) {
            return data.getAttributes().getSalary();
        }
        return null;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

    public JsonApiData getData() {
        return data;
    }

    public void setData(JsonApiData data) {
        this.data = data;
    }
}
