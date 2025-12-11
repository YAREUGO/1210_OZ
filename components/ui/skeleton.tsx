/**
 * @file skeleton.tsx
 * @description 스켈레톤 UI 컴포넌트
 *
 * 데이터 로딩 중 콘텐츠의 모양을 미리 보여주는 스켈레톤 컴포넌트
 *
 * 주요 기능:
 * - 다양한 크기 및 모양 지원
 * - 애니메이션 효과 (pulse)
 * - 반응형 디자인
 *
 * @dependencies
 * - Tailwind CSS: animate-pulse
 */

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 스켈레톤 모양
   * @default "rectangle"
   */
  variant?: "rectangle" | "circle" | "text";
  /**
   * 너비 (예: "w-full", "w-64", "w-1/2")
   */
  width?: string;
  /**
   * 높이 (예: "h-4", "h-8", "h-64")
   */
  height?: string;
}

/**
 * 기본 스켈레톤 컴포넌트
 */
function Skeleton({
  className,
  variant = "rectangle",
  width,
  height,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        variant === "circle" && "rounded-full",
        variant === "text" && "h-4",
        width && width,
        height && height,
        className
      )}
      {...props}
    />
  );
}

/**
 * 카드 스켈레톤 (관광지 카드용)
 */
function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <Skeleton variant="rectangle" height="h-48" className="w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton variant="text" width="w-3/4" />
        <Skeleton variant="text" width="w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangle" width="w-16" height="h-6" className="rounded-full" />
        <Skeleton variant="rectangle" width="w-20" height="h-6" className="rounded-full" />
      </div>
    </div>
  );
}

/**
 * 리스트 스켈레톤 (관광지 목록용)
 */
function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-lg border bg-card p-4">
          <Skeleton variant="rectangle" width="w-24" height="h-24" className="rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="w-3/4" />
            <Skeleton variant="text" width="w-1/2" />
            <Skeleton variant="text" width="w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 그리드 스켈레톤 (카드 그리드용)
 */
function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export { Skeleton, CardSkeleton, ListSkeleton, GridSkeleton };



