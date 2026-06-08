"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface LoadingSkeletonProps {
  variant?: "spinner" | "skeleton" | "minimal" | "card";
  message?: string | ReactNode;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
  className?: string;
}

const spinnerCircleSizeClass: Record<NonNullable<LoadingSkeletonProps["size"]>, string> = {
  small: "w-6 h-6 border-2",
  medium: "w-12 h-12 border-4",
  large: "w-16 h-16 border-4",
};

const skeletonLineSizeClass: Record<NonNullable<LoadingSkeletonProps["size"]>, string> = {
  small: "h-3",
  medium: "h-4",
  large: "h-5",
};

const minimalDotSizeClass: Record<NonNullable<LoadingSkeletonProps["size"]>, string> = {
  small: "w-1.5 h-1.5",
  medium: "w-2 h-2",
  large: "w-3 h-3",
};

const cardShellSizeClass: Record<NonNullable<LoadingSkeletonProps["size"]>, string> = {
  small: "p-3 gap-3",
  medium: "p-4 gap-4",
  large: "p-6 gap-6",
};

const cardImageSizeClass: Record<NonNullable<LoadingSkeletonProps["size"]>, string> = {
  small: "w-12 h-12",
  medium: "w-16 h-16",
  large: "w-20 h-20",
};

const cardLineSizeClass: Record<NonNullable<LoadingSkeletonProps["size"]>, string> = {
  small: "h-3",
  medium: "h-4",
  large: "h-5",
};

const cardLineShortSizeClass: Record<NonNullable<LoadingSkeletonProps["size"]>, string> = {
  small: "h-2.5",
  medium: "h-3",
  large: "h-4",
};

const shimmerLineClass =
  "rounded bg-[linear-gradient(90deg,#e5e7eb_0%,#f3f4f6_50%,#e5e7eb_100%)] bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]";

export default function LoadingSkeleton({
  variant = "spinner",
  message,
  size = "medium",
  fullScreen = false,
  className,
}: LoadingSkeletonProps) {
  const renderLoading = () => {
    switch (variant) {
      case "spinner":
        return (
          <div className="relative">
            <div
              className={cn(
                "border-4 border-gray-200 border-t-[#00287b] rounded-full animate-spin",
                spinnerCircleSizeClass[size]
              )}
            />
          </div>
        );
      case "skeleton":
        return (
          <div className="w-full space-y-3">
            <div
              className={cn(
                "h-4 bg-gray-200 rounded animate-pulse",
                skeletonLineSizeClass[size]
              )}
            />
            <div
              className={cn(
                "h-4 bg-gray-200 rounded animate-pulse",
                skeletonLineSizeClass[size]
              )}
            />
            <div
              className={cn(
                "h-4 bg-gray-200 rounded animate-pulse w-3/4",
                skeletonLineSizeClass[size]
              )}
            />
          </div>
        );
      case "minimal":
        return (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 bg-[#00287b] rounded-full animate-pulse",
                minimalDotSizeClass[size]
              )}
              style={{ animationDelay: "0s" }}
            />
            <div
              className={cn(
                "w-2 h-2 bg-[#00287b] rounded-full animate-pulse",
                minimalDotSizeClass[size]
              )}
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className={cn(
                "w-2 h-2 bg-[#00287b] rounded-full animate-pulse",
                minimalDotSizeClass[size]
              )}
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        );
      case "card":
        return (
          <div
            className={cn(
              "bg-white rounded-lg shadow-sm flex w-full max-w-md",
              cardShellSizeClass[size]
            )}
          >
            <div
              className={cn(
                "rounded shrink-0 bg-[linear-gradient(90deg,#e5e7eb_0%,#f3f4f6_50%,#e5e7eb_100%)] bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
                cardImageSizeClass[size]
              )}
            />
            <div className="flex-1 space-y-3">
              <div className={cn(shimmerLineClass, cardLineSizeClass[size])} />
              <div
                className={cn(
                  "w-3/4 rounded bg-[linear-gradient(90deg,#f3f4f6_0%,#e5e7eb_50%,#f3f4f6_100%)] bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
                  cardLineShortSizeClass[size]
                )}
                style={{ animationDelay: "0.1s" }}
              />
              <div className={cn(shimmerLineClass, cardLineSizeClass[size])} />
              <div
                className={cn(
                  "w-full rounded bg-[linear-gradient(90deg,#e5e7eb_0%,#f3f4f6_50%,#e5e7eb_100%)] bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
                  cardLineSizeClass[size]
                )}
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className={cn(
                  "w-3/4 rounded bg-[linear-gradient(90deg,#f3f4f6_0%,#e5e7eb_50%,#f3f4f6_100%)] bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
                  cardLineShortSizeClass[size]
                )}
                style={{ animationDelay: "0.1s" }}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-4 w-full",
        fullScreen && "min-h-screen",
        className
      )}
    >
      {renderLoading()}
      {message && <p className="mt-4 text-gray-600 text-center text-[12px]">{message}</p>}
    </div>
  );
}
