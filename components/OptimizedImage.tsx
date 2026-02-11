"use client";

import Image, { ImageProps } from "next/image";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onError" | "onLoad"> {
  fallback?: React.ReactNode;
  showSkeleton?: boolean;
}

export function OptimizedImage({
  className,
  fallback,
  showSkeleton = true,
  alt,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        {...props}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// Avatar component optimized for user profile images
interface AvatarProps {
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ email, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const initial = email?.charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-blue-100 text-primary-500 font-semibold",
        sizeClasses[size],
        className
      )}
    >
      {initial}
    </div>
  );
}

export default OptimizedImage;

