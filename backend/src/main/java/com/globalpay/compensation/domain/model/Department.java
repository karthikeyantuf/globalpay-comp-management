package com.globalpay.compensation.domain.model;

public enum Department {
    ENGINEERING("Engineering"),
    PRODUCT("Product"),
    SALES("Sales"),
    HR("HR"),
    FINANCE("Finance");

    private final String displayName;

    Department(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Department fromString(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        for (Department d : Department.values()) {
            if (d.displayName.equalsIgnoreCase(text.trim()) || d.name().equalsIgnoreCase(text.trim())) {
                return d;
            }
        }
        throw new IllegalArgumentException("Unknown department: " + text);
    }
}
