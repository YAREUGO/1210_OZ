/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 이 모듈은 한국관광공사 공공 API(KorService2)를 호출하는 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 지역코드 조회 (areaCode2)
 * 2. 지역 기반 관광지 목록 조회 (areaBasedList2)
 * 3. 키워드 검색 (searchKeyword2)
 * 4. 상세페이지 기본 정보 조회 (detailCommon2)
 * 5. 상세페이지 운영 정보 조회 (detailIntro2)
 * 6. 이미지 목록 조회 (detailImage2)
 * 7. 반려동물 정보 조회 (detailPetTour2)
 *
 * 핵심 구현 로직:
 * - 공통 파라미터 자동 처리 (serviceKey, MobileOS, MobileApp, _type)
 * - 에러 처리 및 재시도 로직 (최대 3회, 지수 백오프)
 * - 환경변수 검증 (NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY)
 * - 타입 안전성 보장
 *
 * @dependencies
 * - 환경변수: NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY
 * - lib/types/tour.ts: 타입 정의
 *
 * @see {@link /docs/PRD.md} - API 명세 및 데이터 구조
 */

import type {
  AreaCode,
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  PetTourInfo,
} from "@/lib/types/tour";

// =====================================================
// 상수 정의
// =====================================================

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 지수 백오프 (밀리초)

// =====================================================
// 타입 정의
// =====================================================

/**
 * 공통 API 응답 래퍼
 */
interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// =====================================================
// 커스텀 에러 클래스
// =====================================================

export class TourApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "TourApiError";
  }
}

export class TourApiRateLimitError extends TourApiError {
  constructor(message: string = "API 호출 제한을 초과했습니다.") {
    super(message, 429);
    this.name = "TourApiRateLimitError";
  }
}

export class TourApiNotFoundError extends TourApiError {
  constructor(message: string = "요청한 리소스를 찾을 수 없습니다.") {
    super(message, 404);
    this.name = "TourApiNotFoundError";
  }
}

// =====================================================
// 유틸리티 함수
// =====================================================

/**
 * API 키를 환경변수에서 가져옵니다.
 * NEXT_PUBLIC_TOUR_API_KEY를 우선 사용하고, 없으면 TOUR_API_KEY를 사용합니다.
 */
function getApiKey(): string {
  const publicKey = process.env.NEXT_PUBLIC_TOUR_API_KEY;
  const serverKey = process.env.TOUR_API_KEY;

  if (publicKey) {
    return publicKey;
  }

  if (serverKey) {
    return serverKey;
  }

  throw new TourApiError(
    "API 키가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수를 설정해주세요."
  );
}

/**
 * 공통 파라미터를 생성합니다.
 */
function getCommonParams(): Record<string, string> {
  return {
    serviceKey: getApiKey(),
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
  };
}

/**
 * 지수 백오프를 사용한 재시도 로직이 포함된 fetch 함수
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // 성공 응답 (2xx)
    if (response.ok) {
      return response;
    }

    // 4xx 에러는 재시도하지 않음
    if (response.status >= 400 && response.status < 500) {
      if (response.status === 404) {
        throw new TourApiNotFoundError();
      }
      if (response.status === 429) {
        throw new TourApiRateLimitError();
      }
      throw new TourApiError(
        `API 요청 실패: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    // 5xx 에러는 재시도
    if (response.status >= 500 && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(
        `API 재시도 ${retryCount + 1}/${MAX_RETRIES}: ${response.status} ${response.statusText}`
      );

      return fetchWithRetry(url, options, retryCount + 1);
    }

    throw new TourApiError(
      `API 요청 실패: ${response.status} ${response.statusText}`,
      response.status
    );
  } catch (error) {
    // 네트워크 에러는 재시도
    if (error instanceof TypeError && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`네트워크 에러 재시도 ${retryCount + 1}/${MAX_RETRIES}`);

      return fetchWithRetry(url, options, retryCount + 1);
    }

    // 이미 TourApiError면 그대로 throw
    if (error instanceof TourApiError) {
      throw error;
    }

    // 기타 에러
    throw new TourApiError(
      `예상치 못한 에러가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * API 응답을 파싱하고 검증합니다.
 */
async function parseApiResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  const data = await response.json();

  // 응답 구조 검증
  if (!data.response) {
    throw new TourApiError("API 응답 형식이 올바르지 않습니다.", response.status, data);
  }

  // 에러 응답 처리
  if (data.response.header.resultCode !== "0000") {
    const errorMsg = data.response.header.resultMsg || "알 수 없는 에러가 발생했습니다.";
    throw new TourApiError(`API 에러: ${errorMsg}`, response.status, data);
  }

  return data as ApiResponse<T>;
}

/**
 * 배열을 항상 배열로 반환합니다 (단일 항목인 경우 배열로 변환)
 */
function normalizeItem<T>(item: T | T[] | undefined): T[] {
  if (!item) {
    return [];
  }
  return Array.isArray(item) ? item : [item];
}

// =====================================================
// API 함수들
// =====================================================

/**
 * 지역코드 조회
 * @param areaCode - 상위 지역코드 (선택, 없으면 전체 조회)
 * @returns 지역코드 목록
 */
