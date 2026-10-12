import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit3, AlertCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate, getDepartmentStyle, getCountryFlag } from '../utils/formatters';

export default function EmployeeTable({
  employees,
  loading,
  sortBy,
  sortDir,
  onSort,
  onEditEmployee,
}) {
  const renderSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDir === 'desc'
      ? <ArrowDown className="w-3 h-3 text-brand-600 ml-1 inline" />
      : <ArrowUp className="w-3 h-3 text-brand-600 ml-1 inline" />;
  };

  const isMissingSalary = (salary) => Number(salary) <= 0;
  const isHighSalary = (salary) => Number(salary) > 500000;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3.5 pl-6 pr-3 cursor-pointer group select-none" onClick={() => onSort('id')}>
                <span className="flex items-center">ID {renderSortIcon('id')}</span>
              </th>
              <th scope="col" className="px-3 py-3.5 cursor-pointer group select-none" onClick={() => onSort('first_name')}>
                <span className="flex items-center">Employee {renderSortIcon('first_name')}</span>
              </th>
              <th scope="col" className="px-3 py-3.5 cursor-pointer group select-none" onClick={() => onSort('department')}>
                <span className="flex items-center">Department {renderSortIcon('department')}</span>
              </th>
              <th scope="col" className="px-3 py-3.5 cursor-pointer group select-none" onClick={() => onSort('country')}>
                <span className="flex items-center">Country {renderSortIcon('country')}</span>
              </th>
              <th scope="col" className="px-3 py-3.5 cursor-pointer group select-none" onClick={() => onSort('job_title')}>
                <span className="flex items-center">Job Title {renderSortIcon('job_title')}</span>
              </th>
              <th scope="col" className="px-3 py-3.5 text-right cursor-pointer group select-none" onClick={() => onSort('salary')}>
                <span className="flex items-center justify-end">Annual Salary {renderSortIcon('salary')}</span>
              </th>
              <th scope="col" className="px-3 py-3.5 cursor-pointer group select-none" onClick={() => onSort('hire_date')}>
                <span className="flex items-center">Hire Date {renderSortIcon('hire_date')}</span>
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-normal">
            {loading ? (
              // Skeletons
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 pl-6 pr-3"><div className="h-4 w-8 bg-slate-200 rounded"></div></td>
                  <td className="px-3 py-4"><div className="h-4 w-32 bg-slate-200 rounded"></div></td>
                  <td className="px-3 py-4"><div className="h-5 w-20 bg-slate-200 rounded-full"></div></td>
                  <td className="px-3 py-4"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>
                  <td className="px-3 py-4"><div className="h-4 w-28 bg-slate-200 rounded"></div></td>
                  <td className="px-3 py-4 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto"></div></td>
                  <td className="px-3 py-4"><div className="h-4 w-20 bg-slate-200 rounded"></div></td>
                  <td className="py-4 pl-3 pr-6 text-center"><div className="h-6 w-14 bg-slate-200 rounded mx-auto"></div></td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No employee records match the filter</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting or broadening your search parameters</p>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const missing = isMissingSalary(emp.salary);
                const high = isHighSalary(emp.salary);

                return (
                  <tr
                    key={emp.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      missing ? 'bg-rose-50/40' : high ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 pl-6 pr-3 font-mono text-xs text-slate-500">#{emp.id}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center shrink-0">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 leading-tight">{emp.fullName}</div>
                          <div className="text-xs text-slate-400 leading-tight">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDepartmentStyle(emp.department)}`}>
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-xs text-slate-600">
                      <span className="mr-1.5">{getCountryFlag(emp.country)}</span>
                      {emp.countryDisplayName || emp.country}
                    </td>
                    <td className="px-3 py-3.5 text-xs text-slate-700 font-medium">{emp.jobTitle}</td>
                    <td className="px-3 py-3.5 text-right font-mono text-xs">
                      {missing ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold bg-rose-100/70 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" />
                          {formatCurrency(0, emp.currency)} (Unassigned)
                        </span>
                      ) : high ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="font-bold text-amber-700">{formatCurrency(emp.salary, emp.currency)}</span>
                          <span className="text-[10px] text-amber-600 font-semibold tracking-tight uppercase">Outlier &gt;3x</span>
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-900">{formatCurrency(emp.salary, emp.currency)}</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-xs text-slate-500 font-mono">{formatDate(emp.hireDate)}</td>
                    <td className="py-3.5 pl-3 pr-6 text-center">
                      <button
                        id={`btn-adjust-salary-${emp.id}`}
                        onClick={() => onEditEmployee(emp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 rounded-lg transition-colors active:scale-95 shadow-xs"
                      >
                        <Edit3 className="w-3 h-3" />
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
