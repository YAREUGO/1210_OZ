import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
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
  title: "SaaS 템플릿",
  description: "Next.js + Clerk + Supabase 보일러플레이트",
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
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
