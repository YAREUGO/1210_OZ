# API 키 디버깅 가이드

## 🔍 문제 현상

Vercel 배포 환경에서 401 Unauthorized 에러 발생:
- 통계 페이지에서 지역별/타입별 통계 조회 시 401 에러
- `API 요청 실패: 401 Unauthorized` 메시지

## 🔧 해결 방법

### 1. 환경 변수 우선순위 변경

**이전:**
- `NEXT_PUBLIC_TOUR_API_KEY` 우선 사용
- `TOUR_API_KEY` 대체 사용

**변경 후:**
- `TOUR_API_KEY` (서버 전용) 우선 사용 ✅
- `NEXT_PUBLIC_TOUR_API_KEY` (클라이언트 노출) 대체 사용

**이유:**
- `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에도 노출되어 보안상 위험
- 서버 전용 API 키 사용이 더 안전

### 2. 에러 핸들링 개선

**추가된 기능:**
- 401 에러 발생 시 상세한 디버깅 정보 로깅
- 환경 변수 존재 여부 확인
- API 키 미리보기 (보안을 위해 일부만 표시)
- Vercel 환경 정보 포함

**에러 메시지 예시:**
```
[TourAPI] 401 Unauthorized 에러 발생: {
  status: 401,
  statusText: "Unauthorized",
  apiKeyLength: 32,
  apiKeyPreview: "abc12345...",
  hasTOUR_API_KEY: true,
  hasNEXT_PUBLIC_TOUR_API_KEY: false,
  nodeEnv: "production",
  vercelEnv: "production"
}
```

### 3. 환경 변수 검증 강화

**추가된 검증:**
- 빈 문자열 체크 (`trim()` 적용)
- 환경 변수 존재 여부 로깅
- 빌드/런타임 환경 정보 포함

## 📝 Vercel 환경 변수 설정

### 필수 환경 변수

Vercel Dashboard → Settings → Environment Variables에서 설정:

```env
# 서버 전용 API 키 (권장)
TOUR_API_KEY=your-tour-api-key-here

# 또는 클라이언트 노출 가능한 API 키 (호환성 유지)
NEXT_PUBLIC_TOUR_API_KEY=your-tour-api-key-here
```

### 환경별 설정

- **Production**: 프로덕션 API 키
- **Preview**: 테스트 API 키
- **Development**: 개발 API 키

### 확인 방법

1. **Vercel Dashboard 확인**
   - Settings → Environment Variables
   - 각 환경별로 설정되어 있는지 확인

2. **빌드 로그 확인**
   - Deployments → 배포 항목 클릭
   - 빌드 로그에서 환경 변수 로딩 확인
   - `[TourAPI]` 로그 메시지 확인

3. **런타임 확인**
   - 배포된 사이트에서 통계 페이지 접속
   - 브라우저 콘솔에서 에러 메시지 확인
   - 서버 로그에서 `[TourAPI]` 로그 확인

## 🐛 문제 해결 체크리스트

### 401 Unauthorized 에러 발생 시

- [ ] Vercel 환경 변수에 `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY` 설정 확인
- [ ] 환경 변수 값이 올바른지 확인 (공백, 특수문자 등)
- [ ] API 키가 만료되지 않았는지 확인
- [ ] 빌드 로그에서 환경 변수 로딩 확인
- [ ] 서버 로그에서 `[TourAPI]` 디버깅 정보 확인

### 환경 변수가 로드되지 않는 경우

- [ ] Vercel 프로젝트 설정에서 환경 변수 재설정
- [ ] 환경 변수 이름 확인 (대소문자 구분)
- [ ] 빌드 재시도 (환경 변수 변경 후 자동 재배포)
- [ ] Vercel CLI로 환경 변수 확인: `vercel env ls`

## 🔗 참고 문서

- [Vercel 환경 변수 설정 가이드](./VERCEL_DEPLOY.md)
- [에러 분석 문서](./ERROR_ANALYSIS.md)
- [한국관광공사 공공데이터포털](https://www.data.go.kr/)

## 📌 주요 변경사항

### `lib/api/tour-api.ts`

1. **`getApiKey()` 함수 개선**
   - `TOUR_API_KEY` 우선 사용
   - 빈 문자열 체크 추가
   - 상세한 디버깅 로그 추가

2. **401 에러 핸들링 개선**
   - 상세한 에러 정보 로깅
   - 환경 변수 상태 확인
   - 명확한 에러 메시지 제공

### `docs/VERCEL_DEPLOY.md`

- `TOUR_API_KEY` 설정 안내 추가
- 401 에러 해결 방법 추가

