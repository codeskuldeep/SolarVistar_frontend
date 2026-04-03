import React from 'react';

/**
 * A reusable skeleton for HTML tables.
 * Renders pulse rows with specified number of columns.
 */
export const TableSkeleton = ({ columns = 5, rows = 5 }) => {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-dark-border last:border-0">
          {[...Array(columns)].map((_, j) => (
            <td key={j} className="px-6 py-4 whitespace-nowrap">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

/**
 * A reusable skeleton for mobile-style card layouts.
 * Renders pulsed cards with text blocks and action buttons.
 */
export const MobileCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2 w-2/3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-20"></div>
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-20"></div>
            <div className="flex-1"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
