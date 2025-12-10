/**
 * @file detail-pet-tour.tsx
 * @description 반려동물 동반 정보 섹션 컴포넌트
 *
 * 상세 페이지에서 반려동물 동반 관련 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 반려동물 동반 가능 여부 표시
 * 2. 반려동물 크기 제한 정보
 * 3. 입장 가능 장소 (실내/실외)
 * 4. 추가 요금 정보
 * 5. 주차장 정보
 *
 * @dependencies
 * - lib/api/tour-api: getDetailPetTour
 * - lib/types/tour: PetTourInfo
 */

"use client";

import { useEffect, useState } from "react";
import {
  PawPrint,
  Ruler,
  MapPin,
  Coins,
  Car,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { getDetailPetTour } from "@/lib/api/tour-api";
import type { PetTourInfo } from "@/lib/types/tour";

interface DetailPetTourProps {
  contentId: string;
}

/**
 * 반려동물 정보 아이템 컴포넌트
 */
function PetInfoItem({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg ${
        highlight
          ? "bg-primary/10 dark:bg-primary/20"
          : "bg-muted/50 dark:bg-muted/30"
      }`}
    >
      <Icon
        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
          highlight ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p
          className={`text-sm mt-0.5 ${
            highlight ? "font-medium text-primary" : "text-foreground"
          }`}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    </div>
  );
}

/**
 * 반려동물 동반 가능 여부 뱃지
 */
function PetBadge({ available }: { available: boolean }) {
  if (available) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
        <CheckCircle className="h-4 w-4" />
        <span>반려동물 동반 가능</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium">
      <XCircle className="h-4 w-4" />
      <span>반려동물 동반 불가</span>
    </div>
  );
}

/**
 * 로딩 스켈레톤
 */
function PetTourSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-muted rounded" />
        <div className="h-6 w-32 bg-muted rounded" />
      </div>
      <div className="h-8 w-48 bg-muted rounded-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * 반려동물 동반 정보 섹션
 */
export function DetailPetTour({ contentId }: DetailPetTourProps) {
  const [petInfo, setPetInfo] = useState<PetTourInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPetInfo() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getDetailPetTour(contentId);
        setPetInfo(data);
      } catch (err) {
        console.error("반려동물 정보 조회 실패:", err);
        setError(
          err instanceof Error ? err.message : "정보를 불러올 수 없습니다.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchPetInfo();
  }, [contentId]);

  // 로딩 중
  if (isLoading) {
    return (
      <section className="border-t pt-6">
        <PetTourSkeleton />
      </section>
    );
  }

  // 에러 발생
  if (error) {
    return null; // 에러 시 섹션 숨김
  }

  // 반려동물 정보가 없는 경우
  if (!petInfo) {
    return null; // 정보 없으면 섹션 숨김
  }

  // 표시할 정보가 있는지 확인
  const hasInfo =
    petInfo.chkpetleash ||
    petInfo.chkpetsize ||
    petInfo.chkpetplace ||
    petInfo.chkpetfee ||
    petInfo.petinfo ||
    petInfo.parking;

  if (!hasInfo) {
    return null;
  }

  // 반려동물 동반 가능 여부 판단
  const isPetAllowed =
    petInfo.chkpetleash?.includes("가능") ||
    petInfo.chkpetleash?.includes("허용") ||
    petInfo.chkpetleash?.includes("OK") ||
    petInfo.chkpetleash?.includes("Y");

  return (
    <section className="border-t pt-6">
      <div className="flex items-center gap-2 mb-4">
        <PawPrint className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">반려동물 동반 정보</h2>
      </div>

      {/* 동반 가능 여부 뱃지 */}
      {petInfo.chkpetleash && (
        <div className="mb-4">
          <PetBadge available={isPetAllowed} />
        </div>
      )}

      {/* 정보 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {petInfo.chkpetleash && (
          <PetInfoItem
            icon={PawPrint}
            label="동반 조건"
            value={petInfo.chkpetleash}
            highlight
          />
        )}

        {petInfo.chkpetsize && (
          <PetInfoItem
            icon={Ruler}
            label="크기 제한"
            value={petInfo.chkpetsize}
          />
        )}

        {petInfo.chkpetplace && (
          <PetInfoItem
            icon={MapPin}
            label="입장 가능 장소"
            value={petInfo.chkpetplace}
          />
        )}

        {petInfo.chkpetfee && (
          <PetInfoItem
            icon={Coins}
            label="추가 요금"
            value={petInfo.chkpetfee}
          />
        )}

        {petInfo.parking && (
          <PetInfoItem icon={Car} label="주차 정보" value={petInfo.parking} />
        )}

        {petInfo.petinfo && (
          <PetInfoItem icon={Info} label="기타 안내" value={petInfo.petinfo} />
        )}
      </div>

      {/* 주의사항 */}
      <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              방문 전 확인하세요
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              반려동물 동반 정책은 변경될 수 있습니다. 방문 전 해당 시설에 직접
              문의하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
