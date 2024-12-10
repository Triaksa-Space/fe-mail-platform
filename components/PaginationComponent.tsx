import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationComponentProps {
  totalCount: number;
  activeCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({ activeCount, pageSize, totalCount, currentPage, totalPages, onPageChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pageInput, setPageInput] = useState("");

   const renderPaginationItems = () => {
    const pages = [];
    const maxPagesToShow = 3;
    const showBefore = Math.floor(maxPagesToShow / 2);
    const showAfter = maxPagesToShow - showBefore - 1;
    // Always show first page
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => onPageChange(1)}
          isActive={1 === currentPage}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Calculate range around current page
    let startPage = Math.max(2, currentPage - showBefore);
    let endPage = Math.min(totalPages - 1, currentPage + showAfter);

    // Add first ellipsis if needed
    if (startPage > 2) {
      pages.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis onClick={() => setIsDialogOpen(true)} className="cursor-pointer" />
        </PaginationItem>
      );
    }

    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add last ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis onClick={() => setIsDialogOpen(true)} className="cursor-pointer" />
        </PaginationItem>
      );
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            isActive={totalPages === currentPage}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
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
      <div className="grid grid-cols-2 items-center gap-4 px-4">
        {/* Left column - Showing text */}
        <div className="text-sm text-gray-500 justify-self-start">
          Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
        </div>
  
        {/* Right column - Pagination */}
        <div className="flex justify-end space-x-2 ml-auto w-1/2">
          <Pagination>
            <PaginationContent className="flex justify-end">
              {currentPage > 1 && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => onPageChange(1)}
                      aria-label="Go to first page"
                      className="hover:bg-gray-100"
                    >
                      <ChevronFirst className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => onPageChange(currentPage - 1)}
                      aria-label="Go to previous page"
                      className="hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              {renderPaginationItems()}
              {currentPage < totalPages && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => onPageChange(currentPage + 1)}
                      aria-label="Go to next page"
                      className="hover:bg-gray-100"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => onPageChange(totalPages)}
                      aria-label="Go to last page"
                      className="hover:bg-gray-100"
                    >
                      <ChevronLast className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
            </PaginationContent>
          </Pagination>
        </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Go to Page</DialogTitle>
          </DialogHeader>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder="Enter page number"
          />
          <DialogFooter>
            <Button onClick={handlePageInputSubmit}>Go</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaginationComponent;