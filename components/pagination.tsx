/**
 * @file pagination.tsx
 * @description 페이지네이션 컴포넌트
 *
 * 페이지 번호 선택 방식의 페이지네이션 컴포넌트
 *
 * 주요 기능:
 * 1. 페이지 번호 표시
 * 2. 이전/다음 페이지 버튼
 * 3. 첫 페이지/마지막 페이지 이동
 * 4. URL 쿼리 파라미터로 상태 관리
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: ChevronLeft, ChevronRight 아이콘
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  /**
   * 현재 페이지 번호
   */
  currentPage: number;
  /**
   * 전체 항목 수
   */
  totalCount: number;
  /**
   * 페이지당 항목 수
   */
  itemsPerPage: number;
  /**
   * 표시할 최대 페이지 번호 수
   * @default 5
   */
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalCount,
  itemsPerPage,
  maxVisiblePages = 5,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 페이지가 1개 이하이면 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }

  /**
   * 페이지 이동
   */
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`/?${params.toString()}`);
    
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * 표시할 페이지 번호 계산
   */
  const getVisiblePages = (): number[] => {
    const pages: number[] = [];
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    // 시작과 끝 조정
    if (end - start < maxVisiblePages - 1) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisiblePages - 1);
      } else {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const showFirstPage = visiblePages[0] > 1;
  const showLastPage = visiblePages[visiblePages.length - 1] < totalPages;

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="페이지네이션"
    >
      {/* 첫 페이지로 이동 */}
      {showFirstPage && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            aria-label="첫 페이지로 이동"
          >
            1
          </Button>
          {visiblePages[0] > 2 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}
        </>
      )}

      {/* 이전 페이지 버튼 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 페이지 번호 */}
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(page)}
          aria-label={`${page}페이지로 이동`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Button>
      ))}

      {/* 다음 페이지 버튼 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* 마지막 페이지로 이동 */}
      {showLastPage && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            aria-label="마지막 페이지로 이동"
          >
            {totalPages}
          </Button>
        </>
      )}
    </nav>
  );
}


