/**
 * @file loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * API 호출 중이나 데이터 로딩 중에 표시하는 스피너 컴포넌트
 *
 * 주요 기능:
 * - 다양한 크기 지원 (sm, md, lg)
 * - 중앙 정렬 옵션
 * - 텍스트 라벨 옵션
 *
 * @dependencies
 * - lucide-react: Loader2 아이콘
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /**
   * 스피너 크기
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 중앙 정렬 여부
   * @default false
   */
  centered?: boolean;
  /**
   * 로딩 텍스트
   */
  text?: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Loading({ size = "md", centered = false, text, className }: LoadingProps) {
  const spinner = (
    <Loader2
      className={cn("animate-spin text-primary", sizeMap[size], className)}
      aria-label="로딩 중"
    />
  );

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        {spinner}
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center gap-2">
        {spinner}
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    );
  }

  return spinner;
}


