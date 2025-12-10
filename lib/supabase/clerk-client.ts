"use client";

import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * Clerk 공식 문서의 권장 패턴을 따릅니다:
 * - @supabase/supabase-js의 createClient 사용 (accessToken 옵션 지원)
 * - Clerk의 session.getToken()을 accessToken으로 전달
 * - React Hook으로 제공되어 Client Component에서 사용
 *
 * @see https://clerk.com/docs/integrations/databases/supabase
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *
 *   async function fetchData() {
 *     const { data } = await supabase.from('table').select('*');
 *     return data;
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  const { session } = useSession();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient(supabaseUrl, supabaseKey, {
      async accessToken() {
        // SSR 환경에서는 토큰을 반환하지 않음
        if (typeof window === "undefined") {
          return null;
        }

        // session이 없거나 getToken이 함수가 아닌 경우 null 반환
        if (!session || typeof session.getToken !== "function") {
          return null;
        }

        try {
          return await session.getToken();
        } catch {
          return null;
        }
      },
    });
  }, [session]);

  return supabase;
}
