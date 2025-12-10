/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 그리드 레이아웃 (반응형)
 * 2. 카드 목록 표시
 * 3. 로딩 상태 (Skeleton UI)
 * 4. 빈 상태 처리
 * 5. 에러 상태 처리
 *
 * @dependencies
 * - @/components/tour-card: TourCard 컴포넌트
 * - @/components/ui/skeleton: GridSkeleton 컴포넌트
 * - @/components/ui/error: ApiError 컴포넌트
 * - @/lib/types/tour: TourItem 타입
 */

"use client";

import { TourCard } from "@/components/tour-card";
import { GridSkeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/components/ui/error";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourListProps {
  /**
   * 관광지 목록
   */
  tours: TourItem[];
  /**
   * 로딩 상태
   */
  isLoading?: boolean;
  /**
   * 에러 상태
   */
  error?: Error | null;
  /**
   * 에러 재시도 함수
   */
  onRetry?: () => void;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 선택된 관광지 ID (지도 연동용)
   */
  selectedTourId?: string;
  /**
   * 관광지 선택 핸들러
   */
  onTourSelect?: (tourId: string) => void;
}

export function TourList({
  tours,
  isLoading = false,
  error = null,
  onRetry,
  className,
  selectedTourId,
  onTourSelect,
}: TourListProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <GridSkeleton count={6} />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <ApiError
          message={error.message || "관광지 목록을 불러오는 중 오류가 발생했습니다."}
          onRetry={onRetry}
        />
      </div>
    );
  }

  // 빈 상태
  if (tours.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
        <p className="text-lg font-medium text-muted-foreground">관광지가 없습니다</p>
        <p className="mt-2 text-sm text-muted-foreground">
          다른 필터 조건으로 검색해보세요.
        </p>
      </div>
    );
  }

  // 목록 표시
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {tours.map((tour) => (
        <TourCard
          key={tour.contentid}
          tour={tour}
          isSelected={selectedTourId === tour.contentid}
          onClick={() => onTourSelect?.(tour.contentid)}
        />
      ))}
    </div>
  );
}

