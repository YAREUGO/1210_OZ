# 5Why 분석: 데이터 로딩 오류

## 🔴 문제 현상

프로덕션 사이트에서 "데이터 로딩 오류" 발생
- 빌드 로그에서 다수의 `401 Unauthorized` 에러 발생
- 통계 페이지에서 모든 API 호출 실패

## 🔍 5Why 분석

### Why 1: 왜 데이터 로딩 오류가 발생하는가?
**답**: 빌드 로그에서 `401 Unauthorized` 에러가 발생하고 있음
- 통계 페이지에서 여러 타입별, 지역별 통계 조회 시 모두 401 에러
- `API 요청 실패: 401 Unauthorized`

### Why 2: 왜 401 Unauthorized 에러가 발생하는가?
**답**: API 키가 잘못되었거나 환경 변수가 제대로 로드되지 않았을 가능성
- `vercel env ls` 결과를 보면 `NEXT_PUBLIC_TOUR_API_KEY`는 설정되어 있음
- 하지만 빌드 시 실제로 사용되지 않았을 가능성

### Why 3: 왜 환경 변수가 설정되어 있는데도 401 에러가 발생하는가?
**답**: 빌드 로그를 보면 Package Manager가 변경됨
- `Skipping build cache since Package Manager changed from "pnpm" to "npm"`
- Vercel이 npm을 사용하고 있음
- `package.json`에 `packageManager` 필드가 없어서 Vercel이 npm을 기본값으로 사용

### Why 4: 왜 Package Manager가 pnpm에서 npm으로 변경되었는가?
**답**: `vercel.json` 설정 파일이 없어서 Vercel이 자동 감지한 결과
- Vercel은 기본적으로 `package-lock.json`이 있으면 npm을 사용
- `pnpm-lock.yaml`만 있어도 pnpm을 감지하지만, 설정이 명확하지 않으면 npm을 사용할 수 있음

### Why 5: 왜 이게 문제인가?
**답**: 빌드 환경이 일관되지 않아 환경 변수나 의존성이 제대로 로드되지 않을 수 있음
- npm과 pnpm의 의존성 해결 방식이 다름
- 환경 변수는 설정되어 있지만, 빌드 시점에 제대로 전달되지 않았을 가능성

## ✅ 해결 방법

### 1. vercel.json 파일 생성
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### 2. package.json에 packageManager 필드 추가
```json
{
  "packageManager": "pnpm@9.0.0"
}
```

### 3. 환경 변수 재확인
- Vercel Dashboard에서 모든 환경 변수가 올바르게 설정되었는지 확인
- 특히 `NEXT_PUBLIC_TOUR_API_KEY` 값이 올바른지 확인

### 4. API 키 유효성 확인
- 한국관광공사 API 키가 만료되지 않았는지 확인
- API 키가 올바른 형식인지 확인 (URL 디코딩 필요할 수 있음)

## 📝 추가 확인 사항

1. **빌드 로그에서 실제 API 키 확인**
   - 환경 변수가 빌드 시점에 제대로 로드되는지 확인
   - API 키가 빌드 로그에 노출되지 않도록 주의

2. **로컬 빌드 테스트**
   - 로컬에서 `pnpm build` 실행하여 동일한 에러가 발생하는지 확인
   - 로컬에서는 정상 작동한다면 Vercel 환경 변수 문제일 가능성

3. **API 키 형식 확인**
   - 한국관광공사 API 키는 URL 인코딩된 형식일 수 있음
   - Vercel에 설정할 때 올바른 형식으로 설정되었는지 확인

## 🎯 예상 결과

위 해결 방법을 적용하면:
- Vercel이 pnpm을 사용하여 빌드
- 환경 변수가 제대로 로드됨
- API 호출이 정상적으로 작동
- 데이터 로딩 오류 해결


