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

### 좌표 변환 공식 오류 - 지도가 파란색(바다)으로만 표시됨

- **발생 시점**: Phase 3 지도 섹션 구현 후 상세페이지 접속 시
- **에러 내용**: 지도가 파란색(바다)으로만 표시되고 마커가 보이지 않음
- **콘솔 메시지**: "좌표가 한국 범위를 벗어남" (디버깅 로그 추가 후 확인)
- **원인**:
  - `katecToWgs84()` 함수가 모든 좌표를 무조건 10000000으로 나눔
  - 한국관광공사 API는 이미 WGS84 좌표를 제공 (예: `mapx: "126.xxx"`, `mapy: "37.xxx"`)
  - 이 값을 10000000으로 나누면 `0.0000000126`이 되어 한국 범위(경도 124-132, 위도 33-43)를 벗어남
  - 결과적으로 지도가 바다(0,0 좌표 부근)를 표시
- **해결 방법**:
  - 좌표 변환 함수를 수정하여 두 가지 경우를 처리:
    1. 좌표가 이미 유효한 범위에 있으면 그대로 사용
    2. 정수형 좌표(예: `1269857598`)인 경우에만 10000000으로 나누어 변환
- **수정된 코드** (`lib/utils/coordinate.ts`):

  ```typescript
  export function katecToWgs84(
    mapx: string | number,
    mapy: string | number
  ): { lng: number; lat: number } {
    const x = typeof mapx === "string" ? parseFloat(mapx) : mapx;
    const y = typeof mapy === "string" ? parseFloat(mapy) : mapy;

    // 좌표 범위 확인 (한국: 경도 124-132, 위도 33-43)
    const isValidKoreaLng = x >= 124 && x <= 132;
    const isValidKoreaLat = y >= 33 && y <= 43;

    // 이미 유효한 WGS84 좌표인 경우 그대로 반환
    if (isValidKoreaLng && isValidKoreaLat) {
      return { lng: x, lat: y };
    }

    // 정수형 좌표인 경우 변환 (10000000으로 나눔)
    const convertedLng = x / 10000000;
    const convertedLat = y / 10000000;

    if (convertedLng >= 124 && convertedLng <= 132 && convertedLat >= 33 && convertedLat <= 43) {
      return { lng: convertedLng, lat: convertedLat };
    }

    // 둘 다 아닌 경우 원본 값 그대로 반환
    return { lng: x, lat: y };
  }
  ```

- **교훈**:
  - 외부 API 데이터 형식을 가정하지 말고 실제 응답 값을 확인해야 함
  - 좌표 변환 시 입력 값 범위를 검증하는 로직 필요
- **참고 자료**:
  - 한국관광공사 API 문서: 좌표 형식 확인

---
