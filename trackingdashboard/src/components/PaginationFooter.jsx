import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationFooter({
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  pageSizeOptions = [8, 15, 25, 50, 100],
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Smart Enterprise Pagination Range Logic (with Ellipsis '...')
  const getPaginationRange = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = Array.from({ length: 4 }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = Array.from({ length: 4 }, (_, i) => totalPages - 4 + i + 1);
      return [1, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = [currentPage - 1, currentPage, currentPage + 1];
      return [1, '...', ...middleRange, '...', totalPages];
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  const paginationRange = getPaginationRange();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 24px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        flexWrap: 'wrap',
        gap: '16px',
        borderRadius: '0 0 12px 12px',
      }}
    >
      {/* Entries Counter Text */}
      <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
        Showing <strong style={{ color: '#0f172a', fontWeight: 800 }}>{startIndex.toLocaleString()}</strong> to{' '}
        <strong style={{ color: '#0f172a', fontWeight: 800 }}>{endIndex.toLocaleString()}</strong> of{' '}
        <strong style={{ color: '#0f172a', fontWeight: 800 }}>{totalItems.toLocaleString()}</strong> entries
      </span>

      {/* Separator and Rows Dropdown Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.88rem', color: '#64748b' }}>| Rows:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#0f172a',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt} per page
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Controls: Previous, Page Numbers (with Ellipsis), Next */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{
            padding: '6px 14px',
            fontSize: '0.85rem',
            fontWeight: 500,
            borderRadius: '8px',
            border: '1px solid #f1f5f9',
            backgroundColor: currentPage === 1 ? '#f8fafc' : '#ffffff',
            color: currentPage === 1 ? '#cbd5e1' : '#475569',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
        >
          <ChevronLeft size={14} /> Previous
        </button>

        {/* Dynamic Page Buttons / Ellipsis */}
        {paginationRange.map((item, idx) => {
          if (item === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '0 6px',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  userSelect: 'none',
                }}
              >
                ...
              </span>
            );
          }

          const pageNum = Number(item);
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              style={{
                minWidth: '34px',
                height: '34px',
                padding: '0 10px',
                borderRadius: '8px',
                border: isActive ? 'none' : '1px solid #cbd5e1',
                backgroundColor: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#0f172a',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isActive ? '0 2px 4px rgba(37,99,235,0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalItems === 0}
          style={{
            padding: '6px 14px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: currentPage === totalPages || totalItems === 0 ? '#f8fafc' : '#eff6ff',
            color: currentPage === totalPages || totalItems === 0 ? '#cbd5e1' : '#1d4ed8',
            cursor: currentPage === totalPages || totalItems === 0 ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
