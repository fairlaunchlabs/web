import React from 'react';
import { PaginationProps } from '../../types/types';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  hasMore = true,
}) => {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-base-content mr-4">
        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
      </div>
      <div className="join">
        <button
          className="join-item pagination-btn btn-sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          «
        </button>
        <button
          className="join-item pagination-btn btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        <button className="join-item pagination-btn btn-sm">
          Page {currentPage}
        </button>
        <button
          className="join-item pagination-btn btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasMore}
        >
          ›
        </button>
        <button
          className="join-item pagination-btn btn-sm"
          disabled
        >
          »
        </button>
      </div>
    </div>
  );
};
