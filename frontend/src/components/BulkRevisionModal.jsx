import React, { useState } from 'react';
import { X, Sliders, CheckCircle2 } from 'lucide-react';

const DEPARTMENTS = ['All', 'Engineering', 'Product', 'Sales', 'HR', 'Finance'];
const COUNTRIES = [
  { code: 'ALL', name: 'All Countries' },
  { code: 'US', name: 'United States (US)' },
  { code: 'UK', name: 'United Kingdom (UK)' },
  { code: 'India', name: 'India' },
  { code: 'Germany', name: 'Germany' },
];

export default function BulkRevisionModal({
  isOpen,
  onClose,
  onExecute,
}) {
  const [department, setDepartment] = useState('Engineering');
  const [country, setCountry] = useState('India');
  const [percentage, setPercentage] = useState('10.0');
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleApplyPreset = (val) => {
    setPercentage(String(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pct = parseFloat(percentage);
    if (isNaN(pct) || pct < -100 || pct > 500) {
      setError('Percentage must be between -100% and +500%');
      return;
    }

    try {
      setExecuting(true);
      setError('');
      setResult(null);
      const res = await onExecute({
        department: department === 'All' ? null : department,
        country: country === 'ALL' ? null : country,
        percentage: pct,
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Bulk revision failed');
    } finally {
      setExecuting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 rounded-2xl text-brand-600 border border-brand-100">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Bulk Salary Revision</h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Revision Executed Successfully!</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Applied a <span className="font-semibold text-slate-800">+{result.percentage}%</span> adjustment across{' '}
              <strong className="text-emerald-700 font-bold">{result.affectedEmployees?.toLocaleString()}</strong> employees.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 w-full max-w-xs space-y-1">
              <div className="flex justify-between">
                <span>Target Department:</span>
                <span className="font-semibold">{result.department || 'All Departments'}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Country:</span>
                <span className="font-semibold">{result.country || 'All Countries'}</span>
              </div>
              <div className="flex justify-between">
                <span>Affected Records:</span>
                <span className="font-semibold text-brand-700">{result.affectedEmployees} rows</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              Done & Refresh View
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Target Cohort Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department</label>
                <select
                  id="bulk-dept-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Departments' : d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Country</label>
                <select
                  id="bulk-country-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Percentage Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Salary Adjustment Percentage</label>
                <span className="text-xs font-bold text-brand-600">{percentage}%</span>
              </div>
              <div className="relative">
                <input
                  id="bulk-percentage-input"
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 8.5"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  %
                </div>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] font-medium text-slate-400 mr-1">Presets:</span>
                {[3, 5, 8, 10, 12, 15].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleApplyPreset(val)}
                    className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                      percentage === String(val)
                        ? 'bg-brand-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    +{val}%
                  </button>
                ))}
              </div>
            </div>



            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={executing}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-bulk-revision"
                type="submit"
                disabled={executing || !percentage}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-600/30 transition-all disabled:opacity-50 active:scale-95"
              >
                {executing ? 'Executing Transaction...' : `Apply ${percentage}% Raise`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
