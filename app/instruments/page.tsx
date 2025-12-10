import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { Suspense } from "react";

/**
 * Instruments 데이터를 가져오는 Server Component
 * 
 * Supabase 공식 문서의 Next.js 퀵스타트 예제를 기반으로 작성되었습니다.
 * Clerk 통합을 통해 인증된 사용자만 데이터에 접근할 수 있습니다.
 */
async function InstrumentsData() {
  const supabase = await createClerkSupabaseClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select("*");

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800 mb-2">에러 발생</h3>
        <p className="text-sm text-red-700">{error.message}</p>
        <p className="text-xs text-red-600 mt-2">
          💡 <strong>해결 방법:</strong>
          <br />
          1. Supabase Dashboard에서 <code>instruments</code> 테이블이 생성되었는지 확인
          <br />
          2. RLS 정책이 올바르게 설정되었는지 확인
          <br />
          3. Clerk와 Supabase 통합이 활성화되었는지 확인
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          데이터가 없습니다. Supabase Dashboard에서 <code>instruments</code> 테이블에 데이터를 추가해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">악기 목록</h2>
      <ul className="space-y-2">
        {instruments.map((instrument: { id: number; name: string }) => (
          <li
            key={instrument.id}
            className="p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">{instrument.name}</span>
            <span className="text-sm text-gray-500 ml-2">(ID: {instrument.id})</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 이 페이지의 작동 원리</h3>
        <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
          <li>Server Component에서 Supabase 데이터를 직접 조회합니다</li>
          <li>Clerk 인증 토큰이 자동으로 Supabase에 전달됩니다</li>
          <li>RLS 정책에 따라 인증된 사용자만 데이터에 접근할 수 있습니다</li>
          <li>
            <code>@supabase/ssr</code>의 <code>createServerClient</code>를 사용하여 Next.js에 최적화된 방식으로 작동합니다
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Instruments 페이지
 * 
 * Supabase 공식 문서의 Next.js 퀵스타트 예제를 기반으로 작성되었습니다.
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */
export default function Instruments() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Supabase Instruments 예제</h1>
        <p className="text-gray-600">
          Supabase 공식 문서의 Next.js 퀵스타트 예제를 기반으로 작성되었습니다.
        </p>
      </div>

      <Suspense fallback={<div className="p-4">로딩 중...</div>}>
        <InstrumentsData />
      </Suspense>
    </div>
  );
}


