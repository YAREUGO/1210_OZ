/**
 * @file detail-map.tsx
 * @description 관광지 지도 섹션 컴포넌트
 *
 * 관광지 상세페이지의 지도 섹션을 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 해당 관광지 위치 표시 (네이버 지도)
 * 2. 마커 1개 표시
 * 3. "길찾기" 버튼 (네이버 지도 앱/웹 연동)
 * 4. 좌표 정보 표시 (선택 사항)
 *
 * @dependencies
 * - Naver Maps JavaScript API v3 (NCP)
 * - @/lib/utils/coordinate: 좌표 변환 함수
 * - @/lib/types/tour: TourDetail 타입
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import type { TourDetail } from "@/lib/types/tour";
import { katecToWgs84 } from "@/lib/utils/coordinate";
import { Button } from "@/components/ui/button";

interface DetailMapProps {
  /**
   * 관광지 상세 정보
   */
  detail: TourDetail;
  /**
   * 지도 높이
   */
  height?: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

export function DetailMap({ detail, height = "400px", className }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // 환경변수 확인
    const ncpKeyId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!ncpKeyId) {
      console.error("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다");
      setMapError("지도 API 키가 설정되지 않았습니다");
      return;
    }

    console.log("네이버 지도 API 키 확인:", ncpKeyId.substring(0, 5) + "...");

    // Naver Maps API 스크립트 로드 확인
    if (typeof window === "undefined" || !window.naver) {
      console.log("네이버 지도 API 스크립트 로드 시작");
      // 스크립트 동적 로드
      const script = document.createElement("script");
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${ncpKeyId}`;
      script.async = true;
      script.onload = () => {
        console.log("네이버 지도 API 스크립트 로드 완료");
        initializeMap();
      };
      script.onerror = (error) => {
        console.error("네이버 지도 API 스크립트 로드 실패:", error);
        setMapError(
          "지도 API를 불러오는데 실패했습니다. 네이버 클라우드 플랫폼에서 웹 서비스 URL이 등록되었는지 확인하세요."
        );
      };
      document.head.appendChild(script);
    } else {
      console.log("네이버 지도 API가 이미 로드되어 있음");
      initializeMap();
    }

    function initializeMap() {
      if (!mapRef.current || !window.naver) {
        console.warn("지도 초기화 실패: mapRef 또는 naver 객체가 없습니다");
        return;
      }

      try {
        // 좌표 값 검증
        if (!detail.mapx || !detail.mapy) {
          setMapError("좌표 정보가 없습니다");
          return;
        }

        // 좌표 변환 (KATEC → WGS84)
        const mapx = detail.mapx;
        const mapy = detail.mapy;
        
        // 좌표가 유효한지 확인
        if (!mapx || !mapy || isNaN(parseFloat(mapx)) || isNaN(parseFloat(mapy))) {
          setMapError("유효하지 않은 좌표입니다");
          return;
        }

        const coordinates = katecToWgs84(mapx, mapy);
        const { lng, lat } = coordinates;

        // 디버깅: 좌표 값 확인
        console.log("지도 좌표 변환:", {
          원본: { mapx, mapy },
          변환후: { lng, lat },
          관광지: detail.title,
          주소: detail.addr1,
        });

        // 좌표 유효성 검증 (한국 좌표 범위: 경도 124-132, 위도 33-43)
        if (lng < 124 || lng > 132 || lat < 33 || lat > 43) {
          console.error("좌표가 한국 범위를 벗어남:", { lng, lat, 원본: { mapx, mapy } });
          setMapError(`좌표가 유효하지 않습니다 (경도: ${lng.toFixed(6)}, 위도: ${lat.toFixed(6)})`);
          return;
        }

        // 좌표가 0에 가까운지 확인 (변환 실패 가능성)
        if (Math.abs(lng) < 0.001 || Math.abs(lat) < 0.001) {
          console.error("좌표가 0에 가까움 (변환 실패 가능성):", { lng, lat, 원본: { mapx, mapy } });
          setMapError("좌표 변환에 실패했습니다");
          return;
        }

        // 지도 초기화
        const map = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(lat, lng),
          zoom: 16,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        });

        console.log("지도 초기화 성공:", { center: { lat, lng }, zoom: 16 });

        // 마커 생성
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(lat, lng),
          map: map,
          title: detail.title,
        });

        // 인포윈도우 생성
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 200px;">
              <div style="font-weight: bold; margin-bottom: 5px;">${detail.title}</div>
              <div style="font-size: 12px; color: #666;">${detail.addr1}${detail.addr2 ? ` ${detail.addr2}` : ""}</div>
            </div>
          `,
        });

        // 마커 클릭 시 인포윈도우 표시
        window.naver.maps.Event.addListener(marker, "click", () => {
          if (infoWindow.getMap()) {
            infoWindow.close();
          } else {
            infoWindow.open(map, marker);
          }
        });

        // 초기 인포윈도우 표시
        infoWindow.open(map, marker);

        console.log("마커 및 인포윈도우 생성 완료");
        setMapLoaded(true);
      } catch (error) {
        console.error("지도 초기화 실패:", error);
        console.error("에러 상세:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          detail: detail,
        });
        setMapError(`지도를 불러오는데 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }, [detail]);

  /**
   * 길찾기 버튼 클릭 핸들러
   */
  const handleDirections = () => {
    // katecToWgs84 함수가 내부에서 10000000으로 나누므로 원본 값을 전달
    const { lng, lat } = katecToWgs84(detail.mapx, detail.mapy);

    // 네이버 지도 길찾기 URL
    const directionsUrl = `https://map.naver.com/v5/directions/${lng},${lat}`;
    window.open(directionsUrl, "_blank", "noopener,noreferrer");
  };

  const fullAddress = `${detail.addr1}${detail.addr2 ? ` ${detail.addr2}` : ""}`;

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          위치
        </h2>
        <Button onClick={handleDirections} variant="outline" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          길찾기
        </Button>
      </div>

      {/* 지도 컨테이너 */}
      <div className="relative w-full rounded-lg overflow-hidden border bg-muted" style={{ height }}>
        {mapError ? (
          <div className="flex items-center justify-center h-full text-destructive">
            <p>{mapError}</p>
          </div>
        ) : (
          <>
            <div ref={mapRef} className="w-full h-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">지도를 불러오는 중...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 주소 정보 */}
      {fullAddress && (
        <div className="mt-4 p-4 bg-card border rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">주소</p>
          <p className="text-base">{fullAddress}</p>
        </div>
      )}
    </div>
  );
}

