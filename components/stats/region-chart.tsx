/**
 * @file region-chart.tsx
 * @description 지역별 분포 차트 컴포넌트
 *
 * 지역별 관광지 개수를 Bar Chart로 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 Bar Chart
 * 2. 상위 10개 지역 표시 (또는 전체)
 * 3. 바 클릭 시 해당 지역 목록 페이지로 이동
 * 4. 호버 시 정확한 개수 표시
 * 5. 다크/라이트 모드 지원
 * 6. 반응형 디자인
 *
 * @dependencies
 * - components/ui/chart: ChartContainer, ChartTooltip, ChartTooltipContent
 * - lib/types/stats: RegionStats 타입
 * - recharts: Bar, BarChart, XAxis, YAxis, CartesianGrid
 */

"use client";

import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Rectangle } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RegionStats } from "@/lib/types/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RegionChartProps {
  /**
   * 지역별 통계 데이터
   */
  data?: RegionStats[];
  /**
   * 로딩 상태
   */
  isLoading?: boolean;
  /**
   * 표시할 지역 개수 (기본값: 10)
   */
  limit?: number;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 숫자를 천 단위로 포맷팅
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

/**
 * 차트 색상 팔레트 (다양한 색상)
 * CSS 변수 대신 실제 색상 값을 사용 (recharts 호환성)
 */
const CHART_COLORS = [
  "#f59e0b", // chart-1 (주황색)
  "#3b82f6", // chart-2 (파란색)
  "#8b5cf6", // chart-3 (보라색)
  "#10b981", // chart-4 (초록색)
  "#ef4444", // chart-5 (빨간색)
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
];

/**
 * 지역별 분포 차트 컴포넌트
 */
export function RegionChart({
  data,
  isLoading,
  limit = 10,
  className,
}: RegionChartProps) {
  const router = useRouter();

  if (isLoading || !data || data.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton variant="text" width="w-32" height="h-6" />
        <Skeleton variant="rectangle" height="h-64" className="w-full rounded-lg" />
      </div>
    );
  }

  // 상위 N개 지역만 표시 (각 바마다 다른 색상 적용)
  const chartData = data.slice(0, limit).map((region, index) => ({
    name: region.areaName,
    count: region.count,
    areaCode: region.areaCode,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  // 차트 설정 (각 지역마다 색상 매핑)
  const chartConfig = chartData.reduce(
    (acc, item, index) => {
      acc[item.areaCode] = {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );

  // 바 클릭 핸들러 (해당 지역 목록 페이지로 이동)
  const handleBarClick = (data: { areaCode: string } | undefined) => {
    if (data?.areaCode) {
      router.push(`/?areaCode=${data.areaCode}`);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">지역별 분포</h3>
        {data.length > limit && (
          <p className="text-sm text-muted-foreground">
            상위 {limit}개 지역 표시 (전체 {data.length}개)
          </p>
        )}
      </div>

      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            className="text-xs"
            tickFormatter={(value) => formatNumber(value)}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [
                  `${formatNumber(Number(value))}개`,
                  "관광지 개수",
                ]}
              />
            }
          />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            onClick={(data) => handleBarClick(data)}
            style={{ cursor: "pointer" }}
            shape={(props: any) => {
              const { payload, fill, ...rest } = props;
              // payload에서 fill 속성을 가져오거나, 기본 색상 사용
              const fillColor = payload.fill || fill || CHART_COLORS[0];
              return (
                <Rectangle
                  {...rest}
                  fill={fillColor}
                  radius={[4, 4, 0, 0]}
                />
              );
            }}
          />
        </BarChart>
      </ChartContainer>

      {data.length > limit && (
        <p className="text-xs text-muted-foreground text-center">
          차트의 바를 클릭하면 해당 지역의 관광지 목록을 볼 수 있습니다.
        </p>
      )}
    </div>
  );
}

