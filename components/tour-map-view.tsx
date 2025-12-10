/**
 * @file tour-map-view.tsx
 * @description 관광지 목록 + 지도 통합 뷰 컴포넌트
 *
 * 리스트와 지도를 함께 표시하는 컴포넌트
 * - 데스크톱: 리스트(좌측) + 지도(우측) 분할
 * - 모바일: 탭 형태로 리스트/지도 전환
 *
 * @dependencies
 * - @/components/tour-list: TourList 컴포넌트
 * - @/components/naver-map: NaverMap 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourList } from "@/components/tour-list";
import { NaverMap } from "@/components/naver-map";
import { Pagination } from "@/components/pagination";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourMapViewProps {
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
   * 전체 항목 수 (페이지네이션용)
   */
  totalCount?: number;
  /**
   * 현재 페이지 번호
   */
  currentPage?: number;
  /**
   * 페이지당 항목 수
   */
  itemsPerPage?: number;
}

type ViewMode = "list" | "map" | "split";

export function TourMapView({
  tours,
  isLoading = false,
  error = null,
  onRetry,
  totalCount = 0,
  currentPage = 1,
  itemsPerPage = 20,
}: TourMapViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();

  // 모바일에서는 탭 형태로 전환
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const effectiveViewMode = isMobile && viewMode === "split" ? "list" : viewMode;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* 모바일: 뷰 전환 탭 */}
      {isMobile && (
        <div className="flex border-b bg-background">
          <Button
            variant={effectiveViewMode === "list" ? "default" : "ghost"}
            className="flex-1 rounded-none"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-2" />
            목록
          </Button>
          <Button
            variant={effectiveViewMode === "map" ? "default" : "ghost"}
            className="flex-1 rounded-none"
            onClick={() => setViewMode("map")}
          >
            <MapIcon className="h-4 w-4 mr-2" />
            지도
          </Button>
        </div>
      )}

      {/* 컨텐츠 영역 */}
      <div
        className={cn(
          "flex flex-1 overflow-hidden",
          effectiveViewMode === "split" && "flex-row",
          effectiveViewMode === "list" && "flex-col",
          effectiveViewMode === "map" && "flex-col"
        )}
      >
        {/* 리스트 영역 */}
        {(effectiveViewMode === "list" || effectiveViewMode === "split") && (
          <div
            className={cn(
              "overflow-y-auto",
              effectiveViewMode === "split"
                ? "w-full md:w-1/2 border-r"
                : "w-full"
            )}
          >
            <div className="p-4">
              <TourList
                tours={tours}
                isLoading={isLoading}
                error={error}
                onRetry={onRetry}
              />
            </div>
          </div>
        )}

        {/* 지도 영역 */}
        {(effectiveViewMode === "map" || effectiveViewMode === "split") && (
          <div
            className={cn(
              "flex-shrink-0",
              effectiveViewMode === "split"
                ? "w-full md:w-1/2"
                : "w-full flex-1"
            )}
          >
            <NaverMap
              tours={tours}
              selectedTourId={selectedTourId}
              onTourSelect={setSelectedTourId}
              height={effectiveViewMode === "split" ? "100%" : "600px"}
            />
          </div>
        )}
      </div>

      {/* 페이지네이션 (리스트 뷰일 때만 표시) */}
      {effectiveViewMode !== "map" && totalCount > 0 && (
        <div className="mt-8 pb-8">
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}

