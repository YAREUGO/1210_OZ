/**
 * @file stats.ts
 * @description 통계 대시보드 관련 TypeScript 타입 정의
 *
 * 통계 페이지에서 사용하는 데이터 구조 타입 정의
 *
 * 주요 타입:
 * - RegionStats: 지역별 통계
 * - TypeStats: 타입별 통계
 * - StatsSummary: 통계 요약
 *
 * @see {@link /docs/PRD.md} - 통계 대시보드 명세
 */

/**
 * 지역별 통계
 * 각 시/도별 관광지 개수
 */
export interface RegionStats {
  areaCode: string; // 지역코드
  areaName: string; // 지역명 (서울, 부산, 제주 등)
  count: number; // 관광지 개수
}

/**
 * 타입별 통계
 * 각 관광 타입별 관광지 개수
 */
export interface TypeStats {
  contentTypeId: string; // 콘텐츠타입ID
  contentTypeName: string; // 타입명 (관광지, 문화시설 등)
  count: number; // 관광지 개수
  percentage: number; // 비율 (백분율)
}

/**
 * 통계 요약
 * 전체 통계 요약 정보
 */
export interface StatsSummary {
  totalCount: number; // 전체 관광지 수
  topRegions: RegionStats[]; // Top 3 지역
  topTypes: TypeStats[]; // Top 3 타입
  lastUpdated: Date; // 마지막 업데이트 시간
}

