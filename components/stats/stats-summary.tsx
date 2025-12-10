/**
 * @file stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 대시보드의 요약 정보를 카드 형태로 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 전체 관광지 수 표시
 * 2. Top 3 지역 표시 (카드 형태)
 * 3. Top 3 타입 표시 (카드 형태)
 * 4. 마지막 업데이트 시간 표시
 * 5. 로딩 상태 (Skeleton UI)
 *
 * @dependencies
 * - lib/types/stats: StatsSummary 타입
 * - components/ui/skeleton: Skeleton 컴포넌트
 */

import { Calendar, MapPin, Tag } from "lucide-react";
import type { StatsSummary } from "@/lib/types/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatsSummaryProps {
  /**
   * 통계 요약 데이터
   */
  data?: StatsSummary;
  /**
   * 로딩 상태
   */
  isLoading?: boolean;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 숫자를 천 단위로 포맷팅
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * 통계 요약 카드 컴포넌트
 */
export function StatsSummary({ data, isLoading, className }: StatsSummaryProps) {
  if (isLoading || !data) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* 전체 관광지 수 스켈레톤 */}
        <div className="rounded-lg border bg-card p-6">
          <Skeleton variant="text" width="w-32" height="h-4" className="mb-2" />
          <Skeleton variant="text" width="w-24" height="h-8" />
        </div>

        {/* Top 3 지역 스켈레톤 */}
        <div className="space-y-4">
          <Skeleton variant="text" width="w-24" height="h-5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <Skeleton variant="text" width="w-16" height="h-4" className="mb-2" />
                <Skeleton variant="text" width="w-20" height="h-6" />
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 타입 스켈레톤 */}
        <div className="space-y-4">
          <Skeleton variant="text" width="w-24" height="h-5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <Skeleton variant="text" width="w-16" height="h-4" className="mb-2" />
                <Skeleton variant="text" width="w-20" height="h-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 전체 관광지 수 */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">전체 관광지 수</h2>
        </div>
        <p className="text-3xl font-bold text-primary">{formatNumber(data.totalCount)}</p>
        <p className="text-sm text-muted-foreground mt-2">
          한국관광공사 공공 API 기준
        </p>
      </div>

      {/* Top 3 지역 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">인기 지역 Top 3</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.topRegions.map((region, index) => (
            <div
              key={region.areaCode}
              className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}위
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(region.count)}개
                </span>
              </div>
              <h4 className="text-xl font-bold">{region.areaName}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 타입 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">인기 타입 Top 3</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.topTypes.map((type, index) => (
            <div
              key={type.contentTypeId}
              className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}위
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(type.count)}개 ({type.percentage}%)
                </span>
              </div>
              <h4 className="text-xl font-bold">{type.contentTypeName}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* 마지막 업데이트 시간 */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>마지막 업데이트: {formatDate(data.lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 통계 요약 스켈레톤 컴포넌트
 * 로딩 중일 때 표시되는 스켈레톤 UI
 */
export function StatsSummarySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* 전체 관광지 수 스켈레톤 */}
      <div className="rounded-lg border bg-card p-6">
        <Skeleton variant="text" width="w-32" height="h-4" className="mb-2" />
        <Skeleton variant="text" width="w-24" height="h-8" />
      </div>

      {/* Top 3 지역 스켈레톤 */}
      <div className="space-y-4">
        <Skeleton variant="text" width="w-24" height="h-5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton variant="text" width="w-16" height="h-4" className="mb-2" />
              <Skeleton variant="text" width="w-20" height="h-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 타입 스켈레톤 */}
      <div className="space-y-4">
        <Skeleton variant="text" width="w-24" height="h-5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton variant="text" width="w-16" height="h-4" className="mb-2" />
              <Skeleton variant="text" width="w-20" height="h-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

