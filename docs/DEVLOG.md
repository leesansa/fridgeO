# fridgeO 개발 일지

> Git 커밋 기록(2026-11-04 ~ 2026-11-17)을 바탕으로 날짜별로 정리했습니다.
> 메시지가 짧은 커밋(`.`, `fix`, `추가` 등)은 바뀐 파일을 보고 내용을 적었습니다. 병합(Merge) 커밋은 생략했습니다.

**참여자**: geon young Hwang, 성시원 Seong Siwon, mimimiqqq, soonbub99

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

**오후 작업** (geon young Hwang)
- 문서: 개발 일지(`DEVLOG.md`)와 프론트엔드 트러블슈팅(`TROUBLESHOOTING-frontend.md`, 문제 13건) 추가
- 로고 변경 (`index.html`, 헤더)
- **재료 사전**: 재료 등록·편집에서 이름 자동완성 + 유통기한 기본값, 사진 없는 재료는 이름 첫 글자 표시
- **레시피 작성·수정·삭제** (`/recipe/new`, `/recipe/:id/edit`)
  - 대표 사진, 분류·인분·시간·난이도, 재료(자동완성), 단계별 사진
  - 수정·삭제는 작성자만 (서버에서 확인), 상세에 "레시피 수정" 버튼
  - 마이페이지 "내가 쓴 레시피": 보기·수정·삭제
  - `POST /api/images`: 사진을 **Cloudflare R2**에 업로드, 레시피 삭제 시 사진도 삭제
- `.env.example` 추가·수정 (R2 설정 안내)

## 2026-11-13 (금) — 조미료, 팔로우, 개인정보 변경

(geon young Hwang)
- 레시피 목록: 동그란 + 버튼을 "레시피 추가" 글자 버튼으로 변경
- 재료 등록: 입력창 아래 사과·달걀·대파·우유 빠른 버튼 삭제
- 헤더·레시피 작성·리뷰 작성: 로고 누르면 홈으로 이동
- 개인정보 관리: **닉네임 변경, 인증번호 확인 후 휴대폰 번호 변경** (`PATCH /api/me`)
- 메인: 재료 추가 + 버튼을 냉장고 화면과 같은 크기·위치로
- **조미료**
  - 재료 사전에 `category` 칸 추가, 새 조미료 50가지와 아이콘(`public/condiments`)
  - 메인 "내 조미료들": 내 냉장고의 조미료만 표시 (없으면 숨김), 누르면 냉장고에서 그 조미료만
  - 냉장고: 조미료만 보기 버튼
- **레시피 상세: 작성자 닉네임 옆 팔로우 아이콘** (`PUT/DELETE /api/recipes/:id/follow`)
- `.env.example` 삭제 — R2 비밀 키가 실제 값으로 올라가 있었음 (트러블슈팅 14번: 키 교체 필요)
- 문서: 프론트엔드 트러블슈팅 14~18번 추가

---

## 2026-11-16 (월) — 데스크탑 버전 전체 화면, 모바일/데스크탑 구조 분리

**기능: 데스크탑 화면 (폭 1024px 이상)** (geon young Hwang)
- **공통 헤더**: 로고·검색창·마이페이지·냉장고·알림 아이콘 + 홈 / 레시피 / 냉장고 / 내 레시피 관리 탭. 데스크탑에선 모바일 하단 바 숨김
- **전체 카테고리**: 누르면 레시피 분류가 세로로 펼쳐짐 (lucian-icons 051 menu 아이콘), 고르면 `/recipe?category=`
- **메인**: 냉장고 대시보드 (급한 재료 표 + 다 먹었어요, 냉장고 재료로 만들 수 있는 레시피, 이번 주 유통기한 달력), 카드 줄 옆 재료 추가 버튼
- **냉장고**: 냉장·냉동·실온 세 칸 + 상태 필터 + 상세 패널(등록일·보관 기간 막대·이 재료로 만들 레시피). **카드를 다른 칸으로 끌어다 놓으면 보관 장소 변경**
- **재료 등록·편집**: 단위 고르기, 유통기한 빠른 선택, 냉장고 카드 미리보기, 저장하고 계속 추가(등록), 바뀌는 내용 비교·다 떨어졌어요·삭제(편집)
- **레시피**: 목록(분류 한 번에, 4열 카드, 최근 본 레시피), 상세(큰 사진 + 요약, 따라오는 준비물, 같은 분류 레시피), 작성·수정, 리뷰 작성
- **마이페이지·북마크·알림·검색**: 한 화면에 모두 보기, 북마크 안에서 찾기·정렬, 알림 종류별 거르기·새 알림 표시, 검색어 표시
- **계정**: 개인정보 관리·알림 설정(계정 메뉴), 로그인(서비스 소개 + 로그인 카드), 회원가입·계정 찾기(로그인과 같은 틀에 모바일 양식)

