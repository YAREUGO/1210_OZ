"use client";

import dynamic from "next/dynamic";

// SSR을 완전히 비활성화하여 서버에서 Supabase 클라이언트 초기화 방지
const StorageTestContent = dynamic(() => import("./StorageTestContent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <p>로딩 중...</p>
    </div>
  ),
});

export default function StorageTestPage() {
  return <StorageTestContent />;
}
