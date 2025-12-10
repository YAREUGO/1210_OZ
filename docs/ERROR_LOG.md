# 에러 로그 및 해결 방법

이 문서는 프로젝트 개발 중 발생한 주요 에러들과 해결 방법을 기록합니다.

---

## 2024-12-10: Vercel 배포 빌드 실패

### 에러 1: Supabase accessToken SSR 오류

#### 증상

```
Failed to set initial Realtime auth token: TypeError: a is not a function
    at l.accessToken (.next/server/app/auth-test/page.js:1:595)
```

#### 원인

1. `lib/supabase/clerk-client.ts`에서 `@supabase/ssr`의 `createBrowserClient`를 사용했으나, 이 함수는 `accessToken` 옵션을 지원하지 않음
2. Clerk의 `useSession` 훅이 서버 사이드 렌더링(SSR) 중에 제대로 작동하지 않음
3. Next.js가 정적 페이지 생성(SSG) 시 클라이언트 컴포넌트도 서버에서 실행하려고 시도

#### 해결 방법

**1. `@supabase/supabase-js`의 `createClient` 사용**

```typescript
// ❌ 잘못된 방법
import { createBrowserClient } from "@supabase/ssr";

// ✅ 올바른 방법
import { createClient } from "@supabase/supabase-js";
```

**2. SSR 환경 체크 추가**

```typescript
// lib/supabase/clerk-client.ts
export function useClerkSupabaseClient() {
  const { session } = useSession();

  const supabase = useMemo(() => {
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
```

**3. Dynamic Import로 SSR 비활성화**

```typescript
// app/auth-test/page.tsx
"use client";

import dynamic from "next/dynamic";

const AuthTestContent = dynamic(() => import("./AuthTestContent"), {
  ssr: false,
  loading: () => <div>로딩 중...</div>,
});

export default function AuthTestPage() {
  return <AuthTestContent />;
}
```

---

### 에러 2: pnpm ERR_INVALID_THIS 오류

#### 증상

```
ERR_PNPM_META_FETCH_FAIL  GET https://registry.npmjs.org/@eslint%2Feslintrc: Value of "this" must be of type URLSearchParams
Error: Command "pnpm install" exited with 1
```

#### 원인

1. `package.json`에 `"packageManager": "pnpm@9.0.0"` 지정
2. pnpm 9.x 버전이 Vercel의 Node.js 버전과 호환성 문제 발생
3. 이전 빌드 캐시가 npm으로 설치된 패키지를 포함하고 있어 충돌

#### 해결 방법

**1. `package.json`에서 packageManager 필드 제거**

```json
{
  "name": "saas-mini-course",
  "version": "0.1.0",
  "private": true,
  // "packageManager": "pnpm@9.0.0",  ← 이 줄 삭제
  "scripts": { ... }
}
```

**2. `vercel.json`에서 npm 사용 명시**

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs"
}
```

**3. pnpm-lock.yaml 삭제 및 package-lock.json 추가**

```bash
# pnpm-lock.yaml 삭제
Remove-Item pnpm-lock.yaml

# node_modules 삭제
Remove-Item -Recurse -Force node_modules

# npm cache 정리
npm cache clean --force

# npm으로 재설치
npm install --legacy-peer-deps
```

**4. `.gitignore`에서 package-lock.json 무시 해제**

```gitignore
# ❌ 이 줄들 삭제
# pnpm
pnpm-lock.yaml

# npm (이 프로젝트는 pnpm 사용)
package-lock.json
```

**5. package-lock.json을 Git에 커밋**

```bash
git add package-lock.json
git commit -m "fix: npm으로 전환"
git push
```

---

### 에러 3: Vercel 빌드 캐시 문제

#### 증상

- 코드를 수정해도 이전 버전이 계속 빌드됨
- "Restored build cache from previous deployment" 메시지 표시

#### 해결 방법

**Vercel 대시보드에서 캐시 없이 재배포:**

1. Vercel Dashboard → 프로젝트 선택
2. Deployments 탭 클릭
3. 배포 옆 **⋯** 클릭 → **Redeploy** 선택
4. **"Redeploy with existing Build Cache"** 체크박스 **해제**
5. **Redeploy** 클릭

---

## 예방을 위한 체크리스트

### 새 프로젝트 설정 시

- [ ] `vercel.json`에서 패키지 매니저 명시적 지정
- [ ] 로컬과 Vercel에서 동일한 패키지 매니저 사용
- [ ] 환경 변수가 Vercel Dashboard에 설정되어 있는지 확인

### Clerk + Supabase 통합 시

- [ ] `@supabase/supabase-js`의 `createClient` 사용 (NOT `@supabase/ssr`)
- [ ] SSR 환경 체크 코드 포함 (`typeof window === "undefined"`)
- [ ] 인증이 필요한 페이지는 `dynamic import`로 SSR 비활성화

### 배포 전

- [ ] 로컬에서 `npm run build` 성공 확인
- [ ] Git에 lock 파일 포함되어 있는지 확인
- [ ] `.gitignore`에서 lock 파일이 무시되지 않는지 확인

---

## 관련 파일

- `lib/supabase/clerk-client.ts` - Clerk + Supabase 클라이언트
- `app/auth-test/page.tsx` - 인증 테스트 페이지 (dynamic import 사용)
- `app/auth-test/AuthTestContent.tsx` - 실제 인증 테스트 컴포넌트
- `app/storage-test/page.tsx` - Storage 테스트 페이지 (dynamic import 사용)
- `app/storage-test/StorageTestContent.tsx` - 실제 Storage 테스트 컴포넌트
- `vercel.json` - Vercel 배포 설정
- `package.json` - 의존성 및 스크립트

---

## 참고 링크

- [Clerk + Supabase 공식 문서](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/initializing)
- [Next.js Dynamic Import](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
