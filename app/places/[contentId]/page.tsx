/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 한국관광공사 API를 활용한 관광지 상세 정보 페이지
 *
 * 주요 기능:
 * 1. 기본 정보 표시 (관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요)
 * 2. 운영 정보 표시 (운영시간, 휴무일, 이용요금, 주차 정보 등)
 * 3. 이미지 갤러리
 * 4. 지도 섹션 (위치 표시, 길찾기)
 * 5. 공유 기능 (URL 복사)
 * 6. 북마크 기능 (향후 구현)
 *
 * @dependencies
 * - @/lib/api/tour-api: getDetailCommon, getDetailIntro, getDetailImage 함수
 * - @/components/tour-detail: 상세페이지 컴포넌트들
 * - next/navigation: useRouter (뒤로가기)
 */

import { notFound } from "next/navigation";
import { getDetailCommon, getDetailIntro, getDetailImage } from "@/lib/api/tour-api";
import { TourApiNotFoundError } from "@/lib/api/tour-api";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { DetailMap } from "@/components/tour-detail/detail-map";
import { ShareButton } from "@/components/tour-detail/share-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * 동적 메타데이터 생성
 */
export async function generateMetadata({ params }: DetailPageProps) {
  const { contentId } = await params;

  try {
    const detail = await getDetailCommon(contentId);

    return {
      title: `${detail.title} - My Trip`,
      description: detail.overview
        ? detail.overview.slice(0, 100).replace(/\n/g, " ")
        : `${detail.title} 관광지 정보`,
      openGraph: {
        title: detail.title,
        description: detail.overview
          ? detail.overview.slice(0, 100).replace(/\n/g, " ")
          : `${detail.title} 관광지 정보`,
        images: detail.firstimage
          ? [
              {
                url: detail.firstimage,
                width: 1200,
                height: 630,
                alt: detail.title,
              },
            ]
          : [],
        url: `https://${process.env.VERCEL_URL || "localhost:3000"}/places/${contentId}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: detail.title,
        description: detail.overview
          ? detail.overview.slice(0, 100).replace(/\n/g, " ")
          : `${detail.title} 관광지 정보`,
        images: detail.firstimage ? [detail.firstimage] : [],
      },
    };
  } catch (error) {
    return {
      title: "관광지 상세정보 - My Trip",
      description: "관광지 상세 정보를 확인하세요.",
    };
  }
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { contentId } = await params;

  let detail;
  let intro;
  let images;
  let error: Error | null = null;

  try {
    // 기본 정보 조회
    detail = await getDetailCommon(contentId);

    // 운영 정보와 이미지는 병렬로 조회 (실패해도 계속 진행)
    const [introResult, imagesResult] = await Promise.allSettled([
      getDetailIntro(contentId, detail.contenttypeid).catch(() => null),
      getDetailImage(contentId).catch(() => []),
    ]);

    if (introResult.status === "fulfilled") {
      intro = introResult.value;
    }

    if (imagesResult.status === "fulfilled") {
      images = imagesResult.value;
    } else {
      images = [];
    }
  } catch (err) {
    console.error("상세 정보 조회 실패:", err);
    if (err instanceof TourApiNotFoundError) {
      notFound();
    }
    error = err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다.");
  }

  if (!detail) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {/* 헤더: 뒤로가기 버튼 + 공유 버튼 */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>목록으로</span>
              </Button>
            </Link>
            <ShareButton size="sm" showText={false} />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">오류가 발생했습니다: {error.message}</p>
            <Link href="/">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <DetailInfo detail={detail} />
            {intro && <DetailIntro intro={intro} />}
            {images && images.length > 0 && (
              <DetailGallery
                images={images}
                firstImage={detail.firstimage}
                title={detail.title}
              />
            )}
            <DetailMap detail={detail} />
          </div>
        )}
      </div>
    </main>
  );
}

