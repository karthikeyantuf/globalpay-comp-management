package com.globalpay.compensation.domain.model;

import java.math.BigDecimal;

public class EmployeeQuery {
    private String search;
    private String department;
    private String country;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private int page = 1;
    private int size = 20;
    private String sortBy = "id";
    private String sortDirection = "asc";

    public EmployeeQuery() {}

    public EmployeeQuery(String search, String department, String country,
                         BigDecimal minSalary, BigDecimal maxSalary,
                         Integer page, Integer size, String sortBy, String sortDirection) {
        this.search = (search != null && !search.isBlank()) ? search.trim() : null;
        this.department = (department != null && !department.isBlank()) ? department.trim() : null;
        this.country = (country != null && !country.isBlank()) ? country.trim() : null;
        this.minSalary = minSalary;
        this.maxSalary = maxSalary;
        this.page = (page != null && page > 0) ? page : 1;
        this.size = (size != null && size > 0 && size <= 500) ? size : 20;
        this.sortBy = (sortBy != null && !sortBy.isBlank()) ? sortBy.trim() : "id";
        this.sortDirection = (sortDirection != null && sortDirection.equalsIgnoreCase("desc")) ? "desc" : "asc";
    }

    public int getOffset() {
        return (page - 1) * size;
    }

    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public BigDecimal getMinSalary() {
        return minSalary;
    }

    public void setMinSalary(BigDecimal minSalary) {
        this.minSalary = minSalary;
    }

    public BigDecimal getMaxSalary() {
        return maxSalary;
    }

    public void setMaxSalary(BigDecimal maxSalary) {
        this.maxSalary = maxSalary;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page > 0 ? page : 1;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = (size > 0 && size <= 500) ? size : 20;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }
}
