import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { XMarkIcon } from "@heroicons/react/24/outline"

interface PaginationComponentProps {
  totalCount: number;
  activeCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  pageSize,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pageInput, setPageInput] = useState("");

  const renderPaginationItems = () => {
    const pages = [];
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage <= 3) {
      startPage = 2;
      endPage = Math.min(5, totalPages - 1);
    }

    if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 4, 2);
      endPage = totalPages - 1;
    }

    const PageButton = ({ page, isActive }: { page: number; isActive: boolean }) => (
      <button
        onClick={() => onPageChange(page)}
        className="w-9 h-9 rounded-lg flex justify-center items-center transition-colors cursor-pointer hover:bg-gray-50"
      >
        <span className={`text-sm font-medium font-['Roboto'] leading-4 ${isActive ? "text-primary-600" : "text-gray-800"}`}>
          {page.toString().padStart(2, '0')}
        </span>
      </button>
    );

    const Ellipsis = () => (
      <button
        onClick={() => setIsDialogOpen(true)}
        className="w-9 h-9 rounded-lg hover:bg-gray-50 flex justify-center items-center cursor-pointer"
      >
        <span className="text-gray-800 text-sm font-medium font-['Roboto'] leading-4">...</span>
      </button>
    );

    pages.push(<PageButton key={1} page={1} isActive={1 === currentPage} />);

    if (startPage > 2) {
      pages.push(<Ellipsis key="start-ellipsis" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(<PageButton key={i} page={i} isActive={i === currentPage} />);
    }

    if (endPage < totalPages - 1) {
      pages.push(<Ellipsis key="end-ellipsis" />);
    }

    if (totalPages > 1) {
      pages.push(<PageButton key={totalPages} page={totalPages} isActive={totalPages === currentPage} />);
    }

    return pages;
  };

  useEffect(() => {
    setPageInput("");
  }, [currentPage]);

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput);
    if (page && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
    setIsDialogOpen(false);
    setPageInput("");
  };

  return (
    <div className="inline-flex justify-between items-center w-full">
      {/* Showing Results */}
      <div className="px-3 py-2.5 rounded outline outline-1 outline-offset-[-0.50px] outline-gray-100 inline-flex flex-col justify-center items-start gap-2">
        <div className="inline-flex justify-start items-center gap-2">
          <div className="text-justify justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-4">
            Showing {totalCount > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="inline-flex justify-end items-center gap-1">
        {renderPaginationItems()}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-80 p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] inline-flex flex-col justify-start items-center gap-4 overflow-hidden [&>button]:hidden">
          {/* Header */}
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-center text-gray-800 text-base font-medium font-['Roboto'] leading-6">Go to Page</div>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="w-10 h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-gray-50 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          {/* Input */}
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch relative flex flex-col justify-start items-start">
              <div className="self-stretch h-3.5"></div>
              <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  placeholder={`1 - ${totalPages}`}
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-gray-400"
                />
              </div>
              <div className="px-1 left-[8px] top-0 absolute bg-white inline-flex justify-center items-center gap-2.5">
                <div className="justify-center text-gray-800 text-[10px] font-normal font-['Roboto'] leading-4">Page number</div>
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handlePageInputSubmit}
            disabled={!pageInput}
            className="self-stretch h-10 px-4 py-2.5 btn-primary-skin inline-flex justify-center items-center gap-1.5 transition-colors"
          >
            <div className="text-center justify-center text-white text-base font-medium font-['Roboto'] leading-4">Go</div>
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaginationComponent;


