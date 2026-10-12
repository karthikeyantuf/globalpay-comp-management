package com.globalpay.compensation.domain.model;

import java.math.BigDecimal;

public record CountryDistribution(
    String country,
    String currency,
    long headcount,
    BigDecimal totalPayroll,
    BigDecimal averageSalary
) {}
