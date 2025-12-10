/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * Naver Maps API v3 (NCP)를 사용한 지도 컴포넌트
 *
 * 주요 기능:
 * 1. 지도 초기화 및 표시
 * 2. 관광지 마커 표시
 * 3. 마커 클릭 시 인포윈도우
 * 4. 지도-리스트 연동
 * 5. 지도 컨트롤 (줌, 지도 유형)
 *
 * @dependencies
 * - Naver Maps JavaScript API v3 (NCP)
 * - @/lib/utils/coordinate: 좌표 변환 함수
 * - @/lib/types/tour: TourItem 타입
 *
 * @see {@link https://navermaps.github.io/maps.js.ncp/docs/} - Naver Maps API 문서
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TourItem } from "@/lib/types/tour";
import { katecToWgs84, getCenterPoint, getBounds } from "@/lib/utils/coordinate";
import { getContentTypeName } from "@/lib/types/tour";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Map, Satellite } from "lucide-react";

// Naver Maps API 타입 선언
// Naver Maps API는 공식 타입 정의가 없으므로 any 사용
declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapProps {
  /**
   * 표시할 관광지 목록
   */
  tours: TourItem[];
  /**
   * 선택된 관광지 ID (리스트에서 클릭한 항목)
   */
  selectedTourId?: string;
  /**
   * 관광지 선택 핸들러
   */
  onTourSelect?: (tourId: string) => void;
  /**
   * 지도 높이
   * @default "600px"
   */
  height?: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

export function NaverMap({
  tours,
  selectedTourId,
  onTourSelect,
  height = "600px",
  className,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const router = useRouter();
  const [mapType, setMapType] = useState<"normal" | "satellite">("normal");
  const [isLoaded, setIsLoaded] = useState(false);

  // Naver Maps API 스크립트 로드
  useEffect(() => {
    const scriptId = "naver-maps-script";
    
    // 이미 로드되어 있으면 스킵
    if (document.getElementById(scriptId)) {
      if (window.naver) {
        setIsLoaded(true);
      }
      return;
    }

    const ncpKeyId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!ncpKeyId) {
      console.warn("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다.");
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${ncpKeyId}`;
    script.async = true;
    script.onload = () => {
      if (window.naver && window.naver.maps) {
        setIsLoaded(true);
      } else {
        console.error("네이버 지도 API가 제대로 로드되지 않았습니다");
      }
    };
    script.onerror = (error) => {
      console.error("네이버 지도 API 스크립트 로드 실패:", error);
      console.warn(
        "💡 네이버 클라우드 플랫폼에서 웹 서비스 URL이 등록되었는지 확인하세요:",
        window.location.origin
      );
      console.warn(
        "💡 네이버 클라우드 플랫폼 → Maps API → 웹 서비스 URL에 다음을 추가하세요:",
        window.location.origin
      );
    };
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거하지 않음 (다른 컴포넌트에서 사용 가능)
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !window.naver || !window.naver.maps || !mapRef.current) {
      if (isLoaded && (!window.naver || !window.naver.maps)) {
        console.error("네이버 지도 API가 제대로 초기화되지 않았습니다");
      }
      return;
    }

    // 좌표 변환
    const coordinates = tours
      .filter((tour) => tour.mapx && tour.mapy)
      .map((tour) => katecToWgs84(tour.mapx, tour.mapy));

    // 중심점 계산
    const center = getCenterPoint(coordinates);

    // 지도 생성
    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom: coordinates.length > 0 ? 12 : 10,
      mapTypeControl: false, // 커스텀 컨트롤 사용
    });

    mapInstanceRef.current = map;

    // 좌표 범위에 맞춰 지도 조정
    if (coordinates.length > 0) {
      const bounds = getBounds(coordinates);
      const sw = new window.naver.maps.LatLng(bounds.minLat, bounds.minLng);
      const ne = new window.naver.maps.LatLng(bounds.maxLat, bounds.maxLng);
      const boundsObj = new window.naver.maps.LatLngBounds(sw, ne);
      map.fitBounds(boundsObj);
    }

    // 기존 마커 및 인포윈도우 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    // 마커 생성
    tours.forEach((tour) => {
      if (!tour.mapx || !tour.mapy) return;

      const coord = katecToWgs84(tour.mapx, tour.mapy);
      const position = new window.naver.maps.LatLng(coord.lat, coord.lng);

      // 마커 생성
      const marker = new window.naver.maps.Marker({
        position,
        map,
        title: tour.title,
        icon: {
          content: `
            <div style="
              background-color: #3b82f6;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              <div style="
                transform: rotate(45deg);
                color: white;
                font-size: 12px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
              ">📍</div>
            </div>
          `,
          anchor: new window.naver.maps.Point(15, 15),
        },
      });

      // 인포윈도우 생성
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="
            padding: 12px;
            min-width: 200px;
            max-width: 300px;
          ">
            <h3 style="
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
            ">${tour.title}</h3>
            <p style="
              margin: 0 0 8px 0;
              font-size: 12px;
              color: #6b7280;
            ">${tour.addr1}</p>
            <div style="
              display: flex;
              gap: 8px;
              margin-top: 8px;
            ">
              <button
                id="detail-btn-${tour.contentid}"
                style="
                  background-color: #3b82f6;
                  color: white;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                "
                onmouseover="this.style.backgroundColor='#2563eb'"
                onmouseout="this.style.backgroundColor='#3b82f6'"
              >
                상세보기
              </button>
            </div>
          </div>
        `,
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, "click", () => {
        // 다른 인포윈도우 닫기
        infoWindowsRef.current.forEach((iw) => iw.close());
        
        // 현재 인포윈도우 열기
        infoWindow.open(map, marker);
        
        // 리스트 연동
        if (onTourSelect) {
          onTourSelect(tour.contentid);
        }
      });

      // 상세보기 버튼 클릭 이벤트
      setTimeout(() => {
        const detailBtn = document.getElementById(`detail-btn-${tour.contentid}`);
        if (detailBtn) {
          detailBtn.addEventListener("click", () => {
            router.push(`/places/${tour.contentid}`);
          });
        }
      }, 100);

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
    });

    // 선택된 관광지로 지도 이동
    if (selectedTourId) {
      const selectedTour = tours.find((t) => t.contentid === selectedTourId);
      if (selectedTour && selectedTour.mapx && selectedTour.mapy) {
        const coord = katecToWgs84(selectedTour.mapx, selectedTour.mapy);
        const position = new window.naver.maps.LatLng(coord.lat, coord.lng);
        
        map.setCenter(position);
        map.setZoom(15);

        // 해당 마커의 인포윈도우 열기
        const markerIndex = tours.findIndex((t) => t.contentid === selectedTourId);
        if (markerIndex >= 0 && infoWindowsRef.current[markerIndex]) {
          infoWindowsRef.current.forEach((iw) => iw.close());
          infoWindowsRef.current[markerIndex].open(map, markersRef.current[markerIndex]);
        }
      }
    }
  }, [isLoaded, tours, selectedTourId, onTourSelect, router]);

  // 지도 유형 변경
  const handleMapTypeChange = () => {
    if (!mapInstanceRef.current) return;
    
    const newType = mapType === "normal" ? "satellite" : "normal";
    setMapType(newType);
    
    mapInstanceRef.current.setMapTypeId(
      newType === "satellite"
        ? window.naver.maps.MapTypeId.SATELLITE
        : window.naver.maps.MapTypeId.NORMAL
    );
  };

  // 줌 인
  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom + 1);
  };

  // 줌 아웃
  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom - 1);
  };

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-muted"
        style={{ height }}
      >
        <p className="text-muted-foreground">지도를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* 지도 컨테이너 */}
      <div ref={mapRef} className="w-full h-full" />

      {/* 지도 컨트롤 */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {/* 줌 컨트롤 */}
        <div className="flex flex-col bg-white rounded-md shadow-lg border">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="rounded-b-none"
            aria-label="줌 인"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="rounded-t-none"
            aria-label="줌 아웃"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* 지도 유형 선택 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMapTypeChange}
          className="bg-white shadow-lg border"
          aria-label={mapType === "normal" ? "위성 지도로 전환" : "일반 지도로 전환"}
        >
          {mapType === "normal" ? (
            <Satellite className="h-4 w-4" />
          ) : (
            <Map className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

