import React, { useState, useEffect } from 'react';
import { X, TrendingUp, AlertTriangle, ArrowRight, DollarSign, Percent, Info } from 'lucide-react';
import { formatCurrency, getCurrencySymbol, getDepartmentStyle, getCountryFlag } from '../utils/formatters';

export default function EditSalaryModal({
  employee,
  deptAverage = 120000,
  isOpen,
  onClose,
  onSave,
}) {
  const [mode, setMode] = useState('total'); // 'total' | 'percent'
  const [newSalary, setNewSalary] = useState('');
  const [percentRaise, setPercentRaise] = useState('5.0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currency = employee?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);
  const currentVal = Number(employee?.salary || 0);
  const benchmarkVal = currentVal > 0 ? currentVal : (Number(deptAverage) > 0 ? Number(deptAverage) : 100000);

  useEffect(() => {
    if (employee) {
      const startingVal = currentVal > 0 ? currentVal : Math.round(benchmarkVal);
      setNewSalary(String(startingVal));
      setPercentRaise('5.0');
      setMode('total');
      setError('');
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  // Parse numerical salary
  const newVal = Number(newSalary || 0);
  const diffVal = newVal - currentVal;
  const diffPercent = currentVal > 0 
    ? ((diffVal / currentVal) * 100).toFixed(1) 
    : (((newVal - benchmarkVal) / benchmarkVal) * 100).toFixed(1);

  // Handle Preset Click (+5%, +10%, +15%, etc.)
  const handleApplyPreset = (percent) => {
    setError('');
    setPercentRaise(String(percent));
    const base = currentVal > 0 ? currentVal : benchmarkVal;
    const adjusted = Math.round(base * (1 + percent / 100));
    setNewSalary(String(adjusted));
  };

  // Handle percentage input change
  const handlePercentChange = (e) => {
    const val = e.target.value;
    setPercentRaise(val);
    const pct = parseFloat(val);
    if (!isNaN(pct)) {
      const base = currentVal > 0 ? currentVal : benchmarkVal;
      const adjusted = Math.round(base * (1 + pct / 100));
      setNewSalary(String(adjusted));
    }
  };

  // Handle direct salary input change
  const handleSalaryChange = (e) => {
    let raw = e.target.value;
    // If user enters percentage like "5%" or "+10%"
    if (raw.includes('%')) {
      const cleanPct = parseFloat(raw.replace(/[%+]/g, ''));
      if (!isNaN(cleanPct)) {
        handleApplyPreset(cleanPct);
        return;
      }
    }
    // Clean currency symbols or commas if pasted
    const cleanNum = raw.replace(/[^0-9.-]/g, '');
    setNewSalary(cleanNum);

    const parsedNum = parseFloat(cleanNum);
    if (!isNaN(parsedNum) && benchmarkVal > 0) {
      const derivedPct = (((parsedNum - benchmarkVal) / benchmarkVal) * 100).toFixed(1);
      setPercentRaise(derivedPct);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalAmount = Math.round(Number(newSalary));

    if (isNaN(finalAmount) || finalAmount < 0) {
      setError('Please enter a valid salary (0 or higher)');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onSave(employee.id, finalAmount);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update salary');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Adjust Employee Compensation</h3>
            <p className="text-xs text-slate-500 mt-0.5">Update compensation package for employee</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee Banner */}
        <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center">
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">{employee.fullName}</h4>
              <p className="text-xs text-slate-500">{employee.jobTitle}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getDepartmentStyle(employee.department)}`}>
              {employee.department}
            </span>
            <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
              <span>{getCountryFlag(employee.country)}</span>
              <span>{employee.countryDisplayName || employee.country}</span>
              <span className="text-[10px] bg-slate-200/70 text-slate-700 font-bold px-1.5 py-0.2 rounded font-mono">
                {currency} ({currencySymbol})
              </span>
            </span>
          </div>
        </div>

        {/* Benchmark notice if current salary is 0 */}
        {currentVal === 0 && (
          <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Starting Salary Assignment:</span> This employee has no current salary recorded. Quick percentage presets will calculate from the department benchmark ({formatCurrency(deptAverage, currency)}).
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Current Salary</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block font-mono">
                {currentVal > 0 ? formatCurrency(currentVal, currency) : (
                  <span className="text-rose-600 font-semibold">{currencySymbol}0 (Unassigned)</span>
                )}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Dept Benchmark</span>
              <span className="text-base font-bold text-slate-700 mt-0.5 block font-mono">
                {formatCurrency(deptAverage, currency)}
              </span>
            </div>
          </div>

          {/* Adjustment Mode Selector */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-semibold text-slate-700">Adjustment Mode</label>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setMode('total')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  mode === 'total'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Fixed Total ({currencySymbol})
              </button>
              <button
                type="button"
                onClick={() => setMode('percent')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  mode === 'percent'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Percentage (%)
              </button>
            </div>
          </div>

          {/* Input Fields depending on Mode */}
          {mode === 'total' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Annual Base Salary ({currency})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm font-mono">
                  {currencySymbol}
                </div>
                <input
                  id="input-new-salary"
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={newSalary}
                  onChange={handleSalaryChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
                  placeholder="Enter new compensation"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adjustment Percentage (%)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                  %
                </div>
                <input
                  id="input-percent-raise"
                  type="number"
                  step="any"
                  required
                  value={percentRaise}
                  onChange={handlePercentChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
                  placeholder="e.g. 5, 10, 15"
                />
              </div>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-400">Quick Increment Presets:</span>
              {currentVal > 0 && (
                <span className="text-[11px] text-slate-400">Based on current salary</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyPreset(5)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  percentRaise === '5' || percentRaise === '5.0'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                +5%
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(10)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  percentRaise === '10' || percentRaise === '10.0'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                +10%
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(15)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  percentRaise === '15' || percentRaise === '15.0'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                +15%
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(20)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  percentRaise === '20' || percentRaise === '20.0'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                +20%
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewSalary(String(Math.round(deptAverage)));
                  if (benchmarkVal > 0) {
                    setPercentRaise((((deptAverage - benchmarkVal) / benchmarkVal) * 100).toFixed(1));
                  }
                }}
                className="px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors ml-auto"
              >
                Match Dept Benchmark
              </button>
            </div>
          </div>

          {/* Delta feedback & Live Projection */}
          {newVal > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-500">
                <span>Calculated Total Base:</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {formatCurrency(newVal, currency)}
                </span>
              </div>
              {currentVal > 0 && newVal !== currentVal && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-600 font-medium">Adjustment Impact:</span>
                  <span className={`font-bold font-mono ${diffVal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {diffVal >= 0 ? '+' : ''}{formatCurrency(diffVal, currency)} ({diffVal >= 0 ? '+' : ''}{diffPercent}%)
                  </span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-save-salary"
              type="submit"
              disabled={saving || !newSalary}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-600/30 transition-all disabled:opacity-50 active:scale-95"
            >
              {saving ? 'Updating...' : `Save ${formatCurrency(newVal, currency)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
