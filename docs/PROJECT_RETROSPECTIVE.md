# 프로젝트 회고 및 에러 해결 가이드

> **작성일**: 2025-12-10  
> **프로젝트**: My Trip - 한국 관광지 정보 서비스  
> **목적**: 발생한 모든 에러, 실패 사례, 해결 과정, 그리고 향후 개선 방안을 종합적으로 정리

---

## 📋 목차

1. [발생한 모든 에러 목록](#발생한-모든-에러-목록)
2. [실패한 해결 시도와 원인 분석](#실패한-해결-시도와-원인-분석)
3. [최종 해결 방법](#최종-해결-방법)
4. [교훈 및 개선 방안](#교훈-및-개선-방안)
5. [향후 에러 예방 체크리스트](#향후-에러-예방-체크리스트)

---

## 발생한 모든 에러 목록

### 1. 401 Unauthorized 에러 (API 키 인증 실패)

**발생 시점**: Vercel 배포 후 통계 페이지 접속 시

**증상**:
```
Error [TourApiError]: API 요청 실패: 401 Unauthorized
지역별 통계 조회 실패: Error [TourApiError]: API 요청 실패: 401 Unauthorized
```

**영향 범위**:
- 통계 페이지 (`/stats`) 전체 기능 마비
- 지역별 통계 조회 실패
- 타입별 통계 조회 실패
- 통계 요약 정보 조회 실패

**심각도**: 🔴 **Critical** - 핵심 기능 완전 마비

---

### 2. Server Component에서 `ssr: false` 사용 오류

**발생 시점**: 빌드 시

**증상**:
```
Error: `ssr: false` is not allowed with `next/dynamic` in Server Components. 
Please move it into a Client Component.
```

**영향 범위**:
- `app/places/[contentId]/page.tsx` 빌드 실패
- `DetailPetTour` 컴포넌트 동적 임포트 실패

**심각도**: 🔴 **Critical** - 빌드 실패로 배포 불가

---

### 3. `useSearchParams()` Suspense 경계 누락

**발생 시점**: 개발 중 Next.js 경고

**증상**:
```
useSearchParams() should be wrapped in a suspense boundary at page "/"
useSearchParams() should be wrapped in a suspense boundary at page "/instruments"
```

**영향 범위**:
- `app/page.tsx` - 홈페이지
- `components/Navbar.tsx` - 검색 기능
- `app/instruments/page.tsx` - 악기 페이지

**심각도**: 🟡 **Warning** - 기능은 작동하지만 Next.js 권장사항 위반

---

### 4. 네이버 지도 API 401/500 에러

**발생 시점**: 배포 후 지도 표시 시

**증상**:
```
Failed to load resource: the server responded with a status of 401
NAVER Maps JavaScript API v3 잠시 후에 다시 요청해 주세요.
Error Code / Error Message: 500 / Internal Server Error
```

**영향 범위**:
- 지도 표시 실패
- 관광지 위치 정보 표시 불가

**심각도**: 🟠 **High** - 주요 기능 일부 마비

---

### 5. TypeScript 타입 에러

**발생 시점**: 빌드 시

**증상**:
```
Type error: Property 'cat1' does not exist on type 'TourDetail'
Type error: Cannot find name 'naver'
Type error: Property 'Point' does not exist on type '{ Map: ... }'
```

**영향 범위**:
- `components/tour-detail/detail-info.tsx`
- `components/naver-map.tsx`
- `components/tour-detail/detail-map.tsx`

**심각도**: 🟡 **Medium** - 빌드 실패

---

### 6. 빌드 환경 불일치 (pnpm vs npm)

**발생 시점**: Vercel 빌드 시

**증상**:
```
Skipping build cache since Package Manager changed from "pnpm" to "npm"
```

**영향 범위**:
- 빌드 환경 불일치로 인한 예상치 못한 동작
- 환경 변수 로딩 문제 가능성

**심각도**: 🟠 **High** - 잠재적 문제 발생 가능

---

### 7. 날짜 포맷 에러 (Invalid time value)

**발생 시점**: 통계 페이지 렌더링 시

**증상**:
```
Runtime RangeError: Invalid time value
at formatDate (components/stats/stats-summary.tsx)
```

**영향 범위**:
- 통계 요약 정보의 마지막 업데이트 날짜 표시 실패

**심각도**: 🟡 **Medium** - UI 표시 문제

---

### 8. Export 에러 (StatsSummarySkeleton)

**발생 시점**: 빌드 시

**증상**:
```
Export StatsSummarySkeleton doesn't exist in target module
Uncaught ReferenceError: StatsContent is not defined
```

**영향 범위**:
- 통계 페이지 렌더링 실패

**심각도**: 🟡 **Medium** - 빌드 실패

---

## 실패한 해결 시도와 원인 분석

### ❌ 실패 사례 1: NEXT_PUBLIC_TOUR_API_KEY 우선 사용

**시도한 방법**:
```typescript
// ❌ 잘못된 우선순위
function getApiKey(): string {
  const publicKey = process.env.NEXT_PUBLIC_TOUR_API_KEY; // 우선 사용
  const serverKey = process.env.TOUR_API_KEY; // 대체 사용
  
  if (publicKey) {
    return publicKey;
  }
  // ...
}
```

**왜 실패했는가?**
1. **보안 문제**: `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트 번들에 포함되어 노출됨
2. **환경 변수 혼란**: Vercel에서 어떤 변수를 설정해야 할지 불명확
3. **디버깅 어려움**: 클라이언트/서버 환경에서 다른 동작으로 인한 혼란

**실제 문제**:
- API 키가 클라이언트에 노출되어 보안 위험
- Vercel 환경 변수 설정 시 혼란 발생
- 401 에러의 근본 원인을 찾기 어려움

**교훈**:
- 서버 전용 API 키는 `NEXT_PUBLIC_` 접두사 없이 사용
- 보안을 최우선으로 고려
- 환경 변수 우선순위를 명확히 문서화

---

### ❌ 실패 사례 2: Server Component에서 `ssr: false` 사용

**시도한 방법**:
```typescript
// ❌ Server Component에서 ssr: false 사용
const DetailPetTour = dynamic(
  () => import("@/components/tour-detail/detail-pet-tour"),
  { ssr: false } // Server Component에서는 불가능!
);
```

**왜 실패했는가?**
1. **Next.js 제약사항**: Server Component에서는 `ssr: false`를 사용할 수 없음
2. **아키텍처 이해 부족**: Server Component와 Client Component의 차이를 제대로 이해하지 못함
3. **문서 미확인**: Next.js 공식 문서를 확인하지 않고 추측으로 해결 시도

**실제 문제**:
- Next.js 15 App Router의 기본 규칙 위반
- 빌드 시점에 에러 발생으로 배포 불가

**교훈**:
- 프레임워크의 제약사항을 먼저 확인
- 공식 문서를 참고하여 올바른 패턴 사용
- Server Component와 Client Component의 차이를 명확히 이해

---

### ❌ 실패 사례 3: 환경 변수 문제를 빌드 환경 문제로 오인

**시도한 방법**:
```json
// vercel.json에 pnpm 명시
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install"
}
```

**왜 실패했는가?**
1. **근본 원인 파악 실패**: 401 에러의 진짜 원인은 API 키 문제였는데, 빌드 환경 문제로 착각
2. **5Why 분석 부족**: 표면적인 증상만 보고 깊이 있는 분석 없음
3. **환경 변수 검증 누락**: Vercel에서 환경 변수가 제대로 로드되는지 확인하지 않음

**실제 문제**:
- API 키가 Vercel 환경 변수에 제대로 설정되지 않았거나
- 환경 변수 이름이 잘못되었거나
- API 키 값 자체가 잘못되었을 가능성

**교훈**:
- 에러의 근본 원인을 정확히 파악
- 5Why 분석 등 체계적인 문제 해결 방법 사용
- 환경 변수 검증을 먼저 수행

---

### ❌ 실패 사례 4: 네이버 지도 API 타입 선언 복잡화

**시도한 방법**:
```typescript
// ❌ 복잡한 타입 선언 시도
declare global {
  namespace naver.maps {
    class Map { ... }
    class Marker { ... }
    // ... 수많은 타입 선언
  }
}
```

**왜 실패했는가?**
1. **과도한 복잡성**: 네이버 지도 API의 모든 타입을 선언하려고 시도
2. **순환 참조 문제**: 타입 선언 간 의존성으로 인한 복잡성
3. **유지보수 어려움**: 타입 선언이 너무 복잡하여 유지보수 어려움

**실제 문제**:
- TypeScript 컴파일 에러
- 타입 체크로 인한 개발 속도 저하

**교훈**:
- 간단한 해결책 우선 (`any` 타입 사용 등)
- 완벽한 타입 선언보다 실용성 우선
- 복잡한 타입 선언은 라이브러리 제공 시에만 사용

---

### ❌ 실패 사례 5: useSearchParams Suspense 경계 누락

**시도한 방법**:
```typescript
// ❌ Suspense 없이 직접 사용
export default function Page() {
  const searchParams = useSearchParams(); // 경고 발생
  // ...
}
```

**왜 실패했는가?**
1. **Next.js 15 변경사항 미인지**: Next.js 15에서 `useSearchParams`는 Suspense 경계 필요
2. **경고 무시**: 경고만 발생하고 기능은 작동하여 무시
3. **문서 미확인**: Next.js 15 마이그레이션 가이드 미확인

**실제 문제**:
- Next.js 권장사항 위반
- 잠재적인 렌더링 문제 가능성

**교훈**:
- 프레임워크 버전 업데이트 시 변경사항 확인
- 경고도 무시하지 않고 해결
- 공식 문서의 마이그레이션 가이드 확인

---

## 최종 해결 방법

### ✅ 성공 사례 1: API 키 처리 로직 개선

**최종 해결 방법**:
```typescript
// ✅ 서버 전용 API 키 우선 사용
function getApiKey(): string {
  // 서버 전용 API 키 우선 사용 (보안상 권장)
  const serverKey = process.env.TOUR_API_KEY?.trim();
  // 클라이언트 노출 가능한 API 키 (호환성 유지)
  const publicKey = process.env.NEXT_PUBLIC_TOUR_API_KEY?.trim();

  // 서버 전용 키가 있으면 우선 사용
  if (serverKey && serverKey.length > 0) {
    return serverKey;
  }

  // 클라이언트 노출 키 사용 (호환성)
  if (publicKey && publicKey.length > 0) {
    return publicKey;
  }

  // 상세한 디버깅 로그
  console.error("[TourAPI] API 키 환경 변수 확인:", {
    hasTOUR_API_KEY: !!process.env.TOUR_API_KEY,
    hasNEXT_PUBLIC_TOUR_API_KEY: !!process.env.NEXT_PUBLIC_TOUR_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });

  throw new TourApiError(
    "API 키가 설정되지 않았습니다. Vercel 환경 변수에 TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY를 설정해주세요."
  );
}
```

**성공 요인**:
1. 보안을 최우선으로 고려 (서버 전용 키 우선)
2. 상세한 디버깅 로그 추가
3. 명확한 에러 메시지 제공

---

### ✅ 성공 사례 2: Server Component에서 올바른 동적 임포트

**최종 해결 방법**:
```typescript
// ✅ Server Component에서는 ssr: true 사용
const DetailPetTour = dynamic(
  () =>
    import("@/components/tour-detail/detail-pet-tour").then(
      (mod) => mod.DetailPetTour,
    ),
  {
    loading: () => <PetTourSkeleton />,
    ssr: true, // Server Component에서는 필수
  },
);
```

**성공 요인**:
1. Next.js 공식 문서 확인
2. Server Component의 제약사항 이해
3. 컴포넌트 내부에서 클라이언트 렌더링 처리

---

### ✅ 성공 사례 3: 401 에러 핸들링 개선

**최종 해결 방법**:
```typescript
// ✅ 상세한 디버깅 정보 로깅
if (response.status === 401) {
  const serverKey = process.env.TOUR_API_KEY?.trim();
  const publicKey = process.env.NEXT_PUBLIC_TOUR_API_KEY?.trim();
  const apiKeyInUse = serverKey || publicKey;
  const apiKeyPreview = apiKeyInUse ? `${apiKeyInUse.substring(0, 8)}...` : "없음";
  
  console.error("[TourAPI] 401 Unauthorized 에러 발생:", {
    status: response.status,
    statusText: response.statusText,
    apiKeyLength: apiKeyInUse?.length || 0,
    apiKeyPreview,
    hasTOUR_API_KEY: !!process.env.TOUR_API_KEY,
    hasNEXT_PUBLIC_TOUR_API_KEY: !!process.env.NEXT_PUBLIC_TOUR_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    url: url.substring(0, 100),
  });
  
  throw new TourApiError(
    `API 인증 실패 (401): API 키가 잘못되었거나 만료되었습니다. Vercel 환경 변수(TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY)를 확인해주세요.`,
    response.status,
    { apiKeyPreview }
  );
}
```

**성공 요인**:
1. 문제 진단을 위한 충분한 정보 제공
2. 환경 변수 상태 확인
3. 명확한 해결 방법 안내

---

### ✅ 성공 사례 4: useSearchParams Suspense 경계 추가

**최종 해결 방법**:
```typescript
// ✅ Suspense로 감싸기
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <TourFilters />
    </Suspense>
  );
}

// TourFilters 내부에서 useSearchParams 사용
function TourFilters() {
  const searchParams = useSearchParams(); // 이제 안전함
  // ...
}
```

**성공 요인**:
1. Next.js 15 권장사항 준수
2. 명확한 로딩 상태 제공
3. 사용자 경험 개선

---

## 교훈 및 개선 방안

### 1. 문제 해결 프로세스 개선

**현재 문제점**:
- 표면적인 증상만 보고 근본 원인 파악 실패
- 추측에 의한 해결 시도
- 문서 확인 없이 경험에 의존

**개선 방안**:
1. **5Why 분석 필수화**
   - 모든 에러에 대해 5Why 분석 수행
   - 근본 원인을 정확히 파악한 후 해결 시도

2. **문서 우선 확인**
   - 공식 문서를 먼저 확인
   - 공식 문서에 없는 경우에만 커뮤니티 검색

3. **체계적인 디버깅**
   - 로깅을 통한 문제 진단
   - 단계별 검증을 통한 원인 축소

---

### 2. 보안 우선 사고

**현재 문제점**:
- 편의성을 위해 보안을 희생
- `NEXT_PUBLIC_` 접두사 남용

**개선 방안**:
1. **보안 우선 원칙**
   - API 키는 항상 서버 전용으로 관리
   - 클라이언트 노출이 필요한 경우에만 `NEXT_PUBLIC_` 사용

2. **환경 변수 명명 규칙**
   - 서버 전용: `TOUR_API_KEY`
   - 클라이언트 노출: `NEXT_PUBLIC_TOUR_API_KEY`
   - 우선순위: 서버 전용 > 클라이언트 노출

---

### 3. 프레임워크 제약사항 이해

**현재 문제점**:
- Next.js 15의 변경사항 미인지
- Server Component와 Client Component의 차이 이해 부족

**개선 방안**:
1. **버전 업데이트 시 마이그레이션 가이드 확인**
   - Next.js 15 마이그레이션 가이드 필독
   - 주요 변경사항 문서화

2. **아키텍처 이해 강화**
   - Server Component vs Client Component
   - 동적 임포트 사용 규칙
   - Suspense 경계 필요성

---

### 4. 에러 핸들링 및 로깅 개선

**현재 문제점**:
- 에러 메시지가 모호함
   - 디버깅 정보 부족
   - 문제 진단이 어려움

**개선 방안**:
1. **상세한 에러 로깅**
   - 환경 변수 상태 확인
   - API 요청 정보 로깅
   - 컨텍스트 정보 포함

2. **명확한 에러 메시지**
   - 사용자에게는 친화적인 메시지
   - 개발자에게는 상세한 디버깅 정보

---

### 5. 환경 변수 관리 개선

**현재 문제점**:
- Vercel 환경 변수 설정 방법 불명확
- 환경 변수 검증 부족

**개선 방안**:
1. **환경 변수 설정 가이드 작성**
   - 단계별 설정 방법
   - 체크리스트 제공

2. **환경 변수 검증 강화**
   - 빌드 시점 검증
   - 런타임 검증
   - 명확한 에러 메시지

---

## 향후 에러 예방 체크리스트

### 개발 시작 전

- [ ] 프레임워크 버전 및 마이그레이션 가이드 확인
- [ ] 프로젝트 아키텍처 문서화
- [ ] 환경 변수 명명 규칙 정의
- [ ] 보안 가이드라인 수립

### 개발 중

- [ ] 공식 문서 우선 확인
- [ ] 에러 발생 시 5Why 분석 수행
- [ ] 상세한 로깅 추가
- [ ] 단계별 검증 수행

### 배포 전

- [ ] 로컬 빌드 테스트 (`pnpm build`)
- [ ] 환경 변수 설정 확인
- [ ] 에러 핸들링 테스트
- [ ] 보안 검토

### 배포 후

- [ ] 빌드 로그 확인
- [ ] 런타임 에러 모니터링
- [ ] 사용자 피드백 수집
- [ ] 에러 로그 문서화

---

## 주요 문서 참고

- [에러 로그](./ERROR_LOG.md) - 발생한 에러 상세 기록
- [에러 분석](./ERROR_ANALYSIS.md) - 5Why 분석 결과
- [API 키 디버깅](./API_KEY_DEBUGGING.md) - 401 에러 해결 가이드
- [Vercel 배포 가이드](./VERCEL_DEPLOY.md) - 배포 설정 방법
- [Vercel 환경 변수 설정](./VERCEL_ENV_SETUP.md) - 환경 변수 설정 가이드

---

## 결론

이 프로젝트를 통해 많은 에러를 경험하고 해결하는 과정에서 다음과 같은 교훈을 얻었습니다:

1. **근본 원인 파악의 중요성**: 표면적인 증상만 보고 해결하려 하면 실패
2. **보안 우선 사고**: 편의성을 위해 보안을 희생하면 안 됨
3. **문서 확인의 중요성**: 추측보다 공식 문서 확인이 정확함
4. **체계적인 디버깅**: 로깅과 단계별 검증이 문제 해결의 핵심
5. **지속적인 학습**: 프레임워크 업데이트와 최신 패턴을 지속적으로 학습

이러한 교훈을 바탕으로 향후 프로젝트에서는 더 효율적이고 안정적인 개발이 가능할 것입니다.

---

**마지막 업데이트**: 2025-12-10  
**작성자**: AI Assistant (Claude)  
**프로젝트 상태**: ✅ 완료

