import React from 'react';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  activeTab: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  activeTab,
}) => {
  // Calculate which page numbers to show
  const getVisiblePages = () => {
    if (totalPages <= 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage === 1) {
      return [1, 2];
    }

    if (currentPage === totalPages) {
      return [totalPages - 1, totalPages];
    }

    return [currentPage, currentPage + 1];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled' : ''}`}
      >
        Previous
      </button>

      {visiblePages.map(pageNum => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`btn btn-sm ${currentPage === pageNum ? 'btn-active' : ''}`}
        >
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled' : ''}`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
