/**
 * @file share-button.tsx
 * @description 공유 버튼 컴포넌트
 *
 * 관광지 상세페이지 URL을 복사하여 공유하는 기능
 *
 * 주요 기능:
 * 1. URL 복사 기능 (클립보드 API)
 * 2. 복사 완료 토스트 메시지
 * 3. HTTPS 환경 확인
 * 4. 공유 아이콘 버튼
 *
 * @dependencies
 * - @/lib/utils/toast: toast 유틸리티
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: Share2, Link, Check 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import { Share2, Link, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  /**
   * 공유할 URL (기본값: 현재 페이지 URL)
   */
  url?: string;
  /**
   * 버튼 크기
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * 버튼 variant
   */
  variant?: "default" | "outline" | "ghost" | "secondary";
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 텍스트 표시 여부
   */
  showText?: boolean;
}

export function ShareButton({
  url,
  size = "default",
  variant = "outline",
  className,
  showText = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    // URL이 제공되지 않으면 현재 페이지 URL 사용
    if (url) {
      setShareUrl(url);
    } else if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, [url]);

  /**
   * URL 복사 기능
   */
  const handleShare = async () => {
    // HTTPS 환경 확인
    if (typeof window === "undefined") {
      toast.error("브라우저 환경에서만 사용할 수 있습니다");
      return;
    }

    if (!navigator.clipboard) {
      // 클립보드 API를 지원하지 않는 경우 fallback
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        toast.success("URL이 복사되었습니다");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("URL 복사 실패:", error);
        toast.error("URL 복사에 실패했습니다");
      } finally {
        document.body.removeChild(textArea);
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("URL이 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("URL 복사 실패:", error);
      toast.error("URL 복사에 실패했습니다");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn("gap-2", className)}
      aria-label={copied ? "URL 복사됨" : "URL 공유하기"}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {showText && <span>복사됨</span>}
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          {showText && <span>공유하기</span>}
        </>
      )}
    </Button>
  );
}

