# Vercel 환경 변수 설정 가이드

## ⚠️ 중요 안내

**Vercel에서는 `.env` 파일을 직접 업로드할 수 없습니다!**

대신 Vercel Dashboard에서 **개별 환경 변수**를 하나씩 설정해야 합니다.

## 📋 설정 방법

### 1. Vercel Dashboard 접속

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택 (예: `1210_oz`)
3. **Settings** 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 클릭

### 2. 환경 변수 추가

각 환경 변수를 **하나씩** 추가합니다:

#### 한국관광공사 API 키

1. **Key**: `TOUR_API_KEY` (또는 `NEXT_PUBLIC_TOUR_API_KEY`)
2. **Value**: `.env` 파일의 `TOUR_API_KEY=` 뒤의 값
3. **Environment**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **Add** 버튼 클릭

#### Clerk 인증

1. **Key**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. **Value**: `.env` 파일의 값
3. **Environment**: 모두 선택
4. **Add** 버튼 클릭

1. **Key**: `CLERK_SECRET_KEY`
2. **Value**: `.env` 파일의 값
3. **Environment**: 모두 선택
4. **Add** 버튼 클릭

#### Supabase

1. **Key**: `NEXT_PUBLIC_SUPABASE_URL`
2. **Value**: `.env` 파일의 값
3. **Environment**: 모두 선택
4. **Add** 버튼 클릭

1. **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **Value**: `.env` 파일의 값
3. **Environment**: 모두 선택
4. **Add** 버튼 클릭

1. **Key**: `SUPABASE_SERVICE_ROLE_KEY`
2. **Value**: `.env` 파일의 값
3. **Environment**: 모두 선택
4. **Add** 버튼 클릭

#### 네이버 지도

1. **Key**: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
2. **Value**: `.env` 파일의 값
3. **Environment**: 모두 선택
4. **Add** 버튼 클릭

### 3. 설정 확인

모든 환경 변수를 추가한 후:

1. **환경 변수 목록 확인**
   - 각 변수가 올바르게 설정되었는지 확인
   - 값이 `***`로 표시되는 것은 정상입니다 (보안)

2. **재배포**
   - 환경 변수를 추가/수정한 후에는 **자동으로 재배포**됩니다
   - 또는 수동으로 **Deployments** → **Redeploy** 클릭

## 🔍 환경 변수 확인 방법

### Vercel CLI 사용 (선택사항)

```bash
# 환경 변수 목록 확인
vercel env ls

# 특정 환경 변수 확인
vercel env pull .env.local
```

### 빌드 로그 확인

1. Vercel Dashboard → **Deployments**
2. 최신 배포 클릭
3. **Build Logs** 확인
4. `[TourAPI]` 로그에서 환경 변수 상태 확인

## ⚠️ 주의사항

### 1. `.env` 파일은 Git에 커밋하지 마세요!

- `.env` 파일은 이미 `.gitignore`에 포함되어 있습니다
- 절대 Git에 커밋하지 마세요 (보안 위험)

### 2. 환경 변수 이름 확인

- 대소문자 구분: `TOUR_API_KEY` ≠ `tour_api_key`
- 공백 없이 정확히 입력

### 3. 값 확인

- 값 앞뒤 공백 제거
- 따옴표(`"`, `'`) 제거
- 줄바꿈 문자 제거

### 4. 환경별 설정

- **Production**: 프로덕션 환경 (메인 브랜치)
- **Preview**: 프리뷰 환경 (PR, 브랜치)
- **Development**: 개발 환경

각 환경에 맞는 값을 설정할 수 있습니다.

## 🐛 문제 해결

### 환경 변수가 로드되지 않는 경우

1. **환경 변수 이름 확인**
   - Vercel Dashboard에서 정확한 이름인지 확인
   - 대소문자 구분 확인

2. **재배포**
   - 환경 변수 추가/수정 후 재배포 필요
   - 자동 재배포 또는 수동 재배포

3. **빌드 로그 확인**
   - `[TourAPI]` 로그에서 환경 변수 상태 확인
   - `hasTOUR_API_KEY: false` 등 확인

4. **로컬 `.env` 파일 확인**
   - 로컬에서는 `.env` 파일이 정상 작동
   - Vercel에서는 Dashboard에서 설정해야 함

## 📝 체크리스트

환경 변수 설정 완료 확인:

- [ ] `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY` 설정
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 설정
- [ ] `CLERK_SECRET_KEY` 설정
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 설정
- [ ] `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 설정
- [ ] 모든 환경 변수에 적절한 Environment 선택
- [ ] 재배포 완료
- [ ] 빌드 로그에서 환경 변수 로딩 확인

## 🔗 참고 문서

- [Vercel 환경 변수 공식 문서](https://vercel.com/docs/concepts/projects/environment-variables)
- [배포 가이드](./VERCEL_DEPLOY.md)
- [API 키 디버깅 가이드](./API_KEY_DEBUGGING.md)

