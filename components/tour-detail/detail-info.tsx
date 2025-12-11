/**
 * @file detail-info.tsx
 * @description 관광지 기본 정보 섹션 컴포넌트
 *
 * 관광지 상세페이지의 기본 정보를 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 관광지명 (대제목)
 * 2. 대표 이미지 (크게 표시)
 * 3. 주소 표시 및 복사 기능
 * 4. 전화번호 (클릭 시 전화 연결)
 * 5. 홈페이지 (링크)
 * 6. 개요 (긴 설명문)
 * 7. 관광 타입 및 카테고리 뱃지
 * 8. 정보 없는 항목 숨김 처리
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - @/lib/types/tour: TourDetail 타입, getContentTypeName 함수
 * - @/lib/utils/toast: toast 유틸리티
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: 아이콘
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Globe, Copy, Check } from "lucide-react";
import type { TourDetail } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/types/tour";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

interface DetailInfoProps {
  /**
   * 관광지 상세 정보
   */
  detail: TourDetail;
}

export function DetailInfo({ detail }: DetailInfoProps) {
  const [copied, setCopied] = useState(false);

  /**
   * 주소 복사 기능
   */
  const handleCopyAddress = async () => {
    const address = `${detail.addr1}${detail.addr2 ? ` ${detail.addr2}` : ""}`;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("주소가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("주소 복사 실패:", error);
      toast.error("주소 복사에 실패했습니다");
    }
  };

  /**
   * 전화번호 클릭 핸들러
   */
  const handlePhoneClick = (tel: string) => {
    window.location.href = `tel:${tel}`;
  };

  const fullAddress = `${detail.addr1}${detail.addr2 ? ` ${detail.addr2}` : ""}`;
  const contentTypeName = getContentTypeName(detail.contenttypeid);

  return (
    <div className="space-y-8">
      {/* 관광지명 */}
      <div>
        <h1 className="text-4xl font-bold mb-4">{detail.title}</h1>
        {contentTypeName && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
              {contentTypeName}
            </span>
            {detail.cat1 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                {detail.cat1}
              </span>
            )}
            {detail.cat2 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                {detail.cat2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 대표 이미지 */}
      {detail.firstimage && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          <Image
            src={detail.firstimage}
            alt={detail.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
            quality={90}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
      )}

      {/* 기본 정보 카드 */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        {/* 주소 */}
        {fullAddress && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">주소</p>
              <p className="text-base break-words">{fullAddress}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-8 gap-2"
                onClick={handleCopyAddress}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>주소 복사</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 전화번호 */}
        {detail.tel && (
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">전화번호</p>
              <Button
                variant="link"
                className="h-auto p-0 text-base font-normal"
                onClick={() => handlePhoneClick(detail.tel!)}
              >
                {detail.tel}
              </Button>
            </div>
          </div>
        )}

        {/* 홈페이지 */}
        {detail.homepage && (
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">홈페이지</p>
              <a
                href={detail.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-primary hover:underline break-all"
              >
                {detail.homepage}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 개요 */}
      {detail.overview && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">개요</h2>
          <div
            className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: detail.overview }}
          />
        </div>
      )}
    </div>
  );
}


