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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

  // 상위 N개 지역만 표시
  const chartData = data.slice(0, limit).map((region) => ({
    name: region.areaName,
    count: region.count,
    areaCode: region.areaCode,
  }));

  // 차트 설정
  const chartConfig = {
    count: {
      label: "관광지 개수",
      color: "hsl(var(--chart-1))",
    },
  };

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
            fill="var(--color-count)"
            radius={[4, 4, 0, 0]}
            onClick={(data) => handleBarClick(data)}
            style={{ cursor: "pointer" }}
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

