import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "My Trip - 한국 관광지 정보 서비스",
    template: "%s | My Trip",
  },
  description: "전국 관광지 정보를 한 곳에서 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
  keywords: ["관광지", "여행", "한국", "관광 정보", "지도", "검색"],
  authors: [{ name: "My Trip" }],
  creator: "My Trip",
  publisher: "My Trip",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "My Trip - 한국 관광지 정보 서비스",
    description: "전국 관광지 정보를 한 곳에서 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
    siteName: "My Trip",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Trip - 한국 관광지 정보 서비스",
    description: "전국 관광지 정보를 한 곳에서 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * 한국어 로컬라이제이션 설정
 * 
 * Clerk 컴포넌트의 모든 텍스트를 한국어로 표시합니다.
 * 에러 메시지도 한국어로 커스터마이징할 수 있습니다.
 * 
 * 참고: https://clerk.com/docs/guides/customizing-clerk/localization
 */
const koreanLocalization = {
  ...koKR,
  // 한국어 에러 메시지 커스터마이징 (선택사항)
  unstable__errors: {
    ...koKR.unstable__errors,
    // 허용되지 않은 이메일 도메인 접근 시 메시지
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 기업 이메일 도메인을 허용 목록에 추가하려면 이메일로 문의해주세요.",
    // 기타 에러 메시지도 여기서 커스터마이징 가능
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={koreanLocalization}
      appearance={{
        // Tailwind CSS 4 호환성을 위한 설정 (선택사항)
        cssLayerName: "clerk",
      }}
    >
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            {children}
            <ToasterProvider />
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
