/**
 * @file app/bookmarks/page.tsx
 * @description 북마크 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지
 *
 * 주요 기능:
 * 1. 인증된 사용자만 접근 가능
 * 2. 북마크한 관광지 목록 표시
 * 3. 관광지 상세 정보 조회 및 표시
 * 4. 빈 상태 처리 (북마크 없을 때)
 * 5. 로딩 상태 (Skeleton UI)
 *
 * @dependencies
 * - @clerk/nextjs: auth, redirect
 * - @/lib/api/supabase-api: getUserBookmarks
 * - @/lib/api/tour-api: getDetailCommon
 * - @/components/tour-card: TourCard
 * - @/components/tour-list: TourList
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserBookmarks } from "@/lib/api/supabase-api";
import { getDetailCommon } from "@/lib/api/tour-api";
import { TourList } from "@/components/tour-list";
import type { TourItem } from "@/lib/types/tour";
import { Bookmark } from "lucide-react";
import Link from "next/link";

/**
 * 북마크 페이지 메타데이터
 */
export const metadata = {
  title: "북마크 - My Trip",
  description: "북마크한 관광지 목록을 확인하세요.",
};

/**
 * 북마크 페이지
 */
export default async function BookmarksPage() {
  // 인증 확인
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 북마크 목록 조회
  let bookmarkContentIds: string[] = [];
  let tours: TourItem[] = [];
  let error: Error | null = null;

  try {
    bookmarkContentIds = await getUserBookmarks();

    // 북마크가 있으면 각 관광지 상세 정보 조회
    if (bookmarkContentIds.length > 0) {
      const tourPromises = bookmarkContentIds.map(async (contentId) => {
        try {
          const detail = await getDetailCommon(contentId);
          // TourDetail을 TourItem으로 변환
          return {
            contentid: detail.contentid,
            contenttypeid: detail.contenttypeid,
            title: detail.title,
            addr1: detail.addr1,
            addr2: detail.addr2,
            mapx: detail.mapx,
            mapy: detail.mapy,
            firstimage: detail.firstimage,
            firstimage2: detail.firstimage2,
            tel: detail.tel,
            cat1: detail.cat1,
            cat2: detail.cat2,
            cat3: detail.cat3,
            modifiedtime: new Date().toISOString(), // 북마크 시간 대신 현재 시간
          } as TourItem;
        } catch (err) {
          console.error(`관광지 ${contentId} 조회 실패:`, err);
          return null;
        }
      });

      const results = await Promise.allSettled(tourPromises);
      tours = results
        .filter(
          (result): result is PromiseFulfilledResult<TourItem> =>
            result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);
    }
  } catch (err) {
    console.error("북마크 목록 조회 실패:", err);
    error = err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다.");
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">북마크</h1>
          </div>
          <p className="text-muted-foreground">
            북마크한 관광지를 한눈에 확인하세요.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              북마크 목록을 불러올 수 없습니다
            </h2>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        ) : bookmarkContentIds.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">북마크가 없습니다</h2>
            <p className="text-muted-foreground mb-6">
              관광지 상세 페이지에서 북마크를 추가해보세요.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              관광지 둘러보기
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-sm text-muted-foreground">
              총 {tours.length}개의 북마크
            </div>
            <TourList tours={tours} isLoading={false} error={null} />
          </div>
        )}
      </div>
    </main>
  );
}

