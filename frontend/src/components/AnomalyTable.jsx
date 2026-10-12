import React from 'react';
import { AlertTriangle, AlertCircle, Wrench, ShieldAlert } from 'lucide-react';
import { formatCurrency, getDepartmentStyle, getCountryFlag } from '../utils/formatters';

export default function AnomalyTable({ anomalies = [], onResolve }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-200/80 text-center">
        <ShieldAlert className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
        <h4 className="font-semibold text-emerald-900 text-sm">No Compensation Anomalies Detected</h4>
        <p className="text-xs text-emerald-700 mt-1">All employee salaries conform to standard department parity bounds.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Compensation Audit: Flagged Anomalies</h3>
            <p className="text-xs text-slate-500">
              {anomalies.length} records requiring HR compliance or parity review
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          {anomalies.length} Action Items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 pl-6 pr-3">Employee</th>
              <th className="px-3 py-3">Department</th>
              <th className="px-3 py-3">Country</th>
              <th className="px-3 py-3 text-right">Current Salary</th>
              <th className="px-3 py-3 text-right">Dept Average</th>
              <th className="px-3 py-3">Anomaly Flag</th>
              <th className="py-3 pl-3 pr-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {anomalies.map((item) => {
              const isMissing = item.anomalyType === 'MISSING_SALARY';

              return (
                <tr key={item.employeeId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pl-6 pr-3">
                    <div className="font-semibold text-slate-900 leading-tight">{item.employeeName}</div>
                    <div className="text-xs text-slate-400 font-mono">{item.email}</div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDepartmentStyle(item.department)}`}>
                      {item.department}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-xs text-slate-600">
                    <span className="mr-1.5">{getCountryFlag(item.country)}</span>
                    {item.country}
                  </td>
                  <td className="px-3 py-3.5 text-right font-mono text-xs">
                    {isMissing ? (
                      <span className="text-rose-600 font-bold">{formatCurrency(0, item.currency)}</span>
                    ) : (
                      <span className="text-amber-800 font-bold">{formatCurrency(item.salary, item.currency)}</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-right font-mono text-xs text-slate-500">
                    {formatCurrency(item.departmentAverage, item.currency)}
                  </td>
                  <td className="px-3 py-3.5">
                    {isMissing ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        Unassigned ({formatCurrency(0, item.currency)})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        Outlier ({item.ratio}x Dept Avg)
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pl-3 pr-6 text-center">
                    <button
                      id={`btn-resolve-anomaly-${item.employeeId}`}
                      onClick={() => onResolve(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors active:scale-95"
                    >
                      <Wrench className="w-3 h-3 text-brand-600" />
                      Resolve
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
