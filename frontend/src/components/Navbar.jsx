import React from 'react';
import { Users, BarChart3, Sliders, ShieldCheck, Download } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenBulkModal, onExportCsv, totalEmployees = 10000 }) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">GlobalPay <span className="text-brand-600">HR</span></span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Live {totalEmployees.toLocaleString()} Records
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">ACME Corp • Compensation Management Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              id="nav-tab-directory"
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'directory'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Employee Directory
            </button>
            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Audit & Analytics
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-quick-export"
              onClick={onExportCsv}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
              title="Export active records to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              id="btn-open-bulk-revision"
              onClick={onOpenBulkModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/30 active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              Bulk Salary Revision
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