export async function getAreaCode(areaCode?: string): Promise<AreaCode[]> {
  const params = new URLSearchParams({
    ...getCommonParams(),
  });

  if (areaCode) {
    params.append("areaCode", areaCode);
  }

  const url = `${BASE_URL}/areaCode2?${params.toString()}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<AreaCode>(response);

    return normalizeItem(data.response.body.items?.item);
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `지역코드 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 지역 기반 관광지 목록 조회
 * @param options - 조회 옵션
 * @returns 관광지 목록 및 메타데이터
 */
export async function getAreaBasedList(options: {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<{
  items: TourItem[];
  totalCount: number;
  numOfRows: number;
  pageNo: number;
}> {
  const params = new URLSearchParams({
    ...getCommonParams(),
    numOfRows: String(options.numOfRows || 10),
    pageNo: String(options.pageNo || 1),
  });

  if (options.areaCode) {
    params.append("areaCode", options.areaCode);
  }

  if (options.contentTypeId) {
    params.append("contentTypeId", options.contentTypeId);
  }

  const url = `${BASE_URL}/areaBasedList2?${params.toString()}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<TourItem>(response);

    const items = normalizeItem(data.response.body.items?.item);
    const totalCount = data.response.body.totalCount || 0;
    const numOfRows = data.response.body.numOfRows || 0;
    const pageNo = data.response.body.pageNo || 1;

    return {
      items,
      totalCount,
      numOfRows,
      pageNo,
    };
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `관광지 목록 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 키워드 검색
 * @param options - 검색 옵션
 * @returns 검색 결과 목록 및 메타데이터
 */
export async function searchKeyword(options: {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<{
  items: TourItem[];
  totalCount: number;
  numOfRows: number;
  pageNo: number;
}> {
  if (!options.keyword || options.keyword.trim() === "") {
    throw new TourApiError("검색 키워드를 입력해주세요.");
  }

  const params = new URLSearchParams({
    ...getCommonParams(),
    keyword: options.keyword.trim(),
    numOfRows: String(options.numOfRows || 10),
    pageNo: String(options.pageNo || 1),
  });

  if (options.areaCode) {
    params.append("areaCode", options.areaCode);
  }

  if (options.contentTypeId) {
    params.append("contentTypeId", options.contentTypeId);
  }

  const url = `${BASE_URL}/searchKeyword2?${params.toString()}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<TourItem>(response);

    const items = normalizeItem(data.response.body.items?.item);
    const totalCount = data.response.body.totalCount || 0;
    const numOfRows = data.response.body.numOfRows || 0;
    const pageNo = data.response.body.pageNo || 1;

    return {
      items,
      totalCount,
      numOfRows,
      pageNo,
    };
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `키워드 검색 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 상세페이지 기본 정보 조회
 * @param contentId - 콘텐츠 ID
 * @returns 상세 정보
 */
export async function getDetailCommon(contentId: string): Promise<TourDetail> {
  if (!contentId || contentId.trim() === "") {
    throw new TourApiError("콘텐츠 ID를 입력해주세요.");
  }

  const params = new URLSearchParams({
    ...getCommonParams(),
    contentId: contentId.trim(),
  });

  const url = `${BASE_URL}/detailCommon2?${params.toString()}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<TourDetail>(response);

    const items = normalizeItem(data.response.body.items?.item);
    if (items.length === 0) {
      throw new TourApiNotFoundError(`콘텐츠 ID ${contentId}에 해당하는 정보를 찾을 수 없습니다.`);
    }

    return items[0];
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `상세 정보 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 상세페이지 운영 정보 조회
 * @param contentId - 콘텐츠 ID
 * @param contentTypeId - 콘텐츠 타입 ID
 * @returns 운영 정보
 */
export async function getDetailIntro(
  contentId: string,
  contentTypeId: string
): Promise<TourIntro> {
  if (!contentId || contentId.trim() === "") {
    throw new TourApiError("콘텐츠 ID를 입력해주세요.");
  }

  if (!contentTypeId || contentTypeId.trim() === "") {
    throw new TourApiError("콘텐츠 타입 ID를 입력해주세요.");
  }

  const params = new URLSearchParams({
    ...getCommonParams(),
    contentId: contentId.trim(),
    contentTypeId: contentTypeId.trim(),
  });

  const url = `${BASE_URL}/detailIntro2?${params.toString()}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<TourIntro>(response);

    const items = normalizeItem(data.response.body.items?.item);
    if (items.length === 0) {
      throw new TourApiNotFoundError(
        `콘텐츠 ID ${contentId}에 해당하는 운영 정보를 찾을 수 없습니다.`
      );
    }

    return items[0];
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `운영 정보 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 이미지 목록 조회
 * @param contentId - 콘텐츠 ID
 * @returns 이미지 목록
 */
export async function getDetailImage(contentId: string): Promise<TourImage[]> {
  if (!contentId || contentId.trim() === "") {
    throw new TourApiError("콘텐츠 ID를 입력해주세요.");
  }

  const params = new URLSearchParams({
    ...getCommonParams(),
    contentId: contentId.trim(),
  });

  const url = `${BASE_URL}/detailImage2?${params.toString()}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<TourImage>(response);

    return normalizeItem(data.response.body.items?.item);
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }
    throw new TourApiError(
      `이미지 목록 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 반려동물 정보 조회
 * @param contentId - 콘텐츠 ID
 * @returns 반려동물 정보
 */
export async function getDetailPetTour(contentId: string): Promise<PetTourInfo | null> {
  if (!contentId || contentId.trim() === "") {
    throw new TourApiError("콘텐츠 ID를 입력해주세요.");
  }

  const params = new URLSearchParams({
    ...getCommonParams(),
    contentId: contentId.trim(),
  });

  const url = `${BASE_URL}/detailPetTour2?${params.toString()}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<PetTourInfo>(response);

    const items = normalizeItem(data.response.body.items?.item);
    if (items.length === 0) {
      // 반려동물 정보가 없는 경우 null 반환 (에러가 아님)
      return null;
    }

    return items[0];
  } catch (error) {
    if (error instanceof TourApiError) {
      // 404 에러는 정보가 없는 것으로 간주
      if (error instanceof TourApiNotFoundError) {
        return null;
      }
      throw error;
    }
    throw new TourApiError(
      `반려동물 정보 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

