import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 20,
  totalRecords = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const [jumpPage, setJumpPage] = useState('');

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setJumpPage('');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      {/* Record summary */}
      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-800 font-semibold">{startRecord.toLocaleString()}</strong> to{' '}
          <strong className="text-slate-800 font-semibold">{endRecord.toLocaleString()}</strong> of{' '}
          <strong className="text-slate-800 font-semibold">{totalRecords.toLocaleString()}</strong> employees
        </span>

        {/* Page size dropdown */}
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
          <span>Rows per page:</span>
          <select
            id="pagination-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        {/* Direct page jump */}
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 mr-2 text-xs text-slate-500">
          <span>Go to:</span>
          <input
            id="pagination-jump-input"
            type="number"
            min={1}
            max={totalPages}
            placeholder={String(currentPage)}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-center text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center space-x-1">
          <button
            id="btn-page-first"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            id="btn-page-prev"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>

          <button
            id="btn-page-next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            id="btn-page-last"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
