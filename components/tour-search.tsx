/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드로 관광지를 검색하는 컴포넌트
 *
 * 주요 기능:
 * 1. 검색창 UI
 * 2. 엔터 또는 버튼 클릭으로 검색
 * 3. 검색 중 로딩 스피너
 * 4. URL 쿼리 파라미터로 상태 관리
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/input: Input 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: Search, X 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourSearchProps {
  /**
   * 검색창 크기
   * @default "default"
   */
  size?: "default" | "lg";
  /**
   * 검색창 위치
   * @default "navbar"
   */
  variant?: "navbar" | "hero";
  /**
   * 추가 클래스명
   */
  className?: string;
}

export function TourSearch({
  size = "default",
  variant = "navbar",
  className,
}: TourSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [isSearching, setIsSearching] = useState(false);

  // URL 쿼리 파라미터 변경 시 검색어 동기화
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    setKeyword(urlKeyword);
  }, [searchParams]);

  /**
   * 검색 실행
   */
  const handleSearch = (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      // 빈 검색어면 키워드 파라미터 제거
      const params = new URLSearchParams(searchParams.toString());
      params.delete("keyword");
      params.delete("page");
      router.push(`/?${params.toString()}`);
      return;
    }

    setIsSearching(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("keyword", searchKeyword.trim());
    params.delete("page"); // 페이지는 항상 1로 리셋
    router.push(`/?${params.toString()}`);

    // 검색 완료 후 로딩 상태 해제
    setTimeout(() => setIsSearching(false), 500);
  };

  /**
   * 검색어 초기화
   */
  const handleClear = () => {
    setKeyword("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("keyword");
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  /**
   * 엔터 키 처리
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(keyword);
    }
  };

  const isLarge = size === "lg";
  const isHero = variant === "hero";

  if (isHero) {
    // Hero 섹션용 큰 검색창
    return (
      <div className={cn("w-full max-w-2xl mx-auto", className)}>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="관광지명, 주소, 설명으로 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "pl-10 pr-10 h-12 text-base",
                isSearching && "opacity-50"
              )}
              disabled={isSearching}
            />
            {keyword && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleClear}
                aria-label="검색어 지우기"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            onClick={() => handleSearch(keyword)}
            disabled={isSearching}
            size={isLarge ? "lg" : "default"}
            className={cn(isLarge && "h-12 px-8")}
          >
            {isSearching ? (
              <>
                <span className="mr-2">검색 중...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                검색
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Navbar용 작은 검색창
  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="text"
          placeholder="관광지 검색..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-9 pr-9 w-[300px] lg:w-[400px]",
            isSearching && "opacity-50"
          )}
          disabled={isSearching}
        />
        {keyword && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={handleClear}
            aria-label="검색어 지우기"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}


