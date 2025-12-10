/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 목록에서 각 관광지를 카드 형태로 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (기본 이미지 fallback)
 * 2. 관광지명, 주소, 타입 뱃지 표시
 * 3. 호버 효과 (scale, shadow)
 * 4. 클릭 시 상세페이지 이동
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/link: 클라이언트 사이드 네비게이션
 * - @/lib/types/tour: TourItem 타입
 * - @/lib/types/tour: getContentTypeName 함수
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourCardProps {
  tour: TourItem;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 선택된 상태 (지도 연동용)
   */
  isSelected?: boolean;
  /**
   * 카드 클릭 핸들러
   */
  onClick?: () => void;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 * 데이터 URI로 간단한 placeholder 생성
 */
const DEFAULT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%239ca3af'%3E이미지 없음%3C/text%3E%3C/svg%3E";

export function TourCard({
  tour,
  className,
  isSelected = false,
  onClick,
}: TourCardProps) {
  const imageUrl = tour.firstimage || tour.firstimage2 || DEFAULT_IMAGE;
  const contentTypeName = getContentTypeName(tour.contenttypeid);
  const detailUrl = `/places/${tour.contentid}`;

  return (
    <Link
      href={detailUrl}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={tour.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={85}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          onError={(e) => {
            // 이미지 로드 실패 시 기본 이미지로 대체
            const target = e.target as HTMLImageElement;
            if (target.src !== DEFAULT_IMAGE) {
              target.src = DEFAULT_IMAGE;
            }
          }}
        />
        {/* 관광 타입 뱃지 (이미지 위 오버레이) */}
        <div className="absolute top-2 right-2">
          <span className="rounded-full bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
            {contentTypeName}
          </span>
        </div>
      </div>

      {/* 카드 내용 */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* 관광지명 */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
          {tour.title}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="line-clamp-1">
            {tour.addr1}
            {tour.addr2 && ` ${tour.addr2}`}
          </span>
        </div>

        {/* 카테고리 (있는 경우) */}
        {tour.cat1 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {tour.cat1 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {tour.cat1}
              </span>
            )}
            {tour.cat2 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {tour.cat2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

