import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination";

const PaginationComponent: React.FC<{ totalPages: number; currentPage: number; onPageChange: (page: number) => void }> = ({ totalPages, currentPage, onPageChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pageInput, setPageInput] = useState("");

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput);
    if (page && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
    setIsDialogOpen(false);
    setPageInput("");
  };

  const renderPaginationItems = () => {
    const pages = [];
    const maxPagesToShow = 3;

    if (totalPages <= maxPagesToShow) {
      // If total pages are 3 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
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
    } else if (currentPage <= maxPagesToShow) {
      // First 3 pages
      for (let i = 1; i <= maxPagesToShow; i++) {
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
      pages.push(
        <PaginationItem key="ellipsis">
          <PaginationEllipsis onClick={() => setIsDialogOpen(true)} className="cursor-pointer" />
        </PaginationItem>
      );
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => onPageChange(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      );
    } else if (currentPage > totalPages - maxPagesToShow) {
      // Last 3 pages
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      pages.push(
        <PaginationItem key="ellipsis">
          <PaginationEllipsis onClick={() => setIsDialogOpen(true)} className="cursor-pointer" />
        </PaginationItem>
      );
      for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
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
    } else {
      // Middle pages
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      pages.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis onClick={() => setIsDialogOpen(true)} className="cursor-pointer" />
        </PaginationItem>
      );
      for (let i = currentPage; i < currentPage + maxPagesToShow && i < totalPages; i++) {
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
      if (currentPage + maxPagesToShow <= totalPages) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis onClick={() => setIsDialogOpen(true)} className="cursor-pointer" />
          </PaginationItem>
        );
        pages.push(
          <PaginationItem key={totalPages}>
            <PaginationLink onClick={() => onPageChange(totalPages)}>{totalPages}</PaginationLink>
          </PaginationItem>
        );
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pl-4">
      <span className="text-sm text-gray-500 w-full">Page {currentPage} of {totalPages}</span>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink 
              onClick={() => onPageChange(1)}
              aria-disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              &lt;&lt;
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink 
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              &lt;
            </PaginationLink>
          </PaginationItem>
          {renderPaginationItems()}
          <PaginationItem>
            <PaginationLink 
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage === totalPages}
              aria-label="Go to next page"
            >
              &gt;
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink 
              onClick={() => onPageChange(totalPages)}
              aria-disabled={currentPage === totalPages}
              aria-label="Go to last page"
            >
              &gt;&gt;
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
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

