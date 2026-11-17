# src 코드 따라가기

기능 하나를 따라갈 때는 항상 이 순서로 보면 됩니다.

1. **주소** → `router.jsx` 에서 어떤 화면인지 찾는다
2. **화면 고르기** → `pages/Responsive.jsx` 가 폭 1024px 이상이면 `pages/desktop/`, 아니면 `pages/mobile/` 화면을 그림 (`hooks/useIsDesktop.js`)
3. **화면** → `pages/{mobile,desktop}/*.jsx` 는 모양만 그림. 데이터·저장은 아래 훅을 부름
4. **훅** → `hooks/use*.js` 가 상태와 서버 호출을 맡음 (모바일·데스크탑이 같은 훅을 씀)
5. **서버 호출** → `api/*.js` 의 함수(예: `getRecipe(id)`, 내부는 `api/client.js` 의 `apiFetch`) → `server/routes/*.js` 의 같은 이름 파일 (`api/recipes.js` ↔ `server/routes/recipes.js`)

모든 화면은 `components/Layout.jsx` 안에 그려짐: 처음 2초 로딩 화면, 알림(종 빨간 점) 상태, 데스크탑 헤더(`components/desktop/DesktopHeader.jsx`), 모바일 하단 바(`components/mobile/Navigation.jsx`).

## 주소별 흐름

| 주소 | 화면 (mobile / desktop) | 훅 (hooks) | 서버 API |
|---|---|---|---|
| `/` | `MainPage` (데스크탑 대시보드는 `components/desktop/MainPage/FridgeDashboard`) | — (`components/mobile/MainPage/*` 가 직접 호출) | `/api/fridge/summary`, `/api/fridge/condiments`, `/api/recipes/recommend` |
| `/fridge` 🔒 | `Fridge` | `useIngredientPages` | `GET /api/ingredients` (sort·q·category·storage·status), `PATCH`/`DELETE /api/ingredients/:id` |
| `/ingredient` 🔒 | `Ingredient` | `useIngredientForm` | `POST /api/ingredients`, `/api/ingredient-catalog` |
| `/ingredient/edit/:id` 🔒 | `IngredientEdit` | `useIngredientEditForm` | `GET`/`PATCH`/`DELETE /api/ingredients/:id` |
| `/recipe` | `RecipeList` | `useRecipeListState`, `useRecipePages` | `/api/categories`, `/api/recipes` (cursor·category·q) |
| `/recipe/:id` | `RecipeDetail` | `useRecipeDetail`, `useRecipeBookmark`, `useAuthorFollow` | `/api/recipes/:id`, `/api/recipes/:id/reviews`, `PUT`/`DELETE …/bookmark`, `…/follow` |
| `/recipe/:id/review` 🔒 | `ReviewWrite` | `useReviewForm` | `GET`/`PUT`/`DELETE /api/recipes/:id/review` |
| `/recipe/new`, `/recipe/:id/edit` 🔒 | `RecipeWrite` | `useRecipeForm` | `POST /api/recipes`, `PUT`/`DELETE /api/recipes/:id`, `POST /api/images` (`api/images.js`) |
| `/mypage` 🔒 | `MyPage` | `useMyRecipes` | `/api/me`, `/api/me/recipes`, `/api/me/bookmarks`, `/api/me/follows` |
| `/bookmark` 🔒 | `BookMark` | `useBookmarks` | `/api/me/bookmarks`, `DELETE /api/recipes/:id/bookmark` |
| `/mypage/privacy` 🔒 | `PrivacyInfo` | `usePrivacyInfo` | Neon Auth (비밀번호 확인·휴대폰 인증), `PATCH /api/me` |
| `/mypage/settings` 🔒 | `Settings` | `useExpiryAlertSetting` | `/api/me`, `PATCH /api/me/settings` |
| `/notification` | `Notification` | `Layout.jsx` 의 알림 상태 (Outlet context) | `/api/notifications`, `…/read`, `DELETE` |
| `/search?q=` | `components/mobile/Search` / `pages/desktop/Search` | `useUnifiedSearch` | `/api/recipes?q=`, `/api/ingredients?q=` |
| `/login` | `Login` | `useLogin` | Neon Auth 로그인, `POST /api/me` |
| `/signup`, `/find-id-password` | `Sign_up`, `Find_ID_Password` (데스크탑은 `AuthFrame` 이 모바일 양식을 감쌈) | — (화면 안에서 Neon Auth 호출) | Neon Auth, `POST /api/signup/check-email` (가입 1단계 이메일 중복 확인) |

🔒 = 로그인 필요 (`router.jsx` 의 `requireLogin` 이 로그인 화면으로 보냄)

## 폴더

- `pages/mobile`, `pages/desktop` — 주소 하나당 화면 하나
- `components/mobile`, `components/desktop` — 화면을 나눈 조각. 데스크탑이 모바일 조각을 가져다 쓰기도 함 (예: 준비물 체크리스트)
- `styles/mobile`, `styles/desktop` — 화면별 CSS. 데스크탑 CSS 는 1024px 이상에서만 쓰임
- `api` — 우리 서버 API 호출 함수. 파일은 `server/routes/` 와 1:1 (`client.js`: 공통 `apiFetch`)
- `hooks` — 화면별 상태 훅 (`use*.js`). 서버 호출은 `api/` 함수를 씀
- `utils` — Neon Auth 로그인(`auth.js`)·날짜 계산(`date.js`: D-day 배지)·약관 문구
- `vendor/lucian-icons` — 아이콘 (손대지 않음)
- `assets` — 그림 파일
