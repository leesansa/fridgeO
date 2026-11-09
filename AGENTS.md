# fridgeO 프로젝트 작업 지침

이 프로젝트에서 작업할 때 다음 지침을 반드시 준수한다.

## Git에 포함하지 않을 파일

- 설치된 Node.js 의존성(`node_modules/`)은 GitHub에 올리지 않는다. 설치된 React, React DOM, Vite 패키지도 여기에 포함된다.
- Vite 캐시(`.vite/`)와 임시 설정 파일(`vite.config.*.timestamp-*`)은 GitHub에 올리지 않는다.
- React/Vite 빌드 결과물(`dist/`, `build/`)은 GitHub에 올리지 않는다.
- 환경 변수 파일과 비밀번호 등 비밀 정보는 GitHub에 올리지 않는다. 실제 비밀 값이 없는 `.env.example`은 포함할 수 있다.
- 새로운 도구를 설치하면 해당 도구의 의존성, 캐시, 생성 결과물이 `.gitignore`에 적절히 등록되어 있는지 확인한다.
- 작업 완료 전 `git status`와 필요한 경우 `git check-ignore`로 제외 여부를 확인한다. 이미 추적 중인 파일은 `.gitignore`만으로 제외되지 않으므로 추적 상태도 확인한다.

## Git에 유지할 파일

- 직접 작성한 React 소스(`src/`), 이미지 등 프로젝트 자산은 Git에 유지한다.
- 프로젝트 재현에 필요한 `package.json`, 패키지 잠금 파일, `index.html`, `vite.config.*` 등의 설정 원본은 Git에 유지한다. Vite 임시 설정 파일은 위 제외 규칙을 따른다.

## 기존 구조 유지

- `src/pages` 안의 기존 폴더 이름은 사용자 요청 없이 변경하지 않는다.