# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다.

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어를 지원합니다. 한국어는 `koKR` 키로 제공됩니다.

> **⚠️ 참고**: 로컬라이제이션 기능은 현재 실험적(experimental) 기능입니다. 예상과 다르게 동작할 수 있으므로 주의가 필요합니다.

## 현재 설정

프로젝트에는 이미 한국어 로컬라이제이션이 적용되어 있습니다:

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        {/* ... */}
      </html>
    </ClerkProvider>
  );
}
```

## 지원되는 언어

Clerk는 다음 언어를 지원합니다:

| 언어 | 키 | BCP 47 태그 |
|------|-----|-------------|
| 한국어 | `koKR` | `ko-KR` |
| 영어 (미국) | `enUS` | `en-US` |
| 영어 (영국) | `enGB` | `en-GB` |
| 일본어 | `jaJP` | `ja-JP` |
| 중국어 (간체) | `zhCN` | `zh-CN` |
| 중국어 (번체) | `zhTW` | `zh-TW` |
| ... | ... | ... |

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)를 참고하세요.

## 사용 방법

### 1. 패키지 설치

`@clerk/localizations` 패키지가 이미 설치되어 있습니다:

```bash
pnpm add @clerk/localizations
```

### 2. 로컬라이제이션 적용

`ClerkProvider`에 `localization` prop을 전달합니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      {children}
    </ClerkProvider>
  );
}
```

### 3. 에러 메시지 커스터마이징

에러 메시지를 한국어로 커스터마이징할 수 있습니다:

```tsx
import { koKR } from "@clerk/localizations";

const koreanLocalization = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 기업 이메일 도메인을 허용 목록에 추가하려면 이메일로 문의해주세요.",
  },
};

<ClerkProvider localization={koreanLocalization}>
  {/* ... */}
</ClerkProvider>
```

### 4. Tailwind CSS 4 호환성

Tailwind CSS 4를 사용하는 경우 `appearance` prop에 `cssLayerName`을 설정합니다:

```tsx
<ClerkProvider
  localization={koKR}
  appearance={{
    cssLayerName: "clerk",
  }}
>
  {/* ... */}
</ClerkProvider>
```

## 적용 범위

로컬라이제이션은 다음 Clerk 컴포넌트에 적용됩니다:

- ✅ `SignIn` 컴포넌트
- ✅ `SignUp` 컴포넌트
- ✅ `UserButton` 컴포넌트
- ✅ `SignInButton` 컴포넌트
- ✅ `SignUpButton` 컴포넌트
- ✅ 모든 Clerk 모달 및 폼

> **⚠️ 주의**: Clerk Account Portal (호스팅된 계정 관리 페이지)는 여전히 영어로 표시됩니다.

## 커스텀 로컬라이제이션

특정 텍스트만 변경하고 싶은 경우:

```tsx
const customLocalization = {
  ...koKR,
  signUp: {
    start: {
      subtitle: "{{applicationName}}에 가입하세요",
    },
  },
  signIn: {
    start: {
      subtitle: "{{applicationName}}에 로그인하세요",
    },
  },
};

<ClerkProvider localization={customLocalization}>
  {/* ... */}
</ClerkProvider>
```

## 문제 해결

### 로컬라이제이션이 적용되지 않는 경우

1. `@clerk/localizations` 패키지가 설치되어 있는지 확인
2. `ClerkProvider`에 `localization` prop이 올바르게 전달되었는지 확인
3. 브라우저 캐시를 지우고 다시 시도
4. 개발 서버를 재시작

### 일부 텍스트가 여전히 영어로 표시되는 경우

- Clerk Account Portal은 영어로만 제공됩니다
- 커스텀 에러 메시지는 `unstable__errors`를 통해 설정해야 합니다
- 일부 동적 텍스트는 로컬라이제이션되지 않을 수 있습니다

## 추가 리소스

- [Clerk 로컬라이제이션 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)
- [@clerk/localizations 패키지](https://www.npmjs.com/package/@clerk/localizations)
- [한국어 로컬라이제이션 소스 코드](https://github.com/clerk/javascript/tree/main/packages/localizations/src)

## 변경 이력

- **2025-01**: 한국어 로컬라이제이션 적용 및 에러 메시지 커스터마이징 추가


