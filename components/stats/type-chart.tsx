/**
 * @file type-chart.tsx
 * @description 타입별 분포 차트 컴포넌트
 *
 * 타입별 관광지 개수를 Donut Chart로 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 타입별 관광지 개수 Donut Chart
 * 2. 타입별 비율 (백분율) 표시
 * 3. 섹션 클릭 시 해당 타입 목록 페이지로 이동
 * 4. 호버 시 타입명, 개수, 비율 표시
 * 5. 다크/라이트 모드 지원
 * 6. 반응형 디자인
 *
 * @dependencies
 * - components/ui/chart: ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent
 * - lib/types/stats: TypeStats 타입
 * - recharts: Pie, PieChart, Cell
 */

"use client";

import { useRouter } from "next/navigation";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { TypeStats } from "@/lib/types/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TypeChartProps {
  /**
   * 타입별 통계 데이터
   */
  data?: TypeStats[];
  /**
   * 로딩 상태
   */
  isLoading?: boolean;
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
];

/**
 * 타입별 분포 차트 컴포넌트
 */
export function TypeChart({ data, isLoading, className }: TypeChartProps) {
  const router = useRouter();

  if (isLoading || !data || data.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton variant="text" width="w-32" height="h-6" />
        <Skeleton variant="rectangle" height="h-64" className="w-full rounded-lg" />
      </div>
    );
  }

  // 차트 데이터 준비
  const chartData = data.map((type, index) => ({
    name: type.contentTypeName,
    value: type.count,
    percentage: type.percentage,
    contentTypeId: type.contentTypeId,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  // 차트 설정
  const chartConfig = chartData.reduce(
    (acc, item, index) => {
      acc[item.contentTypeId] = {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );

  // 섹션 클릭 핸들러 (해당 타입 목록 페이지로 이동)
  const handlePieClick = (data: { contentTypeId: string } | undefined) => {
    if (data?.contentTypeId) {
      router.push(`/?contentTypeId=${data.contentTypeId}`);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">타입별 분포</h3>
        <p className="text-sm text-muted-foreground">
          전체 {data.length}개 타입
        </p>
      </div>

      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name, props) => {
                  const percentage = props.payload?.percentage || 0;
                  return [
                    `${formatNumber(Number(value))}개 (${percentage}%)`,
                    name,
                  ];
                }}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            paddingAngle={2}
            onClick={(data) => handlePieClick(data)}
            style={{ cursor: "pointer" }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="contentTypeId" />}
            verticalAlign="bottom"
          />
        </PieChart>
      </ChartContainer>

      <p className="text-xs text-muted-foreground text-center">
        차트의 섹션을 클릭하면 해당 타입의 관광지 목록을 볼 수 있습니다.
      </p>
    </div>
  );
}

