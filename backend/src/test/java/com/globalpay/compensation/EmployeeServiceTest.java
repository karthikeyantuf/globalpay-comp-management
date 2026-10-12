package com.globalpay.compensation;

import com.globalpay.compensation.application.service.EmployeeManagementService;
import com.globalpay.compensation.domain.exception.DomainValidationException;
import com.globalpay.compensation.domain.model.BulkAdjustmentCommand;
import com.globalpay.compensation.domain.model.BulkAdjustmentResult;
import com.globalpay.compensation.domain.model.Country;
import com.globalpay.compensation.domain.model.Department;
import com.globalpay.compensation.domain.model.Employee;
import com.globalpay.compensation.ports.outbound.EmployeeRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepositoryPort employeeRepository;

    private EmployeeManagementService service;

    @BeforeEach
    void setUp() {
        service = new EmployeeManagementService(employeeRepository);
    }

    @Test
    void shouldUpdateSalarySuccessfully() {
        Employee mockEmp = new Employee(
                1L, "Jane", "Doe", "jane.doe@acme.corp",
                Department.ENGINEERING, Country.US, "Staff Engineer",
                BigDecimal.valueOf(160000), "USD", LocalDate.now(), OffsetDateTime.now()
        );

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(mockEmp));
        when(employeeRepository.updateSalary(eq(1L), any(BigDecimal.class)))
                .thenReturn(new Employee(1L, "Jane", "Doe", "jane.doe@acme.corp",
                        Department.ENGINEERING, Country.US, "Staff Engineer",
                        BigDecimal.valueOf(175000), "USD", LocalDate.now(), OffsetDateTime.now()));

        Employee updated = service.updateSalary(1L, BigDecimal.valueOf(175000));
        assertNotNull(updated);
        assertEquals(BigDecimal.valueOf(175000), updated.getSalary());
        verify(employeeRepository).updateSalary(1L, BigDecimal.valueOf(175000));
    }

    @Test
    void shouldRejectNegativeSalary() {
        Employee mockEmp = new Employee(
                1L, "Jane", "Doe", "jane.doe@acme.corp",
                Department.ENGINEERING, Country.US, "Staff Engineer",
                BigDecimal.valueOf(160000), "USD", LocalDate.now(), OffsetDateTime.now()
        );
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(mockEmp));

        assertThrows(DomainValidationException.class, () ->
                service.updateSalary(1L, BigDecimal.valueOf(-500))
        );
    }

    @Test
    void shouldExecuteBulkAdjustmentSuccessfully() {
        when(employeeRepository.bulkAdjustSalary("Engineering", "India", BigDecimal.valueOf(10.0)))
                .thenReturn(250);

        BulkAdjustmentCommand command = new BulkAdjustmentCommand("Engineering", "India", BigDecimal.valueOf(10.0));
        BulkAdjustmentResult result = service.bulkAdjustSalaries(command);

        assertEquals(250, result.affectedEmployees());
        assertEquals("Engineering", result.department());
        assertEquals("India", result.country());
        assertEquals(BigDecimal.valueOf(10.0), result.percentage());
    }

    @Test
    void shouldRejectExcessiveBulkPercentage() {
        assertThrows(DomainValidationException.class, () ->
                new BulkAdjustmentCommand("Sales", "US", BigDecimal.valueOf(800))
        );
    }
}
