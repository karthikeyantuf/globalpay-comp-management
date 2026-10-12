package com.globalpay.compensation.domain.model;

import java.util.List;

public record PageResult<T>(
    List<T> content,
    long totalRecords,
    int totalPages,
    int currentPage,
    int pageSize
) {
    public static <T> PageResult<T> of(List<T> content, long totalRecords, int currentPage, int pageSize) {
        int totalPages = pageSize > 0 ? (int) Math.ceil((double) totalRecords / pageSize) : 0;
        return new PageResult<>(content, totalRecords, totalPages, currentPage, pageSize);
    }
}
