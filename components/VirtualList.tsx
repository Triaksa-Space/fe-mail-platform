"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number; // Fixed height per item for calculation
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Number of items to render outside visible area
  className?: string;
  getItemKey?: (item: T, index: number) => string | number;
  emptyState?: React.ReactNode;
  onEndReached?: () => void;
  endReachedThreshold?: number; // Pixels from bottom to trigger onEndReached
}

interface VirtualListState {
  scrollTop: number;
  containerHeight: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className,
  getItemKey,
  emptyState,
  onEndReached,
  endReachedThreshold = 200,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VirtualListState>({
    scrollTop: 0,
    containerHeight: 0,
  });
  const endReachedRef = useRef(false);

  // Calculate visible range
  const { startIndex, visibleItems, offsetY } = useMemo(() => {
    const { scrollTop, containerHeight } = state;
    const totalHeight = items.length * itemHeight;

    // Calculate start and end indices with overscan
    let startIndex = Math.floor(scrollTop / itemHeight) - overscan;
    let calcEndIndex = Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan;

    // Clamp to valid range
    startIndex = Math.max(0, startIndex);
    calcEndIndex = Math.min(items.length - 1, calcEndIndex);

    // Get visible items slice
    const visibleItems = items.slice(startIndex, calcEndIndex + 1);

    // Calculate offset for positioning
    const offsetY = startIndex * itemHeight;

    return { startIndex, visibleItems, offsetY, totalHeight };
  }, [items, itemHeight, state, overscan]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;

    setState({ scrollTop, containerHeight });

    // Check if we've reached the end
    if (onEndReached && !endReachedRef.current) {
      if (scrollHeight - scrollTop - containerHeight < endReachedThreshold) {
        endReachedRef.current = true;
        onEndReached();
      }
    }

    // Reset end reached flag when scrolling back up
    if (scrollHeight - scrollTop - containerHeight > endReachedThreshold * 2) {
      endReachedRef.current = false;
    }
  }, [onEndReached, endReachedThreshold]);

  // Initialize and handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial measurement
    setState({
      scrollTop: container.scrollTop,
      containerHeight: container.clientHeight,
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      setState((prev) => ({
        ...prev,
        containerHeight: container.clientHeight,
      }));
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (items.length === 0 && emptyState) {
    return <div className={cn("overflow-auto", className)}>{emptyState}</div>;
  }

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto relative", className)}
      onScroll={handleScroll}
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {/* Visible items container */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const key = getItemKey
              ? getItemKey(item, actualIndex)
              : actualIndex;

            return (
              <div
                key={key}
                style={{ height: itemHeight }}
                className="overflow-hidden"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simpler version for variable height items using intersection observer
interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  getItemKey?: (item: T, index: number) => string | number;
  batchSize?: number; // Number of items to load at a time
  emptyState?: React.ReactNode;
}

export function LazyList<T>({
  items,
  renderItem,
  className,
  getItemKey,
  batchSize = 20,
  emptyState,
}: LazyListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < items.length) {
          setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
        }
      },
      { rootMargin: "200px" }
    );

    const target = loadMoreRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [visibleCount, items.length, batchSize]);

  // Reset when items change
  useEffect(() => {
    setVisibleCount(batchSize);
  }, [items, batchSize]);

  if (items.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div className={className}>
      {visibleItems.map((item, index) => {
        const key = getItemKey ? getItemKey(item, index) : index;
        return <div key={key}>{renderItem(item, index)}</div>;
      })}

      {/* Load more trigger */}
      {visibleCount < items.length && (
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center"
        >
          <span className="text-sm text-gray-400">Loading more...</span>
        </div>
      )}
    </div>
  );
}

export default VirtualList;
