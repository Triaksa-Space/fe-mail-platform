import { useState, useEffect, useRef, useCallback } from 'react';

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UsePaginatedListOptions<T> {
  /** Initial page size */
  pageSize?: number;
  /** Debounce delay for search in ms */
  searchDebounceMs?: number;
  /** Function to fetch data */
  fetchFn: (params: {
    page: number;
    pageSize: number;
    search?: string;
    signal?: AbortSignal;
  }) => Promise<T[] | { data: T[]; pagination?: PaginationInfo }>;
  /** Transform function for items */
  transformFn?: (item: any) => T;
  /** Dependencies that trigger refetch */
  deps?: any[];
  /** Whether to fetch on mount */
  fetchOnMount?: boolean;
}

interface UsePaginatedListReturn<T> {
  // Data
  items: T[];
  total: number;
  totalPages: number;

  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearch: string;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  refresh: () => void;
  reset: () => void;
}

/**
 * Custom hook for managing paginated lists with search and loading states
 */
export function usePaginatedList<T>({
  pageSize: initialPageSize = 10,
  searchDebounceMs = 300,
  fetchFn,
  transformFn,
  deps = [],
  fetchOnMount = true,
}: UsePaginatedListOptions<T>): UsePaginatedListReturn<T> {
  // Data state
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialPageSize);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(fetchOnMount);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const hasInitialFetchRef = useRef(false);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 1 when search changes
      if (searchQuery !== debouncedSearch) {
        setPage(1);
      }
    }, searchDebounceMs);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchDebounceMs]);

  // Fetch data function
  const fetchData = useCallback(async (isRefresh = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetchFn({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        signal: abortControllerRef.current.signal,
      });

      if (!isMountedRef.current) return;

      // Normalize response
      let normalizedItems: T[];
      let normalizedTotal: number;
      let normalizedTotalPages: number;

      if (Array.isArray(response)) {
        // Simple array response
        normalizedItems = transformFn ? response.map(transformFn) : response;
        normalizedTotal = normalizedItems.length;
        normalizedTotalPages = Math.ceil(normalizedItems.length / pageSize);
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        // Paginated response with data array
        normalizedItems = transformFn ? response.data.map(transformFn) : response.data;
        normalizedTotal = response.pagination?.total ?? normalizedItems.length;
        normalizedTotalPages = response.pagination?.totalPages ??
          response.pagination?.totalPages ??
          Math.ceil(normalizedTotal / pageSize);
      } else {
        // Unknown format, default to empty
        normalizedItems = [];
        normalizedTotal = 0;
        normalizedTotalPages = 0;
      }

      setItems(normalizedItems);
      setTotal(normalizedTotal);
      setTotalPages(normalizedTotalPages);
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      if (!isMountedRef.current) return;

      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load data');
      setItems([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [page, pageSize, debouncedSearch, fetchFn, transformFn]);

  // Initial fetch and refetch on deps change
  useEffect(() => {
    isMountedRef.current = true;

    if (fetchOnMount || hasInitialFetchRef.current) {
      fetchData();
      hasInitialFetchRef.current = true;
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [page, debouncedSearch, ...deps]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Reset function
  const reset = useCallback(() => {
    setPage(1);
    setSearchQuery('');
    setDebouncedSearch('');
    setItems([]);
    setTotal(0);
    setTotalPages(0);
    setError(null);
  }, []);

  return {
    // Data
    items,
    total,
    totalPages,

    // Pagination
    page,
    pageSize,
    setPage,

    // Search
    searchQuery,
    setSearchQuery,
    debouncedSearch,

    // Loading states
    isLoading,
    isRefreshing,
    error,

    // Actions
    refresh,
    reset,
  };
}

export default usePaginatedList;
