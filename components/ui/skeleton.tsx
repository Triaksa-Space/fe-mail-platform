import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rounded";
}

/**
 * Base Skeleton component following shadcn/ui pattern.
 * Use this as building block for complex skeleton layouts.
 */
function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-neutral-200",
        variant === "default" && "rounded",
        variant === "circular" && "rounded-full",
        variant === "rounded" && "rounded-xl",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
