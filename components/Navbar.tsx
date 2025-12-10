/**
 * @file Navbar.tsx
 * @description 메인 네비게이션 바 컴포넌트
 *
 * 주요 기능:
 * 1. 로고 및 브랜드명 표시
 * 2. 네비게이션 링크 (홈, 통계, 북마크)
 * 3. 검색창 (향후 구현 예정)
 * 4. 로그인/회원가입 버튼 (Clerk)
 * 5. 사용자 프로필 버튼 (로그인 시)
 *
 * @dependencies
 * - @clerk/nextjs: 인증 관련 컴포넌트
 * - next/link: 클라이언트 사이드 네비게이션
 * - lucide-react: 아이콘
 */

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, BarChart3, Bookmark } from "lucide-react";
import { TourSearch } from "@/components/tour-search";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* 로고 및 브랜드 */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity">
            <span className="text-primary">My Trip</span>
          </Link>

          {/* 네비게이션 링크 (데스크톱) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>홈</span>
            </Link>
            <Link
              href="/stats"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>통계</span>
            </Link>
            <Link
              href="/bookmarks"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Bookmark className="h-4 w-4" />
              <span>북마크</span>
            </Link>
          </nav>
        </div>

        {/* 검색창 및 인증 버튼 */}
        <div className="flex items-center gap-4">
          {/* 검색창 */}
          <div className="hidden lg:block">
            <TourSearch variant="navbar" />
          </div>

          {/* 로그인/회원가입 버튼 */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default">로그인</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
