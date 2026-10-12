package com.globalpay.compensation.domain.model;

public enum Country {
    US("US", "United States", "USD", "$"),
    UK("UK", "United Kingdom", "GBP", "£"),
    INDIA("India", "India", "INR", "₹"),
    GERMANY("Germany", "Germany", "EUR", "€");

    private final String code;
    private final String displayName;
    private final String defaultCurrency;
    private final String currencySymbol;

    Country(String code, String displayName, String defaultCurrency, String currencySymbol) {
        this.code = code;
        this.displayName = displayName;
        this.defaultCurrency = defaultCurrency;
        this.currencySymbol = currencySymbol;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDefaultCurrency() {
        return defaultCurrency;
    }

    public String getCurrencySymbol() {
        return currencySymbol;
    }

    public static Country fromString(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        for (Country c : Country.values()) {
            if (c.code.equalsIgnoreCase(text.trim()) || 
                c.displayName.equalsIgnoreCase(text.trim()) || 
                c.name().equalsIgnoreCase(text.trim())) {
                return c;
            }
        }
        throw new IllegalArgumentException("Unknown country: " + text);
    }
}
