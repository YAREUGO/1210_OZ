/**
 * @file app/stats/page.tsx
 * @description 통계 대시보드 페이지
 *
 * 한국관광공사 API 데이터를 기반으로 한 통계 대시보드를 제공합니다.
 *
 * 주요 기능:
 * 1. 전체 관광지 수 표시
 * 2. 지역별 통계 (Top 3)
 * 3. 타입별 통계 (Top 3)
 * 4. 지역별 분포 차트 (향후 구현)
 * 5. 타입별 분포 차트 (향후 구현)
 *
 * @dependencies
 * - lib/api/stats-api: getStatsSummary
 * - components/stats/stats-summary: StatsSummary 컴포넌트
 */

import { Suspense } from "react";
import { getStatsSummary, getRegionStats, getTypeStats } from "@/lib/api/stats-api";
import { StatsSummary } from "@/components/stats/stats-summary";
import { RegionChart } from "@/components/stats/region-chart";
import { TypeChart } from "@/components/stats/type-chart";
import { TourApiError } from "@/lib/api/tour-api";

/**
 * 통계 페이지 메타데이터
 */
export const metadata = {
  title: "통계 대시보드 - My Trip",
  description: "한국 관광지 통계 정보를 확인하세요.",
};

/**
 * 통계 데이터를 가져오는 Server Component
 */
async function StatsContent() {
  let summaryData;
  let regionStats;
  let typeStats;
  let error: Error | null = null;

  try {
    // 병렬로 모든 통계 데이터 조회
    [summaryData, regionStats, typeStats] = await Promise.all([
      getStatsSummary(),
      getRegionStats(),
      getTypeStats(),
    ]);
  } catch (err) {
    console.error("통계 데이터 조회 실패:", err);
    error = err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다.");
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">통계 데이터를 불러올 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof TourApiError
              ? error.message
              : "통계 데이터를 불러오는 중 오류가 발생했습니다."}
          </p>
          <p className="text-sm text-muted-foreground">
            페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">통계 대시보드</h1>
        <p className="text-muted-foreground">
          한국관광공사 공공 API 데이터를 기반으로 한 관광지 통계 정보입니다.
        </p>
      </div>

      <StatsSummary data={summaryData} isLoading={false} />

      <div className="mt-12 space-y-12">
        <div className="rounded-lg border bg-card p-6">
          <RegionChart data={regionStats} isLoading={false} limit={10} />
        </div>

        <div className="rounded-lg border bg-card p-6">
          <TypeChart data={typeStats} isLoading={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * 통계 페이지 메인 컴포넌트
 */
export default function StatsPage() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">통계 대시보드</h1>
              <p className="text-muted-foreground">
                한국관광공사 공공 API 데이터를 기반으로 한 관광지 통계 정보입니다.
              </p>
            </div>
            <StatsSummary isLoading={true} />
            <div className="mt-12 space-y-12">
              <div className="rounded-lg border bg-card p-6">
                <RegionChart isLoading={true} />
              </div>
              <div className="rounded-lg border bg-card p-6">
                <TypeChart isLoading={true} />
              </div>
            </div>
          </div>
        }
      >
        <StatsContent />
      </Suspense>
    </main>
  );
}

