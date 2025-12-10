/**
 * @file coordinate.ts
 * @description 좌표 변환 유틸리티 함수
 *
 * 한국관광공사 API의 KATEC 좌표계를 WGS84 좌표계로 변환하는 함수
 *
 * KATEC 좌표계:
 * - mapx, mapy는 정수형으로 저장됨
 * - 실제 좌표 = mapx / 10000000, mapy / 10000000
 *
 * WGS84 좌표계:
 * - 네이버 지도에서 사용하는 표준 좌표계
 * - 경도(longitude), 위도(latitude)
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - 한국관광공사 API 문서
 */

/**
 * KATEC 좌표를 WGS84 좌표로 변환
 * @param mapx KATEC 경도 (정수형)
 * @param mapy KATEC 위도 (정수형)
 * @returns WGS84 좌표 { lng: 경도, lat: 위도 }
 */
export function katecToWgs84(
  mapx: string | number,
  mapy: string | number
): { lng: number; lat: number } {
  const x = typeof mapx === "string" ? parseFloat(mapx) : mapx;
  const y = typeof mapy === "string" ? parseFloat(mapy) : mapy;

  return {
    lng: x / 10000000,
    lat: y / 10000000,
  };
}

/**
 * 여러 좌표의 중심점 계산
 * @param coordinates 좌표 배열
 * @returns 중심 좌표 { lng: 경도, lat: 위도 }
 */
export function getCenterPoint(
  coordinates: Array<{ lng: number; lat: number }>
): { lng: number; lat: number } {
  if (coordinates.length === 0) {
    // 기본값: 서울 중심
    return { lng: 126.978, lat: 37.5665 };
  }

  if (coordinates.length === 1) {
    return coordinates[0];
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      lng: acc.lng + coord.lng,
      lat: acc.lat + coord.lat,
    }),
    { lng: 0, lat: 0 }
  );

  return {
    lng: sum.lng / coordinates.length,
    lat: sum.lat / coordinates.length,
  };
}

/**
 * 좌표 범위 계산 (지도 줌 레벨 조정용)
 * @param coordinates 좌표 배열
 * @returns 좌표 범위 { minLng, maxLng, minLat, maxLat }
 */
export function getBounds(
  coordinates: Array<{ lng: number; lat: number }>
): {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
} {
  if (coordinates.length === 0) {
    return {
      minLng: 126.978 - 0.1,
      maxLng: 126.978 + 0.1,
      minLat: 37.5665 - 0.1,
      maxLat: 37.5665 + 0.1,
    };
  }

  const lngs = coordinates.map((c) => c.lng);
  const lats = coordinates.map((c) => c.lat);

  return {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
  };
}

