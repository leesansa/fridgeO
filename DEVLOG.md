# fridgeO 개발 일지

> Git 커밋 기록(2026-11-04 ~ 2026-11-12, 커밋 105개)을 바탕으로 날짜별로 정리했습니다.
> 메시지가 짧은 커밋(`.`, `fix`, `추가` 등)은 바뀐 파일을 보고 내용을 적었습니다. 병합(Merge) 커밋은 생략했습니다.

**참여자**: geon young Hwang, 성시원 Seong Siwon, leesansa, mimimiqqq, soonbub99

---

## 2026-11-04 (화) — 프로젝트 시작

- 저장소 생성(Initial commit), README 작성·수정 (leesansa, 성시원)
- **프로젝트 구조 설립** (성시원): React + Vite 설정(`package.json`, `vite.config`, `eslint.config.js`, `index.html`), `.gitignore` 정리, `Layout`·`Navigation`·`fridge/Box`·`fridge/List` 등 기본 컴포넌트 뼈대
- 로고 파일과 `AGENTS.md`(작업 지침) 추가 (성시원)

## 2026-11-05 (수)

- `MainPage.jsx` 소폭 수정 (geon young Hwang)

## 2026-11-06 (목) — 냉장고·메인 화면 1차 구현

- fridgeO 로고 및 아이콘 추가 (성시원)
- **냉장고 재료 목록**: 박스형 UI와 소비기한 표시 구현 (성시원)
- 사이트 진입 시 유통기한 임박순으로 정렬 (성시원)
- **메인 페이지 디자인 구현**: 메인용 이미지 에셋(재료·아이콘 등) 추가, `.claude/launch.json` 추가 (geon young Hwang)

## 2026-11-08 (토)

- md 파일 정리 (성시원)

## 2026-11-09 (일) — 페이지 대량 추가, 팀 병합

- **마이페이지** 초기 구현(`MyPage.jsx`), 라우터 연결 (mimimiqqq)
- 마이페이지 외 수정, 오후에 네비게이션 추가 (mimimiqqq)
- 메인: 알림(bell) 오류 수정, 메인 페이지 정리 (geon young Hwang)
- **로딩 페이지 구현, 알림창 일부 구현, 메인 버튼 연결** (geon young Hwang)
- 알림 화면 스타일(`Notification.css`)·레이아웃 보완 (geon young Hwang)
- 냉장고 재료 검색창 볼드 처리 + 네비게이션 연결, 사진–재료 정보 간격 조정 (성시원)
- 아이콘 스킬(`.agents/skills/lucian-icons`) 추가 (geon young Hwang)
- 뒤로가기 버튼, 로고 화면, 검색창 수정 (mimimiqqq)
- 재료 편집 화면 수정, 유통기한 박스 크기 확대 (mimimiqqq)
- **냉장고 재료 편집하기·삭제하기 버튼 구현** 및 오류·파일 충돌 수정 (성시원)
- **레시피 화면**: 카테고리 아이콘·상세 이미지 에셋 추가, 레시피 화면 수정 (soonbub99)
- README 수정 (geon young Hwang)

## 2026-11-10 (월) — 리뷰·북마크·서버·로그인

- 재료 추가 완료 이중창 수정, 메뉴 클릭 시 냉장고/레시피로 이동 (mimimiqqq)
- **북마크** 페이지(`BookMark.jsx`) 생성 및 라우터 연결, 작업 진행 (mimimiqqq)
- **리뷰 작성 페이지** 추가 및 레시피 상세 연결 (soonbub99)
  - 레시피 상세 사진 아래 "리뷰 작성하기" 버튼
  - 첨부하기 제거, 편집·삭제 버튼 추가, 입력창 개선
  - 뒤로가기 버튼 클릭 안 되던 문제 수정, 버튼 크기 확대
  - 레시피 상세 사진 아래 왼쪽에 북마크 추가
