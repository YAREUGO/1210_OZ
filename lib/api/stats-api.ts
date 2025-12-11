/**
 * @file stats-api.ts
 * @description 통계 대시보드 데이터 수집 API
 *
 * 통계 페이지에서 사용하는 데이터를 수집하는 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 집계 (getRegionStats)
 * 2. 타입별 관광지 개수 집계 (getTypeStats)
 * 3. 통계 요약 정보 생성 (getStatsSummary)
 *
 * 핵심 구현 로직:
 * - 각 지역/타입별로 API를 호출하여 totalCount를 수집
 * - 병렬 호출을 사용하되 Promise.allSettled로 에러 처리
 * - API Rate Limit을 고려하여 적절한 딜레이 추가 가능
 * - 데이터 캐싱 (revalidate: 3600)
 *
 * @dependencies
 * - lib/api/tour-api.ts: getAreaCode, getAreaBasedList
 * - lib/types/stats.ts: RegionStats, TypeStats, StatsSummary
 * - lib/types/tour.ts: CONTENT_TYPE, CONTENT_TYPE_NAME
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 명세
 */

import { unstable_cache } from "next/cache";
import { getAreaCode, getAreaBasedList } from "@/lib/api/tour-api";
import { TourApiError } from "@/lib/api/tour-api";
import type { RegionStats, TypeStats, StatsSummary } from "@/lib/types/stats";
import { CONTENT_TYPE, CONTENT_TYPE_NAME } from "@/lib/types/tour";

/**
 * 캐시 설정
 * - revalidate: 3600 (1시간)
 * - tags: 통계 데이터 캐시 태그
 */
const CACHE_CONFIG = {
  revalidate: 3600, // 1시간
  tags: ["stats"],
};

/**
 * 지역별 관광지 개수 집계 (내부 함수)
 * 캐싱 없이 실제 API 호출 수행
 */
async function _getRegionStatsInternal(): Promise<RegionStats[]> {
  try {
    // 지역 목록 조회
    const areaCodes = await getAreaCode();

    // 각 지역별로 totalCount 조회 (병렬 호출)
    const statsPromises = areaCodes.map(async (area) => {
      try {
        const result = await getAreaBasedList({
          areaCode: area.code,
          numOfRows: 1, // totalCount만 필요하므로 최소값
          pageNo: 1,
        });

        return {
          areaCode: area.code,
          areaName: area.name,
          count: result.totalCount,
        } as RegionStats;
      } catch (error) {
        // 개별 지역 조회 실패 시 0으로 처리
        console.warn(`지역 ${area.name}(${area.code}) 통계 조회 실패:`, error);
        return {
          areaCode: area.code,
          areaName: area.name,
          count: 0,
        } as RegionStats;
      }
    });

    // 모든 요청 완료 대기 (에러가 있어도 계속 진행)
    const results = await Promise.allSettled(statsPromises);

    // 성공한 결과만 필터링
    const stats: RegionStats[] = results
      .filter((result): result is PromiseFulfilledResult<RegionStats> => result.status === "fulfilled")
      .map((result) => result.value)
      .filter((stat) => stat.count > 0) // 개수가 0인 지역 제외
      .sort((a, b) => b.count - a.count); // 개수 내림차순 정렬

    return stats;
  } catch (error) {
    console.error("지역별 통계 조회 실패:", error);
    throw new TourApiError(
      `지역별 통계 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 지역별 관광지 개수 집계 (캐싱 적용)
 * @returns 지역별 통계 배열
 */
export const getRegionStats = unstable_cache(
  _getRegionStatsInternal,
  ["region-stats"],
  CACHE_CONFIG
);

/**
 * 타입별 관광지 개수 집계 (내부 함수)
 * 캐싱 없이 실제 API 호출 수행
 */
async function _getTypeStatsInternal(): Promise<TypeStats[]> {
  try {
    // 모든 Content Type ID 목록
    const contentTypeIds = Object.values(CONTENT_TYPE);

    // 각 타입별로 totalCount 조회 (병렬 호출)
    const statsPromises = contentTypeIds.map(async (contentTypeId) => {
      try {
        const result = await getAreaBasedList({
          contentTypeId,
          numOfRows: 1, // totalCount만 필요하므로 최소값
          pageNo: 1,
        });

        return {
          contentTypeId,
          contentTypeName: CONTENT_TYPE_NAME[contentTypeId],
          count: result.totalCount,
          percentage: 0, // 나중에 계산
        } as TypeStats;
      } catch (error) {
        // 개별 타입 조회 실패 시 0으로 처리
        console.warn(`타입 ${CONTENT_TYPE_NAME[contentTypeId]}(${contentTypeId}) 통계 조회 실패:`, error);
        return {
          contentTypeId,
          contentTypeName: CONTENT_TYPE_NAME[contentTypeId],
          count: 0,
          percentage: 0,
        } as TypeStats;
      }
    });

    // 모든 요청 완료 대기 (에러가 있어도 계속 진행)
    const results = await Promise.allSettled(statsPromises);

    // 성공한 결과만 필터링
    const stats: TypeStats[] = results
      .filter((result): result is PromiseFulfilledResult<TypeStats> => result.status === "fulfilled")
      .map((result) => result.value)
      .filter((stat) => stat.count > 0); // 개수가 0인 타입 제외

    // 전체 개수 계산
    const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);

    // 비율 계산 및 정렬
    const statsWithPercentage = stats
      .map((stat) => ({
        ...stat,
        percentage: totalCount > 0 ? Math.round((stat.count / totalCount) * 100 * 10) / 10 : 0, // 소수점 1자리
      }))
      .sort((a, b) => b.count - a.count); // 개수 내림차순 정렬

    return statsWithPercentage;
  } catch (error) {
    console.error("타입별 통계 조회 실패:", error);
    throw new TourApiError(
      `타입별 통계 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 타입별 관광지 개수 집계 (캐싱 적용)
 * @returns 타입별 통계 배열
 */
export const getTypeStats = unstable_cache(
  _getTypeStatsInternal,
  ["type-stats"],
  CACHE_CONFIG
);

/**
 * 통계 요약 정보 생성 (내부 함수)
 * 캐싱된 통계 데이터를 사용하여 요약 정보 생성
 */
async function _getStatsSummaryInternal(): Promise<StatsSummary> {
  try {
    // 캐싱된 통계 데이터를 사용 (캐시된 함수 호출)
    const [regionStats, typeStats] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
    ]);

    // 전체 관광지 수 계산 (타입별 통계의 합)
    const totalCount = typeStats.reduce((sum, stat) => sum + stat.count, 0);

    // Top 3 지역
    const topRegions = regionStats.slice(0, 3);

    // Top 3 타입
    const topTypes = typeStats.slice(0, 3);

    return {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("통계 요약 조회 실패:", error);
    throw new TourApiError(
      `통계 요약 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 통계 요약 정보 생성 (캐싱 적용)
 * @returns 통계 요약 정보
 */
export const getStatsSummary = unstable_cache(
  _getStatsSummaryInternal,
  ["stats-summary"],
  CACHE_CONFIG
);

