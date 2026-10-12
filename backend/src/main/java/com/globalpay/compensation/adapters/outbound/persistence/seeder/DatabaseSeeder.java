package com.globalpay.compensation.adapters.outbound.persistence.seeder;

import com.globalpay.compensation.domain.model.Country;
import com.globalpay.compensation.domain.model.Department;
import com.globalpay.compensation.domain.model.Employee;
import com.globalpay.compensation.ports.outbound.EmployeeRepositoryPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);
    private final EmployeeRepositoryPort employeeRepository;

    public DatabaseSeeder(EmployeeRepositoryPort employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    private static final String[] FIRST_NAMES = {
            "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth",
            "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
            "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra",
            "Aarav", "Aanya", "Vivaan", "Diya", "Reyansh", "Ananya", "Ishaan", "Isha", "Rohan", "Pooja",
            "Aditya", "Neha", "Vikram", "Sneha", "Karan", "Kavya", "Siddharth", "Priya", "Rahul", "Tanvi",
            "Lukas", "Leon", "Finn", "Elias", "Jonas", "Emilia", "Mia", "Sophia", "Hannah", "Emma",
            "Oliver", "George", "Arthur", "Noah", "Muhammad", "Olivia", "Amelia", "Isla", "Ava", "Freya"
    };

    private static final String[] LAST_NAMES = {
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
            "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
            "Sharma", "Patel", "Verma", "Gupta", "Mehta", "Iyer", "Rao", "Nair", "Reddy", "Kulkarni",
            "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann",
            "Davies", "Evans", "Thomas", "Roberts", "Walker", "Wright", "Robinson", "Thompson", "White", "Hughes"
    };

    private static final String[][] TITLES_BY_DEPT = {
            // Engineering
            { "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Architect", "DevOps Engineer", "Site Reliability Engineer", "Frontend Architect", "QA Automation Engineer" },
            // Product
            { "Associate Product Manager", "Product Manager", "Senior Product Manager", "Principal Product Manager", "Product Designer", "Staff UX Researcher", "Design Director" },
            // Sales
            { "Sales Development Rep", "Account Executive", "Senior Enterprise AE", "Sales Engineering Specialist", "Strategic Account Director", "VP of Commercial Sales", "Customer Success Manager" },
            // HR
            { "People Operations Specialist", "HR Business Partner", "Senior HRBP", "Compensation & Benefits Lead", "Talent Acquisition Specialist", "Director of People Ops" },
            // Finance
            { "Financial Analyst", "Senior Financial Analyst", "Payroll Specialist", "Internal Audit Lead", "FP&A Manager", "Controller", "Corporate Treasurer" }
    };

    @Override
    public void run(String... args) {
        long currentCount = employeeRepository.countEmployees();
        if (currentCount > 0) {
            log.info("Database already contains {} employee records. Skipping initial seeding.", currentCount);
            return;
        }

        log.info("Starting jOOQ batch seeding of 10,000 employee records across 5 departments and 4 countries...");
        long startTime = System.currentTimeMillis();

        Department[] departments = Department.values();
        Country[] countries = Country.values();
        Random random = new Random(42); // fixed seed for reproducible realistic dataset

        List<Employee> batchList = new ArrayList<>(10000);

        for (int i = 1; i <= 10000; i++) {
            String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            String email = (firstName.toLowerCase() + "." + lastName.toLowerCase() + i + "@acme.corp");

            int deptIdx = random.nextInt(departments.length);
            Department department = departments[deptIdx];
            Country country = countries[random.nextInt(countries.length)];

            String[] titles = TITLES_BY_DEPT[deptIdx];
            String title = titles[random.nextInt(titles.length)];

            BigDecimal salary;
            // Introduce deliberate anomalies:
            // 1) Exactly 15 missing/zero salaries
            if (i <= 15) {
                salary = BigDecimal.ZERO;
            }
            // 2) Exactly 20 extreme outliers (> 3x department average)
            else if (i <= 35) {
                salary = BigDecimal.valueOf(650000 + random.nextInt(450000)); // $650k - $1.1M
            }
            // 3) Normal realistic distribution per country
            else {
                double base = switch (country) {
                    case US -> 85000 + random.nextInt(110000); // 85k - 195k USD
                    case UK -> 55000 + random.nextInt(85000);  // 55k - 140k GBP
                    case GERMANY -> 60000 + random.nextInt(80000); // 60k - 140k EUR
                    case INDIA -> 40000 + random.nextInt(75000);   // USD equivalent 40k - 115k
                };
                // Department level weighting (Engineering/Product slightly higher than HR/Sales base)
                if (department == Department.ENGINEERING || department == Department.PRODUCT) {
                    base *= 1.20;
                }
                salary = BigDecimal.valueOf(base).setScale(2, RoundingMode.HALF_UP);
            }

            LocalDate hireDate = LocalDate.now().minusDays(random.nextInt(365 * 6) + 30);

            Employee employee = new Employee(
                    null,
                    firstName,
                    lastName,
                    email,
                    department,
                    country,
                    title,
                    salary,
                    country.getDefaultCurrency(),
                    hireDate,
                    OffsetDateTime.now()
            );

            batchList.add(employee);
        }

        employeeRepository.batchInsert(batchList);
        long elapsed = System.currentTimeMillis() - startTime;
        log.info("Successfully seeded 10,000 employee records via jOOQ batch execution in {}ms!", elapsed);
    }
}