**서버**
- `GET /api/ingredients`: 보관 장소(`storage`)·상태(`status`: 임박·지남·다 떨어짐) 필터, 등록일(`created_at`)·전체 개수(`total`) 추가
- `GET /api/fridge/summary`: 급한 재료 목록(`soon`) 추가

**구조 정리 (리팩터링)**
- `src/components` · `pages` · `styles`를 `mobile/` · `desktop/`으로 나눔. 주소마다 `pages/Responsive.jsx`가 폭에 맞는 화면을 고름
- 모바일 화면의 데이터·저장 로직을 `utils/use*.js` 훅으로 떼어 모바일·데스크탑이 같이 씀
- `src/README.md`: 주소 → 화면 → 훅 → 서버 API 흐름표
- 안 쓰던 `utils/fridgeData.js`, 동작 없는 재료 편집 하단 바(`EditBottomNav`) 삭제

**병합**
- main에 먼저 올라온 레시피 작성자 팔로우 아이콘을 병합. 옮긴 파일의 import 경로가 깨져 빌드가 안 되던 문제를 고치고, 팔로우를 `FollowButton`으로 묶어 데스크탑 상세에도 표시
- `leesansa` → `main` 병합 (`70b04ad`)

**문서·디자인**
- `TROUBLESHOOTING-frontend.md`: 데스크탑 작업 중 문제 19~28번, 정리와 의견
- `PROJECT_PLAN.md` 추가
- Figma: 데스크탑 메인페이지·냉장고 프레임을 구현 화면과 같게 갱신 (레시피 프레임은 Figma 호출 한도로 미완료)
- 코드 리뷰: 요청이 거치는 순서(주소 → 화면 → 훅 → API 서버 → DB)대로 구조 설명, 개선할 점 정리 (폭 1024px을 넘나들면 쓰던 입력이 사라짐, 페이지 이동마다 알림 GET 이 DB 에 씀, 고정 2초 로딩, 재료 PATCH 덮어쓰기)

**추가 수정 (오후)**
- **냉장고 필터를 전체 · 이름순 · 임박 · 지남 · 조미료로 통일 (기본 유통기한순)**
  - 데스크탑: 다 떨어짐 대신 이름순 정렬 토글 (임박·지남·조미료와 같이 켤 수 있음)
  - 모바일: 기존 탭 디자인 그대로 5개 탭(하나만 고름), 툴바의 조미료 버튼을 탭으로 옮기고 보관 장소순 탭은 뺌
- **모바일 재료 등록**: 유통기한 카드 아래에 3일 · 7일 · 14일 · 한 달 · 기한 없음 빠른 선택 (데스크탑과 같은 모양, 기한 없음은 유통기한 없이 저장)
- **데스크탑 메인**: "내 조미료들 한눈에 보기"·더보기 글자(8px → 16·14px)와 화살표(15 → 20px)를 키우고 칸 높이 고정을 풂
- 모바일 냉장고 필터에서 임박 탭 삭제 → 전체 · 이름순 · 지남 · 조미료 4개 탭
- 문서: 프론트엔드 트러블슈팅 29~31번 추가, 남은 일에 코드 리뷰 개선점

## 2026-11-17 (화) — 서버 Hono 전환, API·React Query 분리, 배포

(geon young Hwang)

**서버**
- **서버를 Hono 프레임워크로 변경**, 폴더 구조 정리(`server/routes`, `server/lib`, `server/middleware`, `server/db`)
- **Drizzle** 반영: `server/db/schema.ts`, 마이그레이션(`server/db/migrations`), 옛 SQL 스키마는 `server/db/archive`로
- 조미료 스크립트를 `server/db/seeds`로 이동

**회원가입**
- 가입을 1·2단계로 나눔: 1단계 이메일 중복 확인(`POST /api/signup/check-email`), 2단계 휴대폰 번호 등록
- 2단계를 안 마친 계정을 어느 페이지에서든 가입 화면으로 강제 이동시키던 문제 → 강제 이동 제거

**프론트 구조 정리**
- 훅을 `src/utils` → `src/hooks`로 분리, import 경로 수정, 무한 스크롤 공통 훅(`useInfiniteScroll`)
- 서버 호출을 `src/api`(client · ingredients · me · notifications · recipes · reviews · signup · images)로 분리
- **React Query** 도입: 데이터 불러오기를 `src/queries`로 분리
- 필요 없어진 훅 삭제 (`useAuthorFollow`, `useBookmarks`, `useExpiryAlertSetting`, `useMyRecipes`, `useRecipeDetail`)

**배포**
- GitHub Actions(`.github/workflows/deploy.yml`): main에 올리면 lint·test 후 **Cloudflare Worker(서버)·Cloudflare Pages(웹)** 배포
- 배포 설정 오류 수정: `.env.production`(공개 주소만), `vite.config.js`

**문서**
- 문서를 `docs/`로 이동 (`DEVLOG`, `PROJECT_PLAN`, `TROUBLESHOOTING-*`, `DB.md`)
- 프론트엔드·서버 트러블슈팅 최신화
