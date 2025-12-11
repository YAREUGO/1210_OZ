/**
 * @file detail-intro.tsx
 * @description 관광지 운영 정보 섹션 컴포넌트
 *
 * 관광지 상세페이지의 운영 정보를 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 운영시간/개장시간
 * 2. 휴무일
 * 3. 이용요금
 * 4. 주차 가능 여부
 * 5. 수용인원
 * 6. 체험 프로그램
 * 7. 유모차/반려동물 동반 가능 여부
 * 8. 정보 없는 항목 숨김 처리
 *
 * @dependencies
 * - @/lib/types/tour: TourIntro 타입
 * - lucide-react: 아이콘
 */

"use client";

import {
  Clock,
  Calendar,
  DollarSign,
  Car,
  Users,
  Baby,
  Dog,
  Info,
} from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";

interface DetailIntroProps {
  /**
   * 관광지 운영 정보
   */
  intro: TourIntro;
}

/**
 * 운영 정보 필드 매핑
 * contentTypeId에 따라 필드명이 다를 수 있음
 */
const FIELD_MAPPING = {
  usetime: { label: "이용시간", icon: Clock },
  usetimeculture: { label: "이용시간", icon: Clock },
  usetimefestival: { label: "이용시간", icon: Clock },
  usetimeleports: { label: "이용시간", icon: Clock },
  usetimeaccommodation: { label: "체크인/체크아웃", icon: Clock },
  usetimeshopping: { label: "영업시간", icon: Clock },
  usetimefood: { label: "영업시간", icon: Clock },
  restdate: { label: "휴무일", icon: Calendar },
  restdateculture: { label: "휴무일", icon: Calendar },
  restdatefestival: { label: "휴무일", icon: Calendar },
  restdateleports: { label: "휴무일", icon: Calendar },
  restdateaccommodation: { label: "휴무일", icon: Calendar },
  restdateshopping: { label: "휴무일", icon: Calendar },
  restdatefood: { label: "휴무일", icon: Calendar },
  usefee: { label: "이용요금", icon: DollarSign },
  usefeeleports: { label: "이용요금", icon: DollarSign },
  usefeeculture: { label: "입장료", icon: DollarSign },
  parking: { label: "주차", icon: Car },
  parkingculture: { label: "주차", icon: Car },
  parkingleports: { label: "주차", icon: Car },
  parkingaccommodation: { label: "주차", icon: Car },
  parkingshopping: { label: "주차", icon: Car },
  parkingfood: { label: "주차", icon: Car },
  accomcountculture: { label: "수용인원", icon: Users },
  accomcountleports: { label: "수용인원", icon: Users },
  accomcountaccommodation: { label: "객실 수", icon: Users },
  expguide: { label: "체험 안내", icon: Info },
  expguideculture: { label: "체험 안내", icon: Info },
  expguideleports: { label: "체험 안내", icon: Info },
  chkbabycarriage: { label: "유모차 대여", icon: Baby },
  chkbabycarriageculture: { label: "유모차 대여", icon: Baby },
  chkbabycarriageleports: { label: "유모차 대여", icon: Baby },
  chkpet: { label: "반려동물 동반", icon: Dog },
  chkpetculture: { label: "반려동물 동반", icon: Dog },
  chkpetleports: { label: "반려동물 동반", icon: Dog },
  infocenter: { label: "문의처", icon: Info },
  infocenterculture: { label: "문의처", icon: Info },
  infocenterfestival: { label: "문의처", icon: Info },
  infocenterleports: { label: "문의처", icon: Info },
  infocenteraccommodation: { label: "문의처", icon: Info },
  infocentershopping: { label: "문의처", icon: Info },
  infocenterfood: { label: "문의처", icon: Info },
} as const;

/**
 * 필드 우선순위 (표시 순서)
 */
const FIELD_PRIORITY = [
  "usetime",
  "usetimeculture",
  "usetimefestival",
  "usetimeleports",
  "usetimeaccommodation",
  "usetimeshopping",
  "usetimefood",
  "restdate",
  "restdateculture",
  "restdatefestival",
  "restdateleports",
  "restdateaccommodation",
  "restdateshopping",
  "restdatefood",
  "usefee",
  "usefeeleports",
  "usefeeculture",
  "parking",
  "parkingculture",
  "parkingleports",
  "parkingaccommodation",
  "parkingshopping",
  "parkingfood",
  "accomcountculture",
  "accomcountleports",
  "accomcountaccommodation",
  "expguide",
  "expguideculture",
  "expguideleports",
  "chkbabycarriage",
  "chkbabycarriageculture",
  "chkbabycarriageleports",
  "chkpet",
  "chkpetculture",
  "chkpetleports",
  "infocenter",
  "infocenterculture",
  "infocenterfestival",
  "infocenterleports",
  "infocenteraccommodation",
  "infocentershopping",
  "infocenterfood",
];

export function DetailIntro({ intro }: DetailIntroProps) {
  /**
   * 표시할 필드 추출 및 정렬
   */
  const getDisplayFields = () => {
    const fields: Array<{
      key: string;
      label: string;
      value: string;
      icon: React.ComponentType<{ className?: string }>;
    }> = [];

    // 우선순위에 따라 필드 확인
    for (const key of FIELD_PRIORITY) {
      const value = intro[key];
      if (value && value.trim() !== "") {
        const mapping = FIELD_MAPPING[key as keyof typeof FIELD_MAPPING];
        if (mapping) {
          // 중복 제거 (같은 label이 이미 있으면 스킵)
          if (!fields.some((f) => f.label === mapping.label)) {
            fields.push({
              key,
              label: mapping.label,
              value: value.trim(),
              icon: mapping.icon,
            });
          }
        }
      }
    }

    return fields;
  };

  const displayFields = getDisplayFields();

  // 표시할 정보가 없으면 null 반환
  if (displayFields.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">운영 정보</h2>
      <div className="space-y-4">
        {displayFields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className="flex items-start gap-3">
              <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">{field.label}</p>
                <p className="text-base whitespace-pre-wrap break-words">{field.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



