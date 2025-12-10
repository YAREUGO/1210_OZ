/**
 * @file error.tsx
 * @description 에러 메시지 컴포넌트
 *
 * API 에러나 기타 에러 상황을 사용자에게 표시하는 컴포넌트
 *
 * 주요 기능:
 * - 에러 메시지 표시
 * - 재시도 버튼 제공
 * - 다양한 에러 타입 지원
 *
 * @dependencies
 * - lucide-react: AlertCircle, RefreshCw 아이콘
 * - @/components/ui/button: Button 컴포넌트
 */

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorProps {
  /**
   * 에러 메시지
   */
  message?: string;
  /**
   * 에러 제목
   */
  title?: string;
  /**
   * 재시도 함수
   */
  onRetry?: () => void;
  /**
   * 재시도 버튼 텍스트
   * @default "다시 시도"
   */
  retryText?: string;
  /**
   * 중앙 정렬 여부
   * @default true
   */
  centered?: boolean;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 에러 크기
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: {
    icon: "h-4 w-4",
    title: "text-sm",
    message: "text-xs",
  },
  md: {
    icon: "h-6 w-6",
    title: "text-base",
    message: "text-sm",
  },
  lg: {
    icon: "h-8 w-8",
    title: "text-lg",
    message: "text-base",
  },
};

export function Error({
  message = "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  title = "오류 발생",
  onRetry,
  retryText = "다시 시도",
  centered = true,
  className,
  size = "md",
}: ErrorProps) {
  const sizes = sizeMap[size];

  const content = (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className={sizes.icon} aria-hidden="true" />
        <h3 className={cn("font-semibold", sizes.title)}>{title}</h3>
      </div>
      {message && <p className={cn("text-muted-foreground", sizes.message)}>{message}</p>}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[200px] py-8">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * 네트워크 에러 컴포넌트
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Error
      title="네트워크 오류"
      message="인터넷 연결을 확인하고 다시 시도해주세요."
      onRetry={onRetry}
      retryText="다시 시도"
    />
  );
}

/**
 * 404 에러 컴포넌트
 */
export function NotFoundError({ message = "요청한 페이지를 찾을 수 없습니다." }: { message?: string }) {
  return (
    <Error
      title="페이지를 찾을 수 없습니다"
      message={message}
      onRetry={undefined}
      centered={true}
    />
  );
}

/**
 * API 에러 컴포넌트
 */
export function ApiError({
  message = "데이터를 불러오는 중 오류가 발생했습니다.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Error
      title="데이터 로딩 오류"
      message={message}
      onRetry={onRetry}
      retryText="다시 시도"
    />
  );
}


