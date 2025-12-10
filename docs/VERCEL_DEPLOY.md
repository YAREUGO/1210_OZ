# Vercel 배포 가이드

이 문서는 My Trip 프로젝트를 Vercel에 배포하는 방법을 안내합니다.

## 📋 사전 준비

1. **GitHub 저장소 준비**
   - 코드가 GitHub에 푸시되어 있어야 합니다
   - Vercel은 GitHub 저장소와 연동하여 자동 배포합니다

2. **환경 변수 준비**
   - 로컬 `.env` 파일에 모든 환경 변수가 설정되어 있어야 합니다
   - 아래 환경 변수 목록을 참고하여 Vercel에 설정하세요

## 🚀 Vercel 배포 단계

### 1. Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 접속하여 로그인
2. **"Add New..."** → **"Project"** 클릭
3. GitHub 저장소 선택 또는 Import
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `pnpm build` (자동 감지)
   - **Output Directory**: `.next` (자동 감지)
   - **Install Command**: `pnpm install` (자동 감지)

### 2. 환경 변수 설정

**⚠️ 중요**: 배포 전에 반드시 모든 환경 변수를 설정해야 합니다.

Vercel Dashboard → 프로젝트 선택 → **Settings** → **Environment Variables** 메뉴에서 다음 환경 변수들을 추가하세요:

#### Clerk 인증 관련

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

**값 확인 위치:**
- Clerk Dashboard → **API Keys** 메뉴

#### Supabase 데이터베이스 관련

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

**값 확인 위치:**
- Supabase Dashboard → **Settings** → **API** 메뉴
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role secret key

> **⚠️ 보안 주의**: `SUPABASE_SERVICE_ROLE_KEY`는 모든 RLS를 우회하는 관리자 권한이므로 절대 공개하지 마세요!

#### 한국관광공사 API 관련

```env
NEXT_PUBLIC_TOUR_API_KEY=your-tour-api-key
```

**값 확인 위치:**
- [한국관광공사 공공데이터포털](https://www.data.go.kr/)
- 회원가입 후 API 키 발급

#### 네이버 지도 API 관련

```env
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your-naver-map-client-id
```

**값 확인 위치:**
- [네이버 클라우드 플랫폼](https://www.ncloud.com/)
- Maps API 서비스 신청 후 Client ID 발급

**⚠️ 중요**: 배포 후 반드시 네이버 클라우드 플랫폼에서 **웹 서비스 URL**을 등록해야 합니다!
- Vercel 배포 URL: `https://1210oz.vercel.app` (또는 실제 배포 URL)
- 자세한 설정 방법: [네이버 지도 API 설정 가이드](./NAVER_MAP_SETUP.md)

#### 앱 URL (선택 사항)

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**설명:**
- 배포 후 Vercel이 자동으로 생성하는 도메인
- 또는 커스텀 도메인 사용 시 해당 URL
- Open Graph 메타데이터에 사용됨

### 3. 환경별 환경 변수 설정

Vercel에서는 환경별로 환경 변수를 다르게 설정할 수 있습니다:

- **Production**: 프로덕션 환경 (메인 브랜치 배포)
- **Preview**: 프리뷰 환경 (PR, 브랜치 배포)
- **Development**: 개발 환경

각 환경에 맞는 값을 설정하세요. 예를 들어:
- Production: 프로덕션 API 키
- Preview/Development: 테스트 API 키

### 4. 배포 실행

1. 환경 변수 설정 완료 후 **"Deploy"** 버튼 클릭
2. Vercel이 자동으로 빌드 및 배포를 진행합니다
3. 배포 완료 후 제공되는 URL로 접속하여 확인

### 5. 배포 확인

배포가 완료되면 다음을 확인하세요:

1. **빌드 로그 확인**
   - Vercel Dashboard → **Deployments** → 배포 항목 클릭
   - 빌드 로그에서 에러가 없는지 확인

2. **환경 변수 확인**
   - 배포된 사이트에서 환경 변수가 제대로 로드되었는지 확인
   - 브라우저 콘솔에서 에러가 없는지 확인

3. **기능 테스트**
   - 홈페이지 접속 확인
   - 로그인/회원가입 테스트
   - 관광지 검색 테스트
   - 지도 표시 확인
   - 통계 페이지 확인

## 🔧 문제 해결

### 빌드 실패

**원인:**
- 환경 변수 누락
- 타입 에러
- 의존성 설치 실패

**해결:**
1. 빌드 로그 확인
2. 로컬에서 `pnpm build` 실행하여 에러 확인
3. 환경 변수 재확인

### 런타임 에러

**원인:**
- 환경 변수 값 오류
- API 키 만료
- CORS 문제

**해결:**
1. 브라우저 콘솔 확인
2. 환경 변수 값 재확인
3. API 키 유효성 확인

### 지도가 표시되지 않음

**원인:**
- 네이버 지도 API 키 누락 또는 오류
- 웹 서비스 URL 미등록

**해결:**
1. `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 확인
2. 네이버 클라우드 플랫폼에서 웹 서비스 URL 등록 확인
   - Vercel 도메인: `https://your-app.vercel.app`
   - 또는 커스텀 도메인

## 📝 체크리스트

배포 전 확인사항:

- [ ] 모든 환경 변수가 Vercel에 설정되었는가?
- [ ] 로컬에서 `pnpm build`가 성공하는가?
- [ ] 로컬에서 `pnpm start`로 프로덕션 빌드가 정상 작동하는가?
- [ ] GitHub에 최신 코드가 푸시되었는가?
- [ ] API 키들이 유효한가?
- [ ] 네이버 지도 API에 웹 서비스 URL이 등록되었는가?

## 🔗 참고 링크

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [환경 변수 설정 가이드](https://vercel.com/docs/concepts/projects/environment-variables)

