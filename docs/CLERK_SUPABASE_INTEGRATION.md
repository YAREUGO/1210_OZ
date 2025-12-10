# Clerk + Supabase 통합 가이드

이 문서는 Clerk와 Supabase를 최신 모범 사례에 따라 통합하는 방법을 설명합니다.

> **📅 업데이트**: 2025년 4월 이후 권장 방식 (네이티브 통합)
> - JWT Template 방식은 더 이상 사용하지 않습니다
> - Clerk Dashboard에서 직접 Supabase 통합을 활성화합니다
> - JWT secret key를 공유할 필요가 없습니다

## 목차

1. [개요](#개요)
2. [통합 설정](#통합-설정)
3. [코드 구현](#코드-구현)
4. [RLS 정책 설정](#rls-정책-설정)
5. [테스트](#테스트)
6. [문제 해결](#문제-해결)

## 개요

### 통합의 이점

- ✅ **보안 강화**: JWT secret key를 공유할 필요 없음
- ✅ **성능 향상**: 매 요청마다 새 토큰 생성 불필요
- ✅ **간편한 설정**: Clerk Dashboard에서 원클릭 활성화
- ✅ **자동 역할 추가**: Clerk 세션 토큰에 `"role": "authenticated"` 자동 추가

### 작동 원리

1. Clerk가 사용자 인증 처리
2. Clerk Dashboard에서 Supabase 통합 활성화 시, 세션 토큰에 `"role": "authenticated"` 클레임 자동 추가
3. Supabase에서 Clerk를 third-party auth provider로 등록
4. Supabase 클라이언트가 Clerk 세션 토큰을 사용하여 요청
5. Supabase가 Clerk의 JWT를 자동 검증 (JWKS 엔드포인트 사용)

## 통합 설정

### 1단계: Clerk Dashboard에서 Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. **"Integrations"** 또는 **"Setup"** 메뉴에서 **"Supabase"** 선택
   - 또는 직접 [Supabase 통합 설정 페이지](https://dashboard.clerk.com/setup/supabase)로 이동
3. **"Activate Supabase integration"** 클릭
4. 통합이 활성화되면 **"Clerk domain"**이 표시됩니다
   - 예: `https://your-app-12.clerk.accounts.dev`
5. 이 **Clerk domain**을 복사하여 메모해두세요

> **💡 팁**: 이 단계를 통해 Clerk의 모든 세션 토큰에 `"role": "authenticated"` 클레임이 자동으로 추가됩니다.

### 2단계: Supabase에서 Clerk를 Third-Party Auth Provider로 추가

1. [Supabase Dashboard](https://supabase.com/dashboard)로 이동
2. 프로젝트 선택 → **Settings** → **Authentication** → **Providers**
3. 페이지 하단으로 스크롤하여 **"Third-Party Auth"** 섹션 찾기
4. **"Add Provider"** 클릭
5. **"Clerk"** 선택
6. **"Clerk domain"** 입력:
   - 1단계에서 복사한 Clerk domain을 붙여넣기
   - 예: `https://your-app-12.clerk.accounts.dev`
7. **"Save"** 클릭

> **✅ 확인**: Supabase는 이제 Clerk의 JWT를 자동으로 검증할 수 있습니다. JWT secret key를 공유할 필요가 없습니다.

## 코드 구현

### 프로젝트 구조

이 프로젝트는 환경별로 Supabase 클라이언트를 분리하여 사용합니다:

```
lib/supabase/
├── clerk-client.ts    # Client Component용 (useClerkSupabaseClient hook)
├── server.ts          # Server Component/Server Action용 (createClerkSupabaseClient)
├── service-role.ts    # 관리자 권한 작업용 (RLS 우회)
└── client.ts          # 인증 불필요한 공개 데이터용
```

### Client Component에서 사용

Client Component에서는 `useClerkSupabaseClient` 훅을 사용합니다:

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useEffect, useState } from 'react';

export default function TasksPage() {
  const supabase = useClerkSupabaseClient();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function loadTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      
      if (!error) {
        setTasks(data);
      }
    }

    loadTasks();
  }, [supabase]);

  return (
    <div>
      <h1>My Tasks</h1>
      {tasks.map((task) => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### Server Component에서 사용

Server Component에서는 `createClerkSupabaseClient` 함수를 사용합니다. 이 함수는 `async`이므로 `await`를 사용해야 합니다:

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function TasksPage() {
  const supabase = await createClerkSupabaseClient();
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    throw error;
  }

  return (
    <div>
      <h1>My Tasks</h1>
      {tasks?.map((task) => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### Server Action에서 사용

Server Action에서도 동일한 함수를 사용합니다:

```tsx
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function createTask(name: string) {
  const supabase = await createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });

  if (error) {
    throw new Error('Failed to create task');
  }

  return data;
}
```

## RLS 정책 설정

### 개발 환경

개발 환경에서는 RLS를 비활성화할 수 있습니다:

```sql
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

### 프로덕션 환경

프로덕션 환경에서는 반드시 RLS를 활성화하고 정책을 설정해야 합니다:

```sql
-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 tasks만 조회 가능
CREATE POLICY "Users can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- 사용자가 자신의 tasks만 생성 가능
CREATE POLICY "Users can insert their own tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- 사용자가 자신의 tasks만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- 사용자가 자신의 tasks만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);
```

### 테이블 생성 예제

```sql
-- tasks 테이블 생성
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT (SELECT auth.jwt()->>'sub'),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS 활성화 (프로덕션)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (위의 정책들 참고)
```

## 테스트

### 통합 테스트

1. **로그인 테스트**
   - Clerk를 통해 로그인
   - Supabase 클라이언트로 데이터 조회 시도
   - 성공하면 통합이 정상 작동하는 것입니다

2. **RLS 테스트**
   - 사용자 A로 로그인하여 task 생성
   - 사용자 B로 로그인하여 task 조회
   - 사용자 B는 사용자 A의 task를 볼 수 없어야 합니다

### 디버깅

Clerk 세션 토큰 확인:

```tsx
'use client';

import { useAuth } from '@clerk/nextjs';

export default function DebugPage() {
  const { getToken } = useAuth();

  async function checkToken() {
    const token = await getToken();
    console.log('Clerk Token:', token);
    
    // 토큰 디코딩 (base64)
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token Payload:', payload);
      console.log('Role:', payload.role); // "authenticated" 여부 확인
      console.log('Sub (User ID):', payload.sub);
    }
  }

  return (
    <div>
      <button onClick={checkToken}>Check Token</button>
    </div>
  );
}
```

## 문제 해결

### 문제 1: "Invalid JWT" 오류

**원인**: Supabase에서 Clerk domain이 올바르게 설정되지 않음

**해결**:
1. Supabase Dashboard → Settings → Authentication → Providers 확인
2. Clerk provider의 domain이 올바른지 확인
3. Clerk Dashboard에서 domain이 변경되지 않았는지 확인

### 문제 2: RLS 정책이 작동하지 않음

**원인**: RLS가 비활성화되어 있거나 정책이 올바르지 않음

**해결**:
1. RLS 활성화 확인: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
2. 정책 확인: `SELECT * FROM pg_policies WHERE tablename = 'tasks';`
3. `auth.jwt()->>'sub'`가 올바르게 사용되는지 확인

### 문제 3: "role" 클레임이 없음

**원인**: Clerk Dashboard에서 Supabase 통합이 활성화되지 않음

**해결**:
1. Clerk Dashboard → Integrations → Supabase 확인
2. "Activate Supabase integration" 클릭
3. 통합이 활성화되었는지 확인

## 추가 리소스

- [Clerk 공식 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk Next.js 문서](https://clerk.com/docs/quickstarts/nextjs)

## 변경 이력

- **2025-01**: 네이티브 통합 방식으로 업데이트 (JWT Template 방식 제거)

