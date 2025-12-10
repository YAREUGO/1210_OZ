import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 한국관광공사 이미지 도메인
      { hostname: "www.visitkorea.or.kr" },
      { hostname: "api.visitkorea.or.kr" },
      { hostname: "tong.visitkorea.or.kr" },
    ],
    // 이미지 최적화 설정
    formats: ["image/avif", "image/webp"], // AVIF, WebP 포맷 우선 사용
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // 디바이스 크기
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 이미지 크기
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일 캐시
    dangerouslyAllowSVG: true, // SVG 허용 (기본 이미지용)
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // 번들 최적화
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"], // 패키지 임포트 최적화
  },
  // 압축 설정
  compress: true,
  // 프로덕션 빌드 최적화
  swcMinify: true,
  // 번들 분석 (개발 시에만)
  ...(process.env.ANALYZE === "true" && {
    webpack: (config: any) => {
      if (config.mode === "production") {
        const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            reportFilename: "../bundle-analyzer-report.html",
          })
        );
      }
      return config;
    },
  }),
};

export default nextConfig;
