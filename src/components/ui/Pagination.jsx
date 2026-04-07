import React from 'react';

const Pagination = ({ meta, isLoading, onPageChange, itemName = "items" }) => {
  if (!meta || meta.totalPages <= 1) return null;

  const startItem = (meta.currentPage - 1) * meta.itemsPerPage + 1;
  const endItem = Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border gap-4 sm:gap-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
        Showing <span className="font-semibold text-gray-900 dark:text-white">{startItem}</span> to <span className="font-semibold text-gray-900 dark:text-white">{endItem}</span> of <span className="font-semibold text-gray-900 dark:text-white">{meta.totalItems}</span> {itemName}
      </span>
      
      <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
        <button
          onClick={() => onPageChange(meta.currentPage - 1)}
          disabled={meta.currentPage === 1 || isLoading}
          className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Page {meta.currentPage} of {meta.totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(meta.currentPage + 1)}
          disabled={meta.currentPage === meta.totalPages || isLoading}
          className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
