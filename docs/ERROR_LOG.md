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

---

