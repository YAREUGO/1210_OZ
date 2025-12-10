# 에러 노트 (Error Log)

> 개발 중 발생한 에러와 문제, 해결 방법을 기록합니다.

## 기록 형식

```markdown
### [날짜] 에러 제목

- **발생 시점**: 언제 발생했는지
- **에러 내용**: 정확한 에러 메시지
- **원인**: 왜 발생했는지
- **해결 방법**: 어떻게 해결했는지
- **참고 자료**: 관련 문서나 링크
```

---

## 2025-12-10

### package-lock.json 충돌 문제

- **발생 시점**: Phase 1-2 구현 완료 후 GitHub 푸시 시
- **에러 내용**: pnpm 프로젝트인데 package-lock.json 파일이 존재함
- **원인**:
  - 프로젝트는 pnpm을 사용하지만, 어딘가에서 npm install이 실행되어 package-lock.json이 생성됨
  - npm 문서에 따르면 package-lock.json은 npm 프로젝트에서만 필요하며, pnpm 프로젝트에서는 pnpm-lock.yaml을 사용해야 함
- **해결 방법**:
  1. Git에서 package-lock.json 제거: `git rm --cached package-lock.json`
  2. 파일 삭제: `Remove-Item package-lock.json`
  3. .gitignore에 package-lock.json 추가하여 향후 무시되도록 설정
- **참고 자료**:
  - [npm package-lock.json 문서](https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json)
  - pnpm 프로젝트에서는 pnpm-lock.yaml만 사용해야 함

### 네이버 지도 API 환경변수 검증 추가

- **발생 시점**: 네이버 지도 컴포넌트 구현 중
- **에러 내용**: 환경변수가 없을 때 API 스크립트 로드 실패 가능성
- **원인**:
  - `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`가 설정되지 않았을 때 스크립트 로드 시도
  - 빈 문자열로 API 호출 시 에러 발생 가능
- **해결 방법**:
  - 스크립트 로드 전 환경변수 검증 추가
  - 환경변수가 없으면 경고 메시지 출력 후 early return
- **참고 자료**:
  - Naver Maps API v3 (NCP) 문서
  - URL 파라미터: `ncpKeyId` 사용 (구 `ncpClientId` 아님)

### detail-map.tsx 좌표 변환 함수 사용 오류

- **발생 시점**: Phase 3 지도 섹션 구현 후 상세페이지 접속 시
- **에러 내용**: `TypeError: object is not iterable (cannot read property Symbol(Symbol.iterator))`
- **에러 위치**:
  - `components/tour-detail/detail-map.tsx:81:28`
  - `components/tour-detail/detail-map.tsx:136:28`
- **원인**:
  - `katecToWgs84()` 함수는 `{ lng: number, lat: number }` 객체를 반환하는데, 배열 구조 분해 `[lng, lat]`를 사용하여 에러 발생
- **해결 방법**:
  - 배열 구조 분해 `[lng, lat]`를 객체 구조 분해 `{ lng, lat }`로 변경
- **수정된 코드**:

  ```typescript
  // ❌ 잘못된 코드
  const [lng, lat] = katecToWgs84(mapx, mapy);

  // ✅ 올바른 코드
  const { lng, lat } = katecToWgs84(mapx, mapy);
  ```

- **참고 자료**:
  - `lib/utils/coordinate.ts`: `katecToWgs84` 함수 정의 확인

### 네이버 지도 API 인증 실패 오류
- **발생 시점**: Phase 3 지도 섹션 구현 후 상세페이지 접속 시
- **에러 내용**: `NAVER Maps JavaScript API v3 네이버 지도 Open API 인증이 실패하였습니다`
- **에러 코드**: 200 / Authentication Failed
- **원인**: 
  1. `detail-map.tsx`에서 잘못된 파라미터 사용: `ncpClientId` 대신 `ncpKeyId` 사용해야 함
  2. 네이버 클라우드 플랫폼에서 웹 서비스 URL에 `http://localhost:3000`이 등록되지 않음
- **해결 방법**:
  1. 코드 수정: `ncpClientId` → `ncpKeyId`로 변경 (완료)
  2. 네이버 클라우드 플랫폼 설정:
     - [네이버 클라우드 플랫폼 콘솔](https://console.ncloud.com) 접속
     - AI·NAVER API > Maps > 내 애플리케이션 선택
     - 웹 서비스 URL에 `http://localhost:3000` 추가
     - 프로덕션 도메인도 별도로 등록 필요 (예: `https://yourdomain.com`)
- **참고 자료**: 
  - [네이버 지도 API 문서](https://navermaps.github.io/maps.js.ncp/docs/)
  - URL 파라미터: `ncpKeyId` (v3 API)

---
