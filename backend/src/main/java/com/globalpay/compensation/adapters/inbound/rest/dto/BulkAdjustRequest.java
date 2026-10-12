package com.globalpay.compensation.adapters.inbound.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BulkAdjustRequest {

    private String department;
    private String country;
    private BigDecimal percentage;
    private JsonApiData data;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JsonApiData {
        private JsonApiAttributes attributes;
        public JsonApiAttributes getAttributes() { return attributes; }
        public void setAttributes(JsonApiAttributes attributes) { this.attributes = attributes; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JsonApiAttributes {
        private String department;
        private String country;
        private BigDecimal percentage;

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public BigDecimal getPercentage() { return percentage; }
        public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }
    }

    public String getResolvedDepartment() {
        if (department != null) return department;
        if (data != null && data.getAttributes() != null) return data.getAttributes().getDepartment();
        return null;
    }

    public String getResolvedCountry() {
        if (country != null) return country;
        if (data != null && data.getAttributes() != null) return data.getAttributes().getCountry();
        return null;
    }

    public BigDecimal getResolvedPercentage() {
        if (percentage != null) return percentage;
        if (data != null && data.getAttributes() != null) return data.getAttributes().getPercentage();
        return null;
    }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public BigDecimal getPercentage() { return percentage; }
    public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }
    public JsonApiData getData() { return data; }
    public void setData(JsonApiData data) { this.data = data; }
}
