# 네이버 지도 API 설정 가이드

네이버 지도가 정상적으로 작동하지 않는 경우, 다음 설정을 확인하세요.

## 🔴 주요 에러

### 1. 500 Internal Server Error

**에러 메시지:**
```
NAVER Maps JavaScript API v3 잠시 후에 다시 요청해 주세요.
Error Code / Error Message: 500 / Internal Server Error (내부 서버 오류)
```

**원인:**
- 네이버 클라우드 플랫폼에서 웹 서비스 URL이 등록되지 않았습니다.

**해결 방법:**

1. [네이버 클라우드 플랫폼 콘솔](https://console.ncloud.com/) 접속
2. **Services** → **AI·NAVER API** → **Maps** 선택
3. 사용 중인 애플리케이션 선택
4. **웹 서비스 URL** 섹션으로 이동
5. 다음 URL을 추가:
   - 개발 환경: `http://localhost:3000`
   - 프로덕션 환경: `https://1210oz.vercel.app` (또는 실제 배포 URL)
   - 모든 하위 경로 허용: `https://1210oz.vercel.app/*`
6. **저장** 클릭

### 2. 401 Unauthorized

**에러 메시지:**
```
Failed to load resource: the server responded with a status of 401
```

**원인:**
- API 키가 잘못되었거나 만료되었습니다.
- 웹 서비스 URL이 등록되지 않았습니다.

**해결 방법:**
1. 환경 변수 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 확인
2. 네이버 클라우드 플랫폼에서 API 키 유효성 확인
3. 웹 서비스 URL 등록 확인

### 3. TypeError: Cannot read properties of null

**에러 메시지:**
```
Uncaught TypeError: Cannot read properties of null (reading 'isArray')
```

**원인:**
- 네이버 지도 API 스크립트가 제대로 로드되지 않았습니다.
- API 키가 유효하지 않거나 웹 서비스 URL이 등록되지 않았습니다.

**해결 방법:**
1. 브라우저 콘솔에서 네이버 지도 API 스크립트 로드 상태 확인
2. 네트워크 탭에서 `maps.js` 요청 상태 확인
3. 웹 서비스 URL 등록 확인

## 📝 체크리스트

배포 후 네이버 지도가 작동하지 않는 경우:

- [ ] 네이버 클라우드 플랫폼에서 웹 서비스 URL이 등록되었는가?
- [ ] 환경 변수 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`가 올바르게 설정되었는가?
- [ ] API 키가 유효한가? (만료되지 않았는가?)
- [ ] Maps API 서비스가 활성화되어 있는가?
- [ ] 웹 서비스 URL에 프로토콜(`https://`)이 포함되어 있는가?

## 🔗 참고 링크

- [네이버 클라우드 플랫폼 Maps API 문서](https://guide.ncloud.com/docs/maps-web-overview)
- [웹 서비스 URL 등록 가이드](https://guide.ncloud.com/docs/maps-web-service-url)


