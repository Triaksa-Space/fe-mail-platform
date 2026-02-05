import { useState, useCallback, useMemo } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalCount?: number;
}

interface UsePaginationResult {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalCount: (count: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  reset: () => void;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalCount: initialTotalCount = 0,
}: UsePaginationOptions = {}): UsePaginationResult {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  );

  const offset = useMemo(
    () => (currentPage - 1) * pageSize,
    [currentPage, pageSize]
  );

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const setPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    offset,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setPageSize,
    setTotalCount,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    reset,
  };
}

// Hook for sortable tables
type SortOrder = "asc" | "desc" | null;

interface UseSortingOptions<T extends string> {
  initialField?: T | null;
  initialOrder?: SortOrder;
}

interface UseSortingResult<T extends string> {
  sortField: T | null;
  sortOrder: SortOrder;
  sortString: string;
  toggleSort: (field: T) => void;
  setSort: (field: T | null, order: SortOrder) => void;
  clearSort: () => void;
}

export function useSorting<T extends string>({
  initialField = null,
  initialOrder = null,
}: UseSortingOptions<T> = {}): UseSortingResult<T> {
  const [sortField, setSortField] = useState<T | null>(initialField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialOrder);

  // Generate sort string for API (e.g., "created_at desc")
  const sortString = useMemo(() => {
    if (!sortField || !sortOrder) return "";
    return `${sortField} ${sortOrder}`;
  }, [sortField, sortOrder]);

  const toggleSort = useCallback((field: T) => {
    setSortField((prevField) => {
      if (prevField === field) {
        // Cycle through: asc -> desc -> null
        setSortOrder((prevOrder) => {
          if (prevOrder === "asc") return "desc";
          if (prevOrder === "desc") {
            setSortField(null);
            return null;
          }
          return "asc";
        });
        return field;
      } else {
        // New field, start with asc
        setSortOrder("asc");
        return field;
      }
    });
  }, []);

  const setSort = useCallback((field: T | null, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  const clearSort = useCallback(() => {
    setSortField(null);
    setSortOrder(null);
  }, []);

  return {
    sortField,
    sortOrder,
    sortString,
    toggleSort,
    setSort,
    clearSort,
  };
}

// Combined hook for paginated and sortable data
interface UsePaginatedDataOptions<SortField extends string> {
  initialPage?: number;
  initialPageSize?: number;
  initialSortField?: SortField | null;
  initialSortOrder?: SortOrder;
}

export function usePaginatedData<SortField extends string>({
  initialPage = 1,
  initialPageSize = 10,
  initialSortField = null,
  initialSortOrder = null,
}: UsePaginatedDataOptions<SortField> = {}) {
  const pagination = usePagination({ initialPage, initialPageSize });
  const sorting = useSorting<SortField>({
    initialField: initialSortField,
    initialOrder: initialSortOrder,
  });

  // Reset to first page when sorting changes
  const toggleSort = useCallback(
    (field: SortField) => {
      sorting.toggleSort(field);
      pagination.setPage(1);
    },
    [sorting, pagination]
  );

  return {
    ...pagination,
    ...sorting,
    toggleSort, // Override with reset behavior
  };
}
