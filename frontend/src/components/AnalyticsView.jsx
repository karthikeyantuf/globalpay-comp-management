import React from 'react';
import { DollarSign, TrendingUp, Users, AlertTriangle, RefreshCw, Globe, Building2 } from 'lucide-react';
import KpiCard from './KpiCard';
import AnomalyTable from './AnomalyTable';
import { formatCurrency, formatCompactCurrency, getDepartmentStyle, getCountryFlag } from '../utils/formatters';

export default function AnalyticsView({
  summary,
  loading,
  onRefresh,
  onResolveAnomaly,
}) {
  if (loading && !summary) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Aggregating global compensation audit metrics...</p>
      </div>
    );
  }

  const {
    totalHeadcount = 0,
    totalAnnualPayroll = 0,
    globalAverageSalary = 0,
    anomalyCount = 0,
    departmentDistribution = [],
    countryDistribution = [],
    anomalies = [],
  } = summary || {};

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Compensation Audit & Intelligence</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time aggregate payroll metrics, department distributions, and parity compliance
          </p>
        </div>
        <button
          id="btn-refresh-analytics"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : 'text-slate-500'}`} />
          Refresh Audit
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Annual Payroll"
          value={formatCompactCurrency(totalAnnualPayroll, 'USD')}
          subtitle={formatCurrency(totalAnnualPayroll, 'USD')}
          icon={DollarSign}
          color="brand"
        />
        <KpiCard
          title="Global Average Salary"
          value={formatCurrency(globalAverageSalary, 'USD')}
          subtitle="Mean compensation across all regions"
          icon={TrendingUp}
          color="emerald"
        />
        <KpiCard
          title="Total Headcount"
          value={totalHeadcount.toLocaleString()}
          subtitle="Active corporate employees"
          icon={Users}
          color="indigo"
        />
        <KpiCard
          title="Audit Anomalies"
          value={anomalyCount}
          subtitle="Missing or >3x salary outliers"
          icon={AlertTriangle}
          color={anomalyCount > 0 ? 'rose' : 'emerald'}
          badge={
            anomalyCount > 0
              ? { text: 'Needs Attention', color: 'bg-rose-100 text-rose-700 border-rose-200' }
              : { text: 'Optimal', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
          }
        />
      </div>

      {/* Department & Country Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-sm text-slate-900">Department Payroll Distribution</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">5 Departments</span>
          </div>

          <div className="space-y-3.5">
            {departmentDistribution.map((d) => {
              const totalVal = Number(totalAnnualPayroll) || 1;
              const deptPayroll = Number(d.totalPayroll) || 0;
              const percent = ((deptPayroll / totalVal) * 100).toFixed(1);

              return (
                <div key={d.department} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-semibold border ${getDepartmentStyle(d.department)}`}>
                        {d.department}
                      </span>
                      <span className="text-slate-500 font-medium">{d.headcount?.toLocaleString()} staff</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{formatCompactCurrency(d.totalPayroll)}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5 font-medium">({percent}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-brand-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Avg: <strong className="text-slate-700">{formatCurrency(d.averageSalary)}</strong></span>
                    <span>Range: {formatCurrency(d.minSalary)} - {formatCurrency(d.maxSalary)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Regional Parity Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">4 Countries</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {countryDistribution.map((c) => (
              <div key={c.country} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{getCountryFlag(c.country)}</span>
                    <span className="font-bold text-slate-900 text-xs">{c.country}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                    {c.currency}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Headcount:</span>
                    <span className="font-semibold text-slate-800">{c.headcount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Payroll:</span>
                    <span className="font-bold text-slate-900">{formatCompactCurrency(c.totalPayroll, c.currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Average:</span>
                    <span className="font-semibold text-emerald-700">{formatCurrency(c.averageSalary, c.currency)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged Anomalies Section */}
      <AnomalyTable anomalies={anomalies} onResolve={onResolveAnomaly} />
    </div>
  );
}
