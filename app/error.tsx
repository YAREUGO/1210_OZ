/**
 * @file app/error.tsx
 * @description 전역 에러 바운더리
 *
 * Next.js App Router의 에러 바운더리 컴포넌트
 * 서버 컴포넌트에서 발생한 에러를 처리합니다.
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 에러 추적 서비스로 전송)
    console.error("애플리케이션 에러:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">오류가 발생했습니다</h1>
          <p className="text-muted-foreground">
            {error.message || "예상치 못한 오류가 발생했습니다."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              에러 ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            다시 시도
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

