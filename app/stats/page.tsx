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
import dynamic from "next/dynamic";
import { getStatsSummary, getRegionStats, getTypeStats } from "@/lib/api/stats-api";
import { StatsSummary, StatsSummarySkeleton } from "@/components/stats/stats-summary";
import { TourApiError } from "@/lib/api/tour-api";

// 무거운 차트 컴포넌트를 동적 임포트로 로드 (번들 크기 최적화)
const RegionChart = dynamic(
  () => import("@/components/stats/region-chart").then((mod) => ({ default: mod.RegionChart })),
  {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground">로딩 중...</div>,
    ssr: true, // 서버 사이드 렌더링 유지
  }
);

const TypeChart = dynamic(
  () => import("@/components/stats/type-chart").then((mod) => ({ default: mod.TypeChart })),
  {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground">로딩 중...</div>,
    ssr: true, // 서버 사이드 렌더링 유지
  }
);

/**
 * 통계 페이지 메타데이터
 */
export const metadata = {
  title: "통계 대시보드 - My Trip",
  description: "한국 관광지 통계 정보를 확인하세요.",
};

/**
 * 페이지 재검증 설정
 * 1시간마다 통계 데이터를 재검증
 */
export const revalidate = 3600; // 1시간 (초 단위)

/**
 * 통계 요약 데이터를 가져오는 Server Component
 */
async function StatsSummaryContent() {
  let summaryData;
  let error: Error | null = null;

  try {
    summaryData = await getStatsSummary();
  } catch (err) {
    console.error("통계 요약 조회 실패:", err);
    error = err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다.");
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <h2 className="text-xl font-semibold text-destructive mb-2">통계 요약을 불러올 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">
          {error instanceof TourApiError
            ? error.message
            : "통계 요약을 불러오는 중 오류가 발생했습니다."}
        </p>
      </div>
    );
  }

  return <StatsSummary data={summaryData} isLoading={false} />;
}

/**
 * 지역별 차트 데이터를 가져오는 Server Component
 */
async function RegionChartContent() {
  let regionStats;
  let error: Error | null = null;

  try {
    regionStats = await getRegionStats();
  } catch (err) {
    console.error("지역별 통계 조회 실패:", err);
    error = err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다.");
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <h2 className="text-xl font-semibold text-destructive mb-2">지역별 통계를 불러올 수 없습니다</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // 동적 임포트된 컴포넌트에 데이터 전달
  return <RegionChart data={regionStats} isLoading={false} limit={10} />;
}

/**
 * 타입별 차트 데이터를 가져오는 Server Component
 */
async function TypeChartContent() {
  let typeStats;
  let error: Error | null = null;

  try {
    typeStats = await getTypeStats();
  } catch (err) {
    console.error("타입별 통계 조회 실패:", err);
    error = err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다.");
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <h2 className="text-xl font-semibold text-destructive mb-2">타입별 통계를 불러올 수 없습니다</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // 동적 임포트된 컴포넌트에 데이터 전달
  return <TypeChart data={typeStats} isLoading={false} />;
}

/**
 * 통계 페이지 메인 컴포넌트
 * 점진적 로딩을 위해 각 섹션을 독립적인 Suspense로 분리
 */
export default function StatsPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">통계 대시보드</h1>
          <p className="text-muted-foreground">
            한국관광공사 공공 API 데이터를 기반으로 한 관광지 통계 정보입니다.
          </p>
        </div>

        {/* 통계 요약 - 가장 먼저 로드 */}
        <Suspense fallback={<StatsSummarySkeleton />}>
          <StatsSummaryContent />
        </Suspense>

        {/* 지역별 차트 - 요약 이후 로드 */}
        <div className="mt-12">
          <div className="rounded-lg border bg-card p-6">
            <Suspense fallback={<RegionChart isLoading={true} />}>
              <RegionChartContent />
            </Suspense>
          </div>
        </div>

        {/* 타입별 차트 - 마지막에 로드 */}
        <div className="mt-12">
          <div className="rounded-lg border bg-card p-6">
            <Suspense fallback={<TypeChart isLoading={true} />}>
              <TypeChartContent />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

