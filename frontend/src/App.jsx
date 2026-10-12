import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import EmployeeFilters from './components/EmployeeFilters';
import EmployeeTable from './components/EmployeeTable';
import Pagination from './components/Pagination';
import EditSalaryModal from './components/EditSalaryModal';
import BulkRevisionModal from './components/BulkRevisionModal';
import AnalyticsView from './components/AnalyticsView';
import Toast from './components/Toast';
import { formatCurrency } from './utils/formatters';
import {
  fetchEmployees,
  updateEmployeeSalary,
  bulkAdjustSalaries,
  fetchAuditSummary,
  downloadFilteredCsv,
} from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('directory');

  // Filter & Pagination State
  const [filters, setFilters] = useState({
    page: 1,
    size: 20,
    search: '',
    department: 'ALL',
    country: 'ALL',
    minSalary: '',
    maxSalary: '',
    sortBy: 'id',
    sortDir: 'asc',
  });

  // Data states
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ totalRecords: 10000, totalPages: 500, currentPage: 1, pageSize: 20 });
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Modals state
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deptAverageForModal, setDeptAverageForModal] = useState(120000);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', title = '') => {
    setToast({ message, type, title });
  };

  // 1. Fetch Employees
  const loadEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      const sortParam = filters.sortDir === 'desc' ? `-${filters.sortBy}` : filters.sortBy;
      const res = await fetchEmployees({
        page: filters.page,
        size: filters.size,
        search: filters.search,
        department: filters.department,
        country: filters.country,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        sort: sortParam,
      });

      setEmployees(res.employees);
      setMeta(res.meta);
    } catch (err) {
      showToast(err.message || 'Failed to load employee directory', 'error', 'Error');
    } finally {
      setLoadingEmployees(false);
    }
  }, [filters]);

  // 2. Fetch Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetchAuditSummary();
      setAnalytics(res.summary);
    } catch (err) {
      showToast(err.message || 'Failed to calculate compensation audit', 'error', 'Analytics Error');
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Initial load & debounced reload on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadEmployees]);

  // Load analytics when switching to analytics tab or on initial mount
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Filter change handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // reset to first page on filter change
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      size: 20,
      search: '',
      department: 'ALL',
      country: 'ALL',
      minSalary: '',
      maxSalary: '',
      sortBy: 'id',
      sortDir: 'asc',
    });
  };

  const handleSort = (column) => {
    setFilters((prev) => {
      const isSameCol = prev.sortBy === column;
      return {
        ...prev,
        sortBy: column,
        sortDir: isSameCol && prev.sortDir === 'asc' ? 'desc' : 'asc',
        page: 1,
      };
    });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size) => {
    setFilters((prev) => ({ ...prev, size, page: 1 }));
  };

  // 3. Save Salary Adjustment
  const handleSaveSalary = async (id, newSalary) => {
    const updated = await updateEmployeeSalary(id, newSalary);
    const currency = updated.currency || editingEmployee?.currency || 'USD';
    showToast(
      `Updated ${updated.fullName || 'employee'}'s compensation to ${formatCurrency(newSalary, currency)}`,
      'success',
      'Salary Adjusted'
    );
    loadEmployees();
    loadAnalytics();
  };

  // 4. Execute Bulk Salary Revision
  const handleExecuteBulk = async (command) => {
    const res = await bulkAdjustSalaries(command);
    showToast(
      `Successfully adjusted salaries for ${res.affectedEmployees?.toLocaleString()} matching records!`,
      'success',
      'Bulk Revision Applied'
    );
    loadEmployees();
    loadAnalytics();
    return res;
  };

  // 5. Trigger CSV Export
  const handleExportCsv = () => {
    try {
      setIsExporting(true);
      downloadFilteredCsv({
        search: filters.search,
        department: filters.department,
        country: filters.country,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        sort: filters.sortDir === 'desc' ? `-${filters.sortBy}` : filters.sortBy,
      });
      showToast('Export stream initiated. Downloading CSV file...', 'info', 'CSV Export');
    } catch (err) {
      showToast('Failed to trigger CSV export', 'error', 'Export Error');
    } finally {
      setTimeout(() => setIsExporting(false), 1200);
    }
  };

  // 6. Open Edit Modal for Employee
  const handleOpenEdit = (emp) => {
    // Lookup department average from analytics if available
    let deptAvg = 120000;
    if (analytics && analytics.departmentDistribution) {
      const match = analytics.departmentDistribution.find(
        (d) => d.department?.toLowerCase() === emp.department?.toLowerCase()
      );
      if (match && match.averageSalary) {
        deptAvg = Number(match.averageSalary);
      }
    }
    setDeptAverageForModal(deptAvg);
    setEditingEmployee(emp);
  };

  // 7. Resolve Anomaly directly from Audit Table
  const handleResolveAnomaly = (anomaly) => {
    const emp = {
      id: anomaly.employeeId,
      fullName: anomaly.employeeName,
      firstName: anomaly.employeeName?.split(' ')?.[0] || 'Employee',
      lastName: anomaly.employeeName?.split(' ')?.[1] || '',
      email: anomaly.email,
      department: anomaly.department,
      country: anomaly.country,
      jobTitle: anomaly.jobTitle,
      salary: anomaly.salary,
      currency: anomaly.currency,
    };
    setDeptAverageForModal(Number(anomaly.departmentAverage || 120000));
    setEditingEmployee(emp);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onExportCsv={handleExportCsv}
        totalEmployees={meta.totalRecords || 10000}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'directory' ? (
          <div>
            {/* Filter Bar */}
            <EmployeeFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              onExportCsv={handleExportCsv}
              isExporting={isExporting}
              totalResults={meta.totalRecords}
            />

            {/* Paginated Employee Table */}
            <EmployeeTable
              employees={employees}
              loading={loadingEmployees}
              sortBy={filters.sortBy}
              sortDir={filters.sortDir}
              onSort={handleSort}
              onEditEmployee={handleOpenEdit}
            />

            {/* Server-side Pagination controls */}
            <Pagination
              currentPage={meta.currentPage}
              totalPages={meta.totalPages}
              pageSize={meta.pageSize}
              totalRecords={meta.totalRecords}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        ) : (
          <AnalyticsView
            summary={analytics}
            loading={loadingAnalytics}
            onRefresh={loadAnalytics}
            onResolveAnomaly={handleResolveAnomaly}
          />
        )}
      </main>



      {/* Edit Salary Modal */}
      <EditSalaryModal
        isOpen={Boolean(editingEmployee)}
        employee={editingEmployee}
        deptAverage={deptAverageForModal}
        onClose={() => setEditingEmployee(null)}
        onSave={handleSaveSalary}
      />

      {/* Bulk Revision Engine Modal */}
      <BulkRevisionModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onExecute={handleExecuteBulk}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
