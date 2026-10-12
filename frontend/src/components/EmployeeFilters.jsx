import React from 'react';
import { Search, X, RotateCcw, Download, Filter } from 'lucide-react';

const DEPARTMENTS = ['All', 'Engineering', 'Product', 'Sales', 'HR', 'Finance'];
const COUNTRIES = [
  { code: 'ALL', name: 'All Countries' },
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'India', name: 'India' },
  { code: 'Germany', name: 'Germany' },
];

export default function EmployeeFilters({
  filters,
  onChange,
  onReset,
  onExportCsv,
  isExporting = false,
  totalResults = 0,
}) {
  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.department && filters.department !== 'ALL') ||
    (filters.country && filters.country !== 'ALL') ||
    filters.minSalary ||
    filters.maxSalary
  );

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="filter-search-input"
            type="text"
            placeholder="Search by name, email, or role..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns & Salary Range */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dept:</label>
            <select
              id="filter-department-select"
              value={filters.department || 'ALL'}
              onChange={(e) => onChange('department', e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept.toUpperCase() === 'ALL' ? 'ALL' : dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Country:</label>
            <select
              id="filter-country-select"
              value={filters.country || 'ALL'}
              onChange={(e) => onChange('country', e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Min Salary */}
          <div className="flex items-center gap-1">
            <input
              id="filter-min-salary"
              type="number"
              placeholder="Min $"
              value={filters.minSalary || ''}
              onChange={(e) => onChange('minSalary', e.target.value)}
              className="w-24 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              id="filter-max-salary"
              type="number"
              placeholder="Max $"
              value={filters.maxSalary || ''}
              onChange={(e) => onChange('maxSalary', e.target.value)}
              className="w-24 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          {/* Export active view button */}
          <button
            id="btn-export-active-csv"
            onClick={onExportCsv}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce text-brand-600' : 'text-slate-600'}`} />
            {isExporting ? 'Exporting...' : 'Export View'}
          </button>
        </div>
      </div>
    </div>
  );
}
