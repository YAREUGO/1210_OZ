/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 관광지 목록을 필터링하는 컴포넌트
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 선택)
 * 2. 관광 타입 필터 (다중 선택)
 * 3. 정렬 옵션 (최신순, 이름순)
 * 4. URL 쿼리 파라미터로 상태 관리
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/select: Select 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/lib/types/tour: CONTENT_TYPE, CONTENT_TYPE_NAME
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTENT_TYPE,
  CONTENT_TYPE_NAME,
  type ContentTypeId,
} from "@/lib/types/tour";
import { cn } from "@/lib/utils";
import type { AreaCode } from "@/lib/types/tour";

interface TourFiltersProps {
  /**
   * 지역 목록
   */
  areaCodes: AreaCode[];
  /**
   * 현재 선택된 지역코드
   */
  selectedAreaCode?: string;
  /**
   * 현재 선택된 관광 타입
   */
  selectedContentType?: string;
  /**
   * 현재 정렬 옵션
   */
  sortBy?: "latest" | "name";
}

export function TourFilters({
  areaCodes,
  selectedAreaCode,
  selectedContentType,
  sortBy = "latest",
}: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * URL 쿼리 파라미터 업데이트
   */
  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // 페이지는 항상 1로 리셋
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  /**
   * 지역 필터 변경
   */
  const handleAreaChange = (value: string) => {
    updateParams("areaCode", value);
  };

  /**
   * 관광 타입 필터 변경
   */
  const handleContentTypeChange = (value: string) => {
    updateParams("contentTypeId", value);
  };

  /**
   * 정렬 옵션 변경
   */
  const handleSortChange = (value: string) => {
    updateParams("sort", value);
  };

  /**
   * 필터 초기화
   */
  const handleReset = () => {
    router.push("/");
  };

  const hasActiveFilters =
    selectedAreaCode || selectedContentType || sortBy !== "latest";

  return (
    <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* 필터 그룹 */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 지역 필터 */}
            <div className="flex items-center gap-2">
              <MapPin
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Select
                value={selectedAreaCode || "all"}
                onValueChange={handleAreaChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {areaCodes.map((area) => (
                    <SelectItem key={area.code} value={area.code}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 관광 타입 필터 */}
            <div className="flex items-center gap-2">
              <Filter
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Select
                value={selectedContentType || "all"}
                onValueChange={handleContentTypeChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {Object.entries(CONTENT_TYPE).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {CONTENT_TYPE_NAME[value as ContentTypeId]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 정렬 옵션 */}
            <div className="flex items-center gap-2">
              <ArrowUpDown
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 필터 초기화 버튼 */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              필터 초기화
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
