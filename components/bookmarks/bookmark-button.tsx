/**
 * @file bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크에 추가/제거하는 버튼 컴포넌트
 *
 * 주요 기능:
 * 1. 북마크 상태 확인 (Supabase 조회)
 * 2. 북마크 추가/제거 기능
 * 3. 인증된 사용자 확인 (Clerk)
 * 4. 로그인하지 않은 경우: 로그인 유도
 *
 * @dependencies
 * - @clerk/nextjs: useUser, SignInButton
 * - @/lib/api/supabase-api: getBookmark, addBookmark, removeBookmark
 * - @/lib/utils/toast: toast 유틸리티
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: Star 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBookmark, addBookmark, removeBookmark } from "@/lib/api/supabase-api";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  /**
   * 콘텐츠 ID
   */
  contentId: string;
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

export function BookmarkButton({
  contentId,
  size = "default",
  variant = "outline",
  className,
  showText = true,
}: BookmarkButtonProps) {
  const { isSignedIn, user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  /**
   * 북마크 상태 확인
   */
  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    const checkBookmark = async () => {
      try {
        const bookmarked = await getBookmark(contentId);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error("북마크 상태 확인 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkBookmark();
  }, [contentId, isSignedIn]);

  /**
   * 북마크 토글
   */
  const handleToggle = async () => {
    if (!isSignedIn) {
      return;
    }

    setIsToggling(true);

    try {
      if (isBookmarked) {
        const success = await removeBookmark(contentId);
        if (success) {
          setIsBookmarked(false);
          toast.success("북마크에서 제거되었습니다");
        } else {
          toast.error("북마크 제거에 실패했습니다");
        }
      } else {
        const success = await addBookmark(contentId);
        if (success) {
          setIsBookmarked(true);
          toast.success("북마크에 추가되었습니다");
        } else {
          toast.error("북마크 추가에 실패했습니다");
        }
      }
    } catch (error) {
      console.error("북마크 토글 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "북마크 처리에 실패했습니다"
      );
    } finally {
      setIsToggling(false);
    }
  };

  // 로그인하지 않은 경우
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
          aria-label="북마크하려면 로그인하세요"
        >
          <Star className="h-4 w-4" />
          {showText && <span>북마크</span>}
        </Button>
      </SignInButton>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        disabled
        aria-label="북마크 상태 확인 중"
      >
        <Star className="h-4 w-4" />
        {showText && <span>북마크</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={handleToggle}
      disabled={isToggling}
      aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
    >
      <Star
        className={cn(
          "h-4 w-4",
          isBookmarked && "fill-yellow-400 text-yellow-400"
        )}
      />
      {showText && <span>{isBookmarked ? "북마크됨" : "북마크"}</span>}
    </Button>
  );
}