- **서버 구조 재구축**: DB 스키마(`db/schema.sql`), 서버 문제 해결 문서(`TROUBLESHOOTING-server.md`) 추가 (geon young Hwang)
- 재료 등록·편집 화면에 캘린더 추가, 사과 등 아이콘 제거 (mimimiqqq)
- 프로필 사진 아이콘 추가 및 프로필 사진 저장 (mimimiqqq)
- **로그인 구축 완료**: 서버(`server/index.js`), 로그인·회원가입·아이디/비밀번호 찾기 화면, `.env.example` (geon young Hwang)

## 2026-11-11 (화) — DB 연동 본격화

- **로그인/인증 구현**: 문자 인증(OTP) 웹훅(`server/otpWebhook.js`)과 테스트, 회원가입·아이디/비밀번호 찾기 연동 (geon young Hwang)
- **레시피 서버 연결 완료**: 레시피 목록·상세 화면 수정 및 API 연동 (geon young Hwang)
- 레시피 목록/상세·헤더 보완, 서버 API 추가 (geon young Hwang)
- 레시피 상세: 병합 때 빠진 DB 연동·쿠팡 탭·Enter 검색 복구 (북마크·리뷰 버튼 유지) (geon young Hwang)
- 리뷰 수정 기능 서버 연결, 레시피 상세 보완 (geon young Hwang)
- **냉장고 DB 연동**: 냉장고·재료 등록·재료 편집 화면을 서버 API로 전환, 안 쓰는 유틸(`fridgeEdit.js`) 정리 (geon young Hwang)
- **알림 기능**: DB 스키마·서버 API·레이아웃·알림 화면 연동 (geon young Hwang)
- 레시피 상세·리뷰 작성 화면 대규모 수정, 라우터 정리 (geon young Hwang)
- **마이페이지**: 프로필 사진 변경, 북마크·팔로우 DB 현황, 최근 본 레시피 (geon young Hwang)

## 2026-11-12 (수) — 마이페이지 완성, 검색, 구조 정리

**기능**
- 마이페이지: 유통기한 임박(5일 이하) 재료 DB 연동, 누르면 냉장고로 이동
- 마이페이지: 개인정보 관리 화면(비밀번호 확인 후 보기 전용)
- 마이페이지: 알림 설정(유통기한 임박 알림 켜기/끄기, `users.expiry_alert`), 동의/약관 화면
- **통합 검색**(`/search`): 레시피 + 내 냉장고 재료 함께 검색
- 메인: 냉장고 상태 카드 DB 연동(임박·지남·다 떨어짐·가장 급한 재료, 새 아이콘), 조미료 아이콘 누르면 냉장고 필터링
- 메인 추천: 내 냉장고 재료 기반 추천 레시피 5개 가로 스크롤, 누르면 레시피 상세로
- 메인 검색창을 `MainSearch` 컴포넌트로 분리, 안 쓰는 이미지(bell·eggs·milk 등) 삭제
- **내 북마크 페이지**(`/bookmark`) 완성: 목록·카드 분리, 북마크 해제, 마이페이지에서 전체 보기 연결
- 메인 냉장고 카드: 로그아웃·불러오는 중·실패 상태에도 상단 문구 표시

**구조 정리 (리팩터링)**
- `Search.jsx`를 `src/pages` → `src/components`로 이동
- 마이페이지: 스타일 `styles/MyPage.css`, 영역별 기능 `components/MyPage`로 분리
- 레시피 목록·상세: `components/Recipe`로 분리 후 화면별 폴더(List · Detail · Review · Bookmark)로 묶음
- 레시피 상세: 준비물 체크를 내 냉장고(DB) 기준으로 수정
- 내 냉장고: `components/fridge`로 분리
- 재료 등록·편집: 스타일 `styles/Ingredient.css`, 입력 칸 `components/Ingredient`로 분리·공유, 역할별 폴더(Fields · Frame)로 묶음

**기타**
- `.env` 파일이 한 번 커밋되었다가 추적 해제됨 (geon young Hwang)

---

## 현재 진행 중 (커밋 전)

- `src/pages/MainPage.jsx` 수정 중
