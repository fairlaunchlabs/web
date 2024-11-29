import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    onPageChange,
}) => {
    return (
        <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-base-content">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </div>
            <div className="join">
                <button 
                    className="join-item btn btn-sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                >
                    «
                </button>
                <button 
                    className="join-item btn btn-sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ‹
                </button>
                <button className="join-item btn btn-sm">
                    Page {currentPage} of {totalPages}
                </button>
                <button 
                    className="join-item btn btn-sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    ›
                </button>
                <button 
                    className="join-item btn btn-sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    »
                </button>
            </div>
        </div>
    );
};
