/**
 * @file detail-gallery.tsx
 * @description 관광지 이미지 갤러리 컴포넌트
 *
 * 관광지 상세페이지의 이미지 갤러리를 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 대표 이미지 + 서브 이미지들 그리드 레이아웃
 * 2. 이미지 클릭 시 전체화면 모달
 * 3. 이미지 없으면 기본 이미지
 * 4. Next.js Image 컴포넌트 사용 (최적화)
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - @/lib/types/tour: TourImage 타입
 * - @/components/ui/dialog: Dialog 컴포넌트 (모달)
 * - lucide-react: X 아이콘
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { TourImage } from "@/lib/types/tour";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DetailGalleryProps {
  /**
   * 이미지 목록
   */
  images: TourImage[];
  /**
   * 대표 이미지 URL (기본 정보에서 가져온 firstimage)
   */
  firstImage?: string;
  /**
   * 관광지명 (alt 텍스트용)
   */
  title?: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 기본 이미지 SVG (이미지가 없을 때)
 */
const DEFAULT_IMAGE = (
  <svg
    className="w-full h-full text-muted-foreground"
    fill="none"
    viewBox="0 0 400 300"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="400" height="300" fill="currentColor" opacity="0.1" />
    <path
      d="M200 100L150 150H250L200 100Z"
      fill="currentColor"
      opacity="0.3"
    />
    <circle cx="200" cy="200" r="30" fill="currentColor" opacity="0.3" />
    <text
      x="200"
      y="250"
      textAnchor="middle"
      className="text-sm fill-current opacity-50"
    >
      이미지 없음
    </text>
  </svg>
);

export function DetailGallery({
  images,
  firstImage,
  title = "관광지",
  className,
}: DetailGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // 모든 이미지 URL 수집 (대표 이미지 + 갤러리 이미지)
  const allImages: string[] = [];
  if (firstImage) {
    allImages.push(firstImage);
  }
  images.forEach((img) => {
    if (img.originimgurl && !allImages.includes(img.originimgurl)) {
      allImages.push(img.originimgurl);
    }
  });

  // 이미지가 없으면 null 반환
  if (allImages.length === 0) {
    return null;
  }

  const selectedImage = selectedImageIndex !== null ? allImages[selectedImageIndex] : null;

  return (
    <div className={className}>
      <h2 className="text-2xl font-semibold mb-6">이미지 갤러리</h2>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allImages.map((imageUrl, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className="relative aspect-video rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity group"
          >
            <Image
              src={imageUrl}
              alt={`${title} 이미지 ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* 전체화면 모달 */}
      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={(open) => !open && setSelectedImageIndex(null)}
      >
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 bg-black/95 border-none sm:max-w-[95vw]">
          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* 닫기 버튼 */}
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="닫기"
              >
                <X className="h-6 w-6" />
              </button>

              {/* 이미지 */}
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <Image
                  src={selectedImage}
                  alt={`${title} 이미지 ${selectedImageIndex! + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* 이전/다음 버튼 (이미지가 여러 개일 때) */}
              {allImages.length > 1 && (
                <>
                  {selectedImageIndex! > 0 && (
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex! - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                      aria-label="이전 이미지"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  )}
                  {selectedImageIndex! < allImages.length - 1 && (
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex! + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                      aria-label="다음 이미지"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </>
              )}

              {/* 이미지 인덱스 표시 */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                  {selectedImageIndex! + 1} / {allImages.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

