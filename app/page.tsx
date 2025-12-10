/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 API를 활용한 관광지 목록 페이지
 *
 * 주요 기능:
 * 1. 관광지 목록 표시
 * 2. 필터 기능 (지역, 타입, 정렬)
 * 3. 검색 기능 (키워드 검색)
 * 4. 지도 연동 (향후 구현)
 *
 * @dependencies
 * - @/components/tour-list: TourList 컴포넌트
 * - @/components/tour-filters: TourFilters 컴포넌트
 * - @/lib/api/tour-api: getAreaBasedList, getAreaCode, searchKeyword 함수
 */

import { TourMapView } from "@/components/tour-map-view";
import { TourFilters } from "@/components/tour-filters";
import { getAreaBasedList, getAreaCode, searchKeyword } from "@/lib/api/tour-api";
import { TourApiError } from "@/lib/api/tour-api";
import type { TourItem } from "@/lib/types/tour";

interface HomePageProps {
  searchParams: Promise<{
    keyword?: string;
    areaCode?: string;
    contentTypeId?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const keyword = params.keyword;
  const areaCode = params.areaCode;
  const contentTypeId = params.contentTypeId;
  const sort = params.sort || "latest";
  const page = Number(params.page) || 1;

  let tours: TourItem[] = [];
  let error: Error | null = null;
  let areaCodes: Array<{ code: string; name: string }> = [];
  let totalCount = 0;

  try {
    // 지역 목록 조회
    const areaCodesData = await getAreaCode();
    areaCodes = areaCodesData.map((area) => ({
      code: area.code,
      name: area.name,
    }));
  } catch (err) {
    console.error("지역 목록 조회 실패:", err);
  }

  try {
    let result;

    // 키워드가 있으면 검색 API 사용, 없으면 목록 API 사용
    if (keyword && keyword.trim()) {
      // 검색 API 호출
      result = await searchKeyword({
        keyword: keyword.trim(),
        areaCode: areaCode || undefined,
        contentTypeId: contentTypeId || undefined,
        numOfRows: 20,
        pageNo: page,
      });
    } else {
      // 목록 API 호출
      result = await getAreaBasedList({
        areaCode: areaCode || undefined,
        contentTypeId: contentTypeId || undefined,
        numOfRows: 20,
        pageNo: page,
      });
    }

    tours = result.items;
    totalCount = result.totalCount;

    // 정렬 처리
    if (sort === "name") {
      tours.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    } else {
      // 최신순 (modifiedtime 기준)
      tours.sort((a, b) => {
        const dateA = new Date(a.modifiedtime).getTime();
        const dateB = new Date(b.modifiedtime).getTime();
        return dateB - dateA;
      });
    }
  } catch (err) {
    console.error("관광지 목록 조회 실패:", err);
    error = err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다.");
  }

  return (
    <main className="min-h-screen">
      {/* 필터 섹션 */}
      <TourFilters
        areaCodes={areaCodes}
        selectedAreaCode={areaCode}
        selectedContentType={contentTypeId}
        sortBy={sort as "latest" | "name"}
      />

      {/* 목록 + 지도 섹션 */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {keyword ? `"${keyword}" 검색 결과` : "관광지 목록"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {error
              ? "오류가 발생했습니다"
              : keyword
                ? totalCount > 0
                  ? `총 ${totalCount}개의 검색 결과를 찾았습니다`
                  : `"${keyword}"에 대한 검색 결과가 없습니다`
                : tours.length > 0
                  ? `총 ${totalCount || tours.length}개의 관광지를 찾았습니다`
                  : "한국의 아름다운 관광지를 탐험해보세요"}
          </p>
        </div>

        <TourMapView
          tours={tours}
          isLoading={false}
          error={error}
          totalCount={totalCount}
          currentPage={page}
          itemsPerPage={20}
          // 서버 컴포넌트에서는 onRetry를 전달하지 않음 (클라이언트 컴포넌트에서 처리)
        />
      </div>
    </main>
  );
}
