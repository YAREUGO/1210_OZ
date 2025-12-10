import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component용)
 *
 * Supabase 공식 문서의 Next.js 패턴을 따르면서 Clerk 통합을 유지합니다:
 * - @supabase/ssr의 createServerClient 사용 (2025년 권장 방식)
 * - Cookie 기반 세션 관리 (Next.js 최적화)
 * - Clerk 토큰을 accessToken으로 전달하여 third-party auth 사용
 * - JWT 템플릿 불필요
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = await createClerkSupabaseClient();
 *   const { data } = await supabase.from('table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 */
export async function createClerkSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Component는 read-only이므로 경고만 발생
        // 실제 쿠키 설정은 Route Handler나 Server Action에서 처리
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Server Component에서는 쿠키 설정이 제한될 수 있음
          // 이는 정상적인 동작이며, Route Handler나 Server Action에서 처리해야 함
        }
      },
    },
    // Clerk 토큰을 accessToken으로 전달
    async accessToken() {
      return (await auth()).getToken() ?? null;
    },
  });
}
