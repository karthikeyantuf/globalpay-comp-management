package com.globalpay.compensation.adapters.inbound.rest;

import com.globalpay.compensation.adapters.inbound.rest.dto.BulkAdjustRequest;
import com.globalpay.compensation.adapters.inbound.rest.dto.EmployeeAttributesDto;
import com.globalpay.compensation.adapters.inbound.rest.dto.JsonApiResource;
import com.globalpay.compensation.adapters.inbound.rest.dto.JsonApiResponse;
import com.globalpay.compensation.adapters.inbound.rest.dto.UpdateSalaryRequest;
import com.globalpay.compensation.domain.exception.DomainValidationException;
import com.globalpay.compensation.domain.model.BulkAdjustmentCommand;
import com.globalpay.compensation.domain.model.BulkAdjustmentResult;
import com.globalpay.compensation.domain.model.Employee;
import com.globalpay.compensation.domain.model.EmployeeQuery;
import com.globalpay.compensation.domain.model.PageResult;
import com.globalpay.compensation.ports.inbound.EmployeeManagementUseCase;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeManagementUseCase employeeManagementUseCase;

    public EmployeeController(EmployeeManagementUseCase employeeManagementUseCase) {
        this.employeeManagementUseCase = employeeManagementUseCase;
    }

    @GetMapping(produces = "application/vnd.api+json")
    public ResponseEntity<JsonApiResponse<List<JsonApiResource<EmployeeAttributesDto>>>> getEmployees(
            @RequestParam(name = "page[number]", required = false) Integer pageNumber,
            @RequestParam(name = "page", required = false) Integer pageParam,
            @RequestParam(name = "page[size]", required = false) Integer pageSize,
            @RequestParam(name = "size", required = false) Integer sizeParam,
            @RequestParam(name = "filter[search]", required = false) String filterSearch,
            @RequestParam(name = "search", required = false) String searchParam,
            @RequestParam(name = "q", required = false) String qParam,
            @RequestParam(name = "filter[department]", required = false) String filterDept,
            @RequestParam(name = "department", required = false) String deptParam,
            @RequestParam(name = "filter[country]", required = false) String filterCountry,
            @RequestParam(name = "country", required = false) String countryParam,
            @RequestParam(name = "filter[minSalary]", required = false) BigDecimal filterMinSalary,
            @RequestParam(name = "minSalary", required = false) BigDecimal minSalaryParam,
            @RequestParam(name = "filter[maxSalary]", required = false) BigDecimal filterMaxSalary,
            @RequestParam(name = "maxSalary", required = false) BigDecimal maxSalaryParam,
            @RequestParam(name = "sort", required = false) String sort
    ) {
        int page = pageNumber != null ? pageNumber : (pageParam != null ? pageParam : 1);
        int size = pageSize != null ? pageSize : (sizeParam != null ? sizeParam : 20);
        String search = (filterSearch != null && !filterSearch.isBlank()) ? filterSearch : (searchParam != null && !searchParam.isBlank() ? searchParam : qParam);
        String department = (filterDept != null && !filterDept.isBlank()) ? filterDept : deptParam;
        String country = (filterCountry != null && !filterCountry.isBlank()) ? filterCountry : countryParam;
        BigDecimal minSalary = filterMinSalary != null ? filterMinSalary : minSalaryParam;
        BigDecimal maxSalary = filterMaxSalary != null ? filterMaxSalary : maxSalaryParam;

        String sortBy = "id";
        String sortDir = "asc";
        if (sort != null && !sort.isBlank()) {
            if (sort.startsWith("-")) {
                sortDir = "desc";
                sortBy = sort.substring(1);
            } else {
                sortBy = sort;
            }
        }

        EmployeeQuery query = new EmployeeQuery(search, department, country, minSalary, maxSalary, page, size, sortBy, sortDir);
        PageResult<Employee> result = employeeManagementUseCase.getEmployees(query);

        List<JsonApiResource<EmployeeAttributesDto>> resources = result.content().stream()
                .map(emp -> JsonApiResource.of("employees", String.valueOf(emp.getId()), EmployeeAttributesDto.fromDomain(emp)))
                .toList();

        Map<String, Object> meta = Map.of(
                "totalRecords", result.totalRecords(),
                "totalPages", result.totalPages(),
                "currentPage", result.currentPage(),
                "pageSize", result.pageSize()
        );

        Map<String, String> links = buildPaginationLinks(result, query);

        return ResponseEntity.ok(JsonApiResponse.of(resources, meta, links));
    }

    @GetMapping(value = "/{id}", produces = "application/vnd.api+json")
    public ResponseEntity<JsonApiResponse<JsonApiResource<EmployeeAttributesDto>>> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeManagementUseCase.getEmployeeById(id);
        JsonApiResource<EmployeeAttributesDto> resource = JsonApiResource.of(
                "employees",
                String.valueOf(employee.getId()),
                EmployeeAttributesDto.fromDomain(employee)
        );
        return ResponseEntity.ok(JsonApiResponse.of(resource));
    }

    @PutMapping(value = "/{id}", produces = "application/vnd.api+json")
    public ResponseEntity<JsonApiResponse<JsonApiResource<EmployeeAttributesDto>>> updateSalary(
            @PathVariable Long id,
            @RequestBody UpdateSalaryRequest request
    ) {
        BigDecimal newSalary = request.getResolvedSalary();
        if (newSalary == null) {
            throw new DomainValidationException("Salary attribute is required in request body");
        }

        Employee updated = employeeManagementUseCase.updateSalary(id, newSalary);
        JsonApiResource<EmployeeAttributesDto> resource = JsonApiResource.of(
                "employees",
                String.valueOf(updated.getId()),
                EmployeeAttributesDto.fromDomain(updated)
        );

        return ResponseEntity.ok(JsonApiResponse.of(resource));
    }

    @PostMapping(value = "/bulk-adjust", produces = "application/vnd.api+json")
    public ResponseEntity<JsonApiResponse<JsonApiResource<BulkAdjustmentResult>>> bulkAdjust(
            @RequestBody BulkAdjustRequest request
    ) {
        BigDecimal percentage = request.getResolvedPercentage();
        if (percentage == null) {
            throw new DomainValidationException("Adjustment percentage is required");
        }

        BulkAdjustmentCommand command = new BulkAdjustmentCommand(
                request.getResolvedDepartment(),
                request.getResolvedCountry(),
                percentage
        );

        BulkAdjustmentResult result = employeeManagementUseCase.bulkAdjustSalaries(command);
        JsonApiResource<BulkAdjustmentResult> resource = JsonApiResource.of(
                "bulk-adjustments",
                "latest",
                result
        );

        return ResponseEntity.ok(JsonApiResponse.of(resource));
    }

    @GetMapping(value = "/export-csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(name = "filter[search]", required = false) String filterSearch,
            @RequestParam(name = "search", required = false) String searchParam,
            @RequestParam(name = "q", required = false) String qParam,
            @RequestParam(name = "filter[department]", required = false) String filterDept,
            @RequestParam(name = "department", required = false) String deptParam,
            @RequestParam(name = "filter[country]", required = false) String filterCountry,
            @RequestParam(name = "country", required = false) String countryParam,
            @RequestParam(name = "filter[minSalary]", required = false) BigDecimal filterMinSalary,
            @RequestParam(name = "minSalary", required = false) BigDecimal minSalaryParam,
            @RequestParam(name = "filter[maxSalary]", required = false) BigDecimal filterMaxSalary,
            @RequestParam(name = "maxSalary", required = false) BigDecimal maxSalaryParam,
            @RequestParam(name = "sort", required = false) String sort
    ) {
        String search = (filterSearch != null && !filterSearch.isBlank()) ? filterSearch : (searchParam != null && !searchParam.isBlank() ? searchParam : qParam);
        String department = (filterDept != null && !filterDept.isBlank()) ? filterDept : deptParam;
        String country = (filterCountry != null && !filterCountry.isBlank()) ? filterCountry : countryParam;
        BigDecimal minSalary = filterMinSalary != null ? filterMinSalary : minSalaryParam;
        BigDecimal maxSalary = filterMaxSalary != null ? filterMaxSalary : maxSalaryParam;
        String sortBy = "id";
        String sortDir = "asc";
        if (sort != null && !sort.isBlank()) {
            if (sort.startsWith("-")) {
                sortDir = "desc";
                sortBy = sort.substring(1);
            } else {
                sortBy = sort;
            }
        }

        EmployeeQuery query = new EmployeeQuery(search, department, country, minSalary, maxSalary, 1, 100000, sortBy, sortDir);
        byte[] csvData = employeeManagementUseCase.exportEmployeesCsv(query);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "globalpay-employees-export.csv");

        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }

    private Map<String, String> buildPaginationLinks(PageResult<Employee> page, EmployeeQuery query) {
        Map<String, String> links = new HashMap<>();
        String base = "/api/employees?page[size]=" + page.pageSize();
        if (query.getDepartment() != null) base += "&filter[department]=" + query.getDepartment();
        if (query.getCountry() != null) base += "&filter[country]=" + query.getCountry();
        if (query.getSearch() != null) base += "&filter[search]=" + query.getSearch();

        links.put("self", base + "&page[number]=" + page.currentPage());
        links.put("first", base + "&page[number]=1");
        links.put("last", base + "&page[number]=" + Math.max(1, page.totalPages()));

        if (page.currentPage() > 1) {
            links.put("prev", base + "&page[number]=" + (page.currentPage() - 1));
        }
        if (page.currentPage() < page.totalPages()) {
            links.put("next", base + "&page[number]=" + (page.currentPage() + 1));
        }
        return links;
    }
}
