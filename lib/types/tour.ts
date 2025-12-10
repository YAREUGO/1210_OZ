/**
 * @file tour.ts
 * @description 관광지 관련 TypeScript 타입 정의
 *
 * 한국관광공사 공공 API 응답 데이터 구조를 기반으로 한 타입 정의
 *
 * 주요 타입:
 * - TourItem: 관광지 목록 항목
 * - TourDetail: 상세 정보
 * - TourIntro: 운영 정보 (타입별로 필드가 다름)
 * - TourImage: 이미지 정보
 * - PetTourInfo: 반려동물 동반 정보
 * - AreaCode: 지역코드 정보
 *
 * @see {@link /docs/PRD.md} - 데이터 구조 명세
 */

/**
 * 지역코드 정보
 * areaCode2 API 응답
 */
export interface AreaCode {
  code: string; // 지역코드
  name: string; // 지역명
  rnum?: number; // 순번
}

/**
 * 관광지 목록 항목
 * areaBasedList2, searchKeyword2 API 응답
 */
export interface TourItem {
  addr1: string; // 주소
  addr2?: string; // 상세주소
  areacode: string; // 지역코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  tel?: string; // 전화번호
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  modifiedtime: string; // 수정일
}

/**
 * 상세 정보
 * detailCommon2 API 응답
 */
export interface TourDetail {
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  addr1: string; // 주소
  addr2?: string; // 상세주소
  zipcode?: string; // 우편번호
  tel?: string; // 전화번호
  homepage?: string; // 홈페이지
  overview?: string; // 개요 (긴 설명)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
}

/**
 * 운영 정보
 * detailIntro2 API 응답
 * 
 * 주의: contentTypeId에 따라 필드가 다릅니다.
 * - 관광지(12), 문화시설(14), 축제/행사(15), 여행코스(25), 레포츠(28), 숙박(32), 쇼핑(38), 음식점(39)
 * 
 * 공통 필드:
 * - contentid, contenttypeid
 * 
 * 타입별 필드 예시:
 * - usetime: 이용시간
 * - restdate: 휴무일
 * - infocenter: 문의처
 * - parking: 주차 가능
 * - chkpet: 반려동물 동반
 * - 등등...
 */
export interface TourIntro {
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  // 타입별로 필드가 다르므로 인덱스 시그니처 사용
  [key: string]: string | undefined;
}

/**
 * 이미지 정보
 * detailImage2 API 응답
 */
export interface TourImage {
  contentid: string; // 콘텐츠ID
  originimgurl: string; // 원본 이미지 URL
  serialnum: string; // 이미지 순번
  smallimageurl?: string; // 썸네일 이미지 URL
}

/**
 * 반려동물 동반 여행 정보
 * detailPetTour2 API 응답
 */
export interface PetTourInfo {
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  chkpetleash?: string; // 애완동물 동반 여부
  chkpetsize?: string; // 애완동물 크기
  chkpetplace?: string; // 입장 가능 장소 (실내/실외)
  chkpetfee?: string; // 추가 요금
  petinfo?: string; // 기타 반려동물 정보
  parking?: string; // 주차장 정보
}

/**
 * Content Type ID (관광 타입) 상수
 */
export const CONTENT_TYPE = {
  TOURIST_SPOT: "12", // 관광지
  CULTURAL_FACILITY: "14", // 문화시설
  FESTIVAL: "15", // 축제/행사
  TOUR_COURSE: "25", // 여행코스
  LEISURE_SPORTS: "28", // 레포츠
  ACCOMMODATION: "32", // 숙박
  SHOPPING: "38", // 쇼핑
  RESTAURANT: "39", // 음식점
} as const;

/**
 * Content Type ID 타입
 */
export type ContentTypeId = typeof CONTENT_TYPE[keyof typeof CONTENT_TYPE];

/**
 * Content Type ID에 해당하는 이름 매핑
 */
export const CONTENT_TYPE_NAME: Record<ContentTypeId, string> = {
  [CONTENT_TYPE.TOURIST_SPOT]: "관광지",
  [CONTENT_TYPE.CULTURAL_FACILITY]: "문화시설",
  [CONTENT_TYPE.FESTIVAL]: "축제/행사",
  [CONTENT_TYPE.TOUR_COURSE]: "여행코스",
  [CONTENT_TYPE.LEISURE_SPORTS]: "레포츠",
  [CONTENT_TYPE.ACCOMMODATION]: "숙박",
  [CONTENT_TYPE.SHOPPING]: "쇼핑",
  [CONTENT_TYPE.RESTAURANT]: "음식점",
};

/**
 * Content Type ID로 이름을 가져옵니다.
 */
export function getContentTypeName(contentTypeId: string): string {
  return CONTENT_TYPE_NAME[contentTypeId as ContentTypeId] || "알 수 없음";
}

