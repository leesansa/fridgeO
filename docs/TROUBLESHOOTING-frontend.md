# 트러블슈팅: 프론트엔드 · 협업(Git)

fridgeO React(Vite) 화면을 만들고 팀원 브랜치를 병합하면서 겪은 문제와 고친 방법을 정리한 문서입니다.
크롤링·DB·API 서버 문제는 [TROUBLESHOOTING-server.md](TROUBLESHOOTING-server.md)에 따로 있습니다.

| # | 문제 | 원인 | 해결 |
|---|---|---|---|
| 1 | 다른 팀원 PC에서 아이콘 import 오류 (bell) | `src/vendor/lucian-icons/`가 `.gitignore`에 들어 있어 아이콘 파일이 올라가지 않음 | 제외 규칙을 풀고 `runtime.js`·`bell.js` 등 커밋 |
| 2 | ESLint `'bell' is assigned a value but never used` | 아이콘을 바꾼 뒤 옛 `bell` 이미지 변수가 남음 | 안 쓰는 변수 삭제 |
| 3 | 병합 충돌 표시(`<<<<<<<`)가 그대로 커밋됨 | stash 적용 중 충돌을 정리하지 않고 커밋 | 충돌 표시 제거 후 다시 커밋 |
| 4 | `.env`(DB 비밀번호)가 GitHub에 올라감 | `.env`를 직접 만들어 커밋 | `git rm --cached .env`, `.env.example`만 유지 |
| 5 | 병합 후 레시피 상세의 DB 연동·쿠팡 탭·Enter 검색이 사라짐 | 브랜치 병합 때 한쪽 변경만 남김 | 빠진 기능을 복구하고 북마크·리뷰 버튼은 유지 |
| 6 | 재료 등록 화면에 하단 바가 두 개 | 페이지 안에 하단 바를 따로 그림 + 공통 레이아웃 하단 바 | 페이지의 하단 바 삭제, 아래 여백만 확보 |
| 7 | 리뷰 작성 화면 뒤로가기 버튼이 눌리지 않음 | 전체 너비 제목이 버튼 위를 덮음 | 제목 `pointer-events: none`, 버튼 `z-index: 1` |
| 8 | 레시피 준비물 "준비됐어요"가 누구에게나 똑같이 체크됨 | 고정 데모 목록(`utils/fridgeData`)을 기준으로 체크 | 내 냉장고(DB)의 `in_fridge` 값으로 체크 |
| 9 | 메인 냉장고 카드가 "불러오는 중…"에서 멈춤 | 요약 요청이 실패해도 화면에 실패 상태가 없음 | `failed` 상태 추가, "오류 / 불러오지 못했어요" 표시 |
| 10 | 다 떨어진 재료를 표시할 수 없음 | 편집 화면이 수량 0을 막음 | 수량 0 허용 (0 = 다 떨어짐) |
| 11 | 레시피 목록이 그림 파일을 전부 불러옴 | `import.meta.glob`으로 `assets/recipe` PNG 전체 import | 쓰는 분류 그림 5개만 import |
| 12 | 등록 화면과 냉장고 화면 CSS가 섞임 | 둘 다 `ingredient-*` 클래스 사용 | 등록·편집 공통 클래스를 `ingredient-form-*`으로 분리 |
| 13 | 편집 화면 파일 이름이 `Ingredient copy.jsx` | 등록 화면을 복사해서 만듦 | `IngredientEdit.jsx`로 이름 변경, 라우터 연결 |
| 14 | `.env.example`에 R2 비밀 키가 실제 값으로 올라감 | 예시 파일에 실제 값을 채워 커밋 | 파일 삭제 (**남은 일**: 키 교체, 빈 예시 파일 복구) |
| 15 | 냉장고에서 사진 없는 재료 칸이 비어 보임 | DB 재료에는 없는 `item.emoji`를 표시 | 이름 첫 글자(`item.name[0]`) 표시 |
| 16 | 재료 등록 유통기한이 항상 오늘 + 7일 | 기본값이 고정 7일 | 재료 사전의 `shelf_life_days`로 기본값 계산 |
| 17 | 메인 "내 조미료들"이 냉장고와 상관없이 항상 같은 6개 | Figma 기준 고정 데이터 | 내 냉장고의 조미료만 DB에서 불러옴, 없으면 숨김 |
| 18 | 조미료만 보기로 들어왔는데 끌 버튼이 없을 수 있음 | 조미료가 없으면 버튼을 숨기도록 함 | 켜진 채 들어왔으면 버튼 유지 |
| 19 | 데스크탑에서 "전체 카테고리"를 넣자 앱 전체가 오류 화면으로 멈춤 | React 19가 아이콘(`<lucian-menu>`)의 `state`를 프로퍼티로 넣으려 함 (읽기 전용) | `ref`로 받아 `setState()` 호출 |
| 20 | lucian-icons 설치 명령이 "Runtime integrity check failed" | git이 아이콘 원본을 CRLF 줄바꿈으로 받아 해시가 달라짐 | LF로 맞춰 해시를 대조한 뒤 `menu.js` 직접 복사 |
| 21 | 데스크탑 CSS가 모바일 CSS를 못 덮어쓸 위험 | 같은 선택자를 두 파일이 정의 → 불러오는 순서에 따라 결과가 달라짐 | 데스크탑 CSS를 모바일 뒤에 import, 빌드 결과에서 순서 확인 |
| 22 | 데스크탑 급한 재료 표의 줄이 어긋남 | `<td>`에 `display: flex`를 줘서 표 칸이 아니게 됨 | `<td>` 안의 `<span>`에 flex |
| 23 | 레시피 작성 오른쪽 칸의 저장 버튼이 화면 밖에 걸림 | 따라오는(sticky) 칸이 창보다 높음 | 칸 높이를 창에 맞추고 칸 안에서만 스크롤 |
| 24 | 검색 결과 제목 `'두부'`의 따옴표가 벌어짐 | 제목의 flex `gap`이 글자 조각 사이에도 들어감 | 제목 글자를 `<span>` 하나로 묶음 |
| 25 | ESLint `react-hooks/set-state-in-effect` (알림센터) | effect 안에서 바로 `setState` | 렌더 중 "값이 바뀌면 맞추기" 방식으로 변경 |
| 26 | main 병합 후 빌드 실패 (`DetailInfo.jsx` import 오류) | main의 팔로우 수정이 `mobile/`로 옮긴 파일에 옛 상대 경로로 들어옴 | 경로 수정 + 팔로우를 `useAuthorFollow`·`FollowButton`으로 공통화 |
| 27 | 데스크탑 레시피 상세에 팔로우 버튼이 없음 | 데스크탑 상세는 `DetailInfo`를 쓰지 않음 | `FollowButton`을 데스크탑 `DetailSummary`에도 넣음 |
| 28 | 미리보기에서 냉장고 칸·레시피 목록이 빈 채로 멈춤 | 브라우저 창이 가려져 있으면 무한 스크롤(IntersectionObserver)이 안 불림 | 코드 문제 아님. 창을 보이게 하면 정상 (테스트할 때만 주의) |
| 29 | 데스크탑 메인 "내 조미료들" 제목·더보기 글자가 안 보일 만큼 작음 | 모바일의 8px 글자와 고정 높이를 그대로 씀 | 1024px 이상에서 16·14px, 화살표 20px, 높이 고정 해제 |
| 30 | 냉장고 거르기가 모바일·데스크탑에서 서로 다름 | 모바일은 정렬 탭 + 조미료 버튼, 데스크탑은 상태 거르기 | 전체·이름순·지남·조미료로 맞춤 (모바일은 임박 제외). 탭 수를 바꿀 땐 CSS 칸 수도 같이 |
| 31 | 유통기한 "기한 없음"을 눌러도 기본값으로 돌아갈 위험 | "고르지 않음"(`null`)과 "기한 없음"을 구분해야 함 | 기한 없음은 `""`로 두고 `??`로 기본값 계산, 저장할 때만 `null` |
| 32 | 배포 사이트가 "Unexpected Application Error (reading 'id')"로 멈춤 | GitHub Actions 빌드에 `VITE_NEON_AUTH_URL`이 없음 (Git에 안 올라가는 `.env`에만 있었음) | `.env.production`에 추가, 빠지면 빌드가 멈추게 `vite.config.js`에서 검사 |
| 33 | GitHub Actions에서 ESLint `'process' is not defined` (`vite.config.js`) | 설정 파일을 브라우저 코드 기준으로 검사 | `import process from 'node:process'` |
| 34 | 사이트에 들어가자마자 회원가입 화면이 뜸 | 휴대폰 번호 없는 계정을 어느 페이지에서든 가입 2단계로 보내도록 함 | 강제 이동 삭제 |
| 35 | 로그아웃 상태에서 API를 부를 때마다 Neon Auth 요청이 하나씩 더 나감 | Neon SDK는 로그인 세션만 캐시함 | `useSession` 저장소가 로그아웃이면 묻지 않음, 401이면 세션을 새로 받아 한 번만 재시도 |
| 36 | 로그인·로그아웃해도 화면이 바로 안 바뀜 | 컴포넌트마다 `isLoggedIn()`을 따로 물어봄 | Neon React 어댑터의 `authClient.useSession()`으로 로그인 상태 공유 |
| 37 | 아이디 찾기를 하면 그 계정으로 로그인됐다가 로그아웃됨 | 휴대폰 인증(`verify`)이 세션을 만듦 | `disableSession: true`, 응답의 `user.email`만 사용 |
| 38 | 회원가입 1단계만 하고 나가면 번호 없는 계정이 남음 | 1단계에서 바로 가입 | 1단계 값은 화면에만 두고 "인증 요청" 때 가입, 이메일 중복은 1단계에서 서버로 확인 |
| 39 | 저장한 뒤 다른 화면이 예전 값을 보여 줌 / 같은 데이터를 화면마다 따로 받음 | 화면마다 `useEffect`로 따로 불러오고 저장 후 새로고침을 손으로 함 | React Query(`src/queries/`)로 캐시 공유, 저장 훅마다 다시 받을 캐시를 정함 |

---

## 1. 다른 팀원 PC에서 아이콘 import 오류 (bell)

**증상**
메인 화면을 받아 실행하면 Vite가 `MainPage.jsx`의 `import "../vendor/lucian-icons/bell.js"`를 찾지 못해 화면이 뜨지 않음 (bell 오류).

**원인**
`.gitignore`에 `src/vendor/lucian-icons/`가 들어 있어서, 아이콘을 만든 사람 PC에만 파일이 있고 GitHub에는 올라가지 않았다.
아이콘들이 공통으로 쓰는 `runtime.js`도 같은 이유로 빠져 있었다.

**해결**
- `.gitignore`의 lucian-icons 제외 줄을 주석 처리 (`188d8e1`)
- `runtime.js`, `LICENSE`, `bell.js`를 커밋 (`f94ae2c`, `188d8e1`)

**교훈**
`src/` 안에서 import 하는 파일은 Git에 있어야 한다. 새 파일을 추가했으면 `git status`로 올라가는지 확인하고, 제외된 이유가 궁금하면 `git check-ignore -v <파일>`로 확인한다.

---

## 2. ESLint `'bell' is assigned a value but never used`

**증상**
`npm run lint`에서 `MainPage.jsx`의 `bell` 변수 경고(오류).

**원인**
종 아이콘을 이미지(`images.bell`)에서 lucian-icons 컴포넌트로 바꾼 뒤, 구조 분해에서 `bell`을 지우지 않았다.

**해결** (`d9d2be2`)
```diff
- const { logo, search, add, bell } = images;
+ const { logo, search, add } = images;
```

---

## 3. 병합 충돌 표시(`<<<<<<<`)가 그대로 커밋됨

**증상**
`Fridge.jsx`, `components/fridge/Box.jsx`, `List.jsx`, `fridge.css`에 아래 줄이 남아 화면이 빌드되지 않음.
```
<<<<<<< Updated upstream
  const [mode, setMode] = useState(null);
=======
  const [isDeleteMode, setIsDeleteMode] = useState(false);
>>>>>>> Stashed changes
```

**원인**
`git stash pop`에서 충돌이 났는데, 충돌 표시를 정리하지 않은 채 커밋했다 (`8ab52fb`).

**해결** (`c063196`)
충돌 표시와 옛 코드(`isDeleteMode`, localStorage 저장 `useEffect`)를 지우고 새 코드(`mode`)만 남겼다.

**미리 막는 법**
커밋 전에 충돌 표시가 남았는지 검색한다.
```bash
git grep -n "^<<<<<<<\|^>>>>>>>"
```

---

## 4. `.env`(DB 비밀번호)가 GitHub에 올라감

**증상**
`99705e8 Create .env` 커밋으로 실제 접속 정보가 담긴 `.env`가 저장소에 들어감.

**원인**
`.gitignore`에 `.env`가 있어도, 직접 만들어 올리거나 이미 추적 중인 파일은 제외되지 않는다.

**해결** (`87602a0`)
```bash
git rm --cached .env
```
- 파일은 PC에 두고 추적만 해제
- 값 없는 `.env.example`만 Git에 유지

**남은 일**
이미 Git 기록에 비밀 값이 남아 있으므로, 올라갔던 DB 비밀번호·키는 새로 발급(교체)하는 것이 안전하다.

---

## 5. 병합 후 레시피 상세의 DB 연동·쿠팡 탭·Enter 검색이 사라짐

**증상**
`leesansa` 브랜치 병합 후 레시피 상세 화면이
- DB(`/api/recipes/:id`) 대신 예전 방식으로 데이터를 읽고
- 없는 재료 "쿠팡에서 담기"가 재료마다 탭을 열지 않고
- 헤더 검색창 Enter가 동작하지 않음

**원인**
같은 `RecipeDetail.jsx`를 두 브랜치에서 고쳤고, 병합 때 북마크·리뷰 버튼 쪽 변경만 남고 반대쪽 변경이 빠졌다.

**해결** (`651dcee`)
- `apiFetch`로 DB에서 레시피 읽기 복구
- 재료마다 쿠팡 검색 탭 열기 복구 (브라우저가 막은 탭 수 안내, `tab.opener = null`)
- Enter → 레시피 목록에서 검색 복구
- 북마크·리뷰 작성 버튼은 그대로 유지

---

## 6. 재료 등록 화면에 하단 바가 두 개

**증상**
`/ingredient` 화면 아래에 같은 모양의 하단 메뉴가 두 줄 겹쳐 보임 ("추가완료 이중창").

**원인**
공통 레이아웃이 이미 하단 바를 그리는데, `Ingredient.jsx` 안에도 하단 바(`styles.bottomNav`)를 따로 만들어 두었다.

**해결** (`053f598`)
- 페이지 안의 하단 바와 `bottomNav`·`navBtn` 스타일 삭제
- 공통 하단 바에 "추가완료" 버튼이 가리지 않도록 `paddingBottom: 68px`

---

## 7. 리뷰 작성 화면 뒤로가기 버튼이 눌리지 않음

**증상**
리뷰 작성 화면 왼쪽 위 뒤로가기 버튼을 눌러도 반응이 없음.

**원인**
가운데 정렬을 위해 제목(`h1`)이 헤더 전체 너비를 차지하고, 버튼 위에 겹쳐 클릭을 가로챘다.

**해결** (`700acb8`, `src/styles/review-write.css`)
```css
.review-header h1 { pointer-events: none; } /* 제목은 클릭을 받지 않음 */
.review-back      { z-index: 1; }           /* 버튼을 제목 위로 */
```

---

## 8. 레시피 준비물 "준비됐어요"가 누구에게나 똑같이 체크됨

**증상**
로그아웃 상태여도, 어떤 계정이어도 레시피 상세의 준비물 체크가 항상 같은 재료에 표시됨.

**원인**
체크 기준이 내 냉장고가 아니라 고정 데모 목록이었다.
```js
import { fridgeIngredients } from "../utils/fridgeData";
```

**해결** (`a856fac`)
- 데모 목록 import 삭제
- 레시피 상세 응답의 재료별 `in_fridge`(로그인 시 내 냉장고에 수량 > 0으로 있는지)로 체크
- 로그아웃이면 모두 체크 안 됨

---

## 9. 메인 냉장고 카드가 "불러오는 중…"에서 멈춤

**증상**
메인 "지금 확인해야할 내 재료들!" 카드 4개가 계속 "불러오는 중…"이고, 위쪽 상태 줄은 비어 있음.

**원인**
`GET /api/fridge/summary`가 실패하면 `console.error`만 하고, 화면은 `summary === null`을 "불러오는 중"으로만 해석했다.

**해결** (`8d69eed`, `src/components/MainPage/FridgeAlerts.jsx`)
```js
const PENDING = {
  loggedOut: { status: "로그인 필요", tone: "warn", desc: "로그인 후 확인" },
  error:     { status: "오류",       tone: "warn", desc: "불러오지 못했어요" },
  loading:   { status: "확인 중",    tone: "ok",   desc: "불러오는 중…" },
};
```
- 요청 실패 시 `setFailed(true)` → "오류" 표시
- 로그아웃·불러오는 중일 때도 상태 줄이 비지 않게 문구 표시

---

## 10. 다 떨어진 재료를 표시할 수 없음

**증상**
메인에 "다 떨어진 상품" 카드를 만들었는데, 편집 화면에서 수량을 0으로 저장할 수 없음.

**원인**
편집 화면 검사가 `amount <= 0`을 막고, `-` 버튼도 1 아래로 내려가지 않았다.

**해결** (`c5aa870`)
```diff
- if (!Number.isFinite(amount) || amount <= 0) {
-   alert("수량은 0보다 큰 숫자로 입력해 주세요.");
+ // 0 = 다 떨어짐 (지우지 않고 남겨 두면 메인 "다 떨어진 상품"에 표시)
+ if (!Number.isFinite(amount) || amount < 0) {
+   alert("수량은 0 이상의 숫자로 입력해 주세요.");
```
등록 화면은 그대로 1 이상만 허용한다.

---

## 11. 레시피 목록이 그림 파일을 전부 불러옴

**증상**
레시피 목록 화면을 열 때 `assets/recipe` 아래 모든 PNG가 번들에 포함됨.

**원인**
```js
import.meta.glob("../assets/recipe/**/*.png", { eager: true, import: "default" })
```
`eager: true`라 쓰지 않는 그림까지 한꺼번에 import 되었다.

**해결** (`c2237d6`)
분류 아이콘(`components/Recipe/List/CategoryIcon.jsx`)에서 실제로 쓰는 그림 5개만 import.

---

## 12. 등록 화면과 냉장고 화면 CSS가 섞임

**증상**
재료 등록 화면의 인라인 스타일을 `styles/` CSS 파일로 옮기려는데, 클래스 이름이 냉장고 화면과 겹침.

**원인**
냉장고 화면이 이미 `ingredient-*` 클래스를 쓰고 있어, 같은 이름을 쓰면 CSS 규칙이 서로 덮어쓴다.

**해결**
- 등록 화면 클래스를 `ingredient-add-*`로 분리 (`2b58584`)
- 편집 화면과 함께 쓰게 되면서 공통 이름 `ingredient-form-*`으로 변경, 편집에만 있는 부분은 `IngredientEdit.css` (`5b4e86d`)

---

## 13. 편집 화면 파일 이름이 `Ingredient copy.jsx`

**증상**
재료 편집 화면이 `src/pages/Ingredient copy.jsx`라는 복사본 이름으로 있음 (공백 포함, 라우터 연결 없음).

**해결** (`b76f66a`)
- `IngredientEdit.jsx`로 이름 변경
- `router.jsx`에 `/ingredient/edit/:id` 연결, 냉장고에서 재료를 누르면 이동

---

## 14. `.env.example`에 R2 비밀 키가 실제 값으로 올라감

**증상**
`f2b8629 Update .env.example` 커밋에서 빈칸이던 `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`에 실제 값이 들어가 GitHub에 올라감.

**원인**
`.gitignore`가 `!.env.example`로 예시 파일만 일부러 올리게 되어 있는데, 그 파일에 실제 값을 채웠다. `.env`(4번)와 달리 `.env.example`은 Git이 막아 주지 않는다.

**해결** (`8439300`)
`.env.example` 삭제.

**남은 일**
- 삭제해도 Git 기록(`f2b8629`)에는 값이 남는다. Cloudflare R2에서 **API 토큰을 삭제하고 새로 발급**한 뒤 `.env`에만 넣는다.
- 지금은 예시 파일이 없어 새 팀원이 어떤 키가 필요한지 알 수 없다. 값을 모두 비운 `.env.example`을 다시 올린다 (`fab7a4f` 버전이 빈 예시).
  ```bash
  git show fab7a4f:.env.example > .env.example
  ```

**미리 막는 법**
커밋 전에 예시 파일에 값이 들어갔는지 확인한다. `=` 뒤가 비어 있어야 한다 (`PORT=3001`처럼 비밀이 아닌 기본값은 예외).
```bash
git diff --cached .env.example
```

---

## 15. 냉장고에서 사진 없는 재료 칸이 비어 보임

**증상**
내 냉장고 목록·박스 보기에서 사진이 없는 재료는 그림 자리가 빈 칸으로 나옴.

**원인**
처음 데모 데이터에는 `emoji`가 있었지만, DB로 바꾼 뒤 재료에는 `emoji`가 없어 `item.emoji`가 항상 `undefined`였다.

**해결** (`eeff803`, `components/fridge/Box.jsx`, `List.jsx`, `styles/fridge.css`)
```diff
- <span>{item.emoji}</span>
+ <span>{item.name[0]}</span>
```
연한 초록 배경에 이름 첫 글자를 가운데 표시.

---

## 16. 재료 등록 유통기한이 항상 오늘 + 7일

**증상**
우유든 쌀이든 유통기한 기본값이 모두 오늘 + 7일.

**원인**
```js
const [expiryDate, setExpiryDate] = useState(() => addDays(today, 7));
```

**해결** (`eeff803`, `src/pages/Ingredient.jsx`)
- 재료 사전(`useIngredientCatalog`)에서 이름이 같은 재료의 `shelf_life_days`로 기본값 계산, 사전에 없으면 7일
- 사용자가 달력에서 고른 날짜(`pickedExpiry`)는 따로 저장해서, 고른 뒤에는 재료 이름을 바꿔도 덮어쓰지 않음
```js
const shelfLife = catalog.find((item) => item.name === ingredient.trim())?.shelf_life_days ?? 7;
const expiryDate = pickedExpiry ?? addDays(today, shelfLife);
```

---

## 17. 메인 "내 조미료들"이 냉장고와 상관없이 항상 같은 6개

**증상**
메인 화면 조미료 줄이 냉장고에 없어도 케첩·후추·소금·마요네즈·고추·허브를 항상 보여 줌. 누르면 냉장고에서 "검색한 재료가 없어요."

**원인**
Figma 화면을 옮기면서 만든 고정 데이터(`assets/main/*.png` 6개)를 그대로 썼다.

**해결** (`7793d5d`, `components/MainPage/Condiments.jsx`)
- `GET /api/fridge/condiments`로 내 냉장고의 조미료만 불러와 아이콘 + 이름 표시
- 하나도 없거나 로그아웃이면 영역을 숨김 (`return null`)
- 아이콘을 누르면 `/fridge?category=조미료&q=이름`, 더보기는 `/fridge?category=조미료`

---

## 18. 조미료만 보기로 들어왔는데 끌 버튼이 없을 수 있음

**상황**
냉장고 화면의 "조미료" 버튼은 내 조미료가 하나도 없으면 숨긴다. 그런데 조미료가 없는 상태에서 `/fridge?category=조미료` 주소로 바로 들어오면 (저장해 둔 주소, 뒤로가기 등), 필터는 켜진 채 버튼만 사라져 전체 보기로 돌아갈 수 없게 된다.

**해결** (`7793d5d`, `src/pages/Fridge.jsx`)
조미료가 있거나 **이미 켜져 있으면** 버튼을 보여 준다.
```jsx
onCondimentOnlyChange={hasCondiments || condimentOnly ? setCondimentOnly : undefined}
```

---

## 19. 데스크탑에서 "전체 카테고리"를 넣자 앱 전체가 오류 화면으로 멈춤

**증상** `Cannot set property state of #<LucianIcon> which has only a getter`

**원인**
React 19는 사용자 정의 태그(`<lucian-menu>`)에 준 값을 속성이 아니라 **프로퍼티**로 넣는다. lucian-icons의 `state`는 읽기 전용(getter)이라 `state={open ? "open" : "closed"}`처럼 주면 오류가 난다.

**해결** (`6c3e36b`, `src/components/desktop/CategoryMenu.jsx`)
`ref`로 아이콘을 받아 아이콘이 제공하는 `setState()`로 바꾼다. (북마크 아이콘은 같은 이유로 `setAttribute("state", …)`를 씀)
```jsx
useEffect(() => { iconRef.current.setState(open ? "open" : "closed"); }, [open]);
<lucian-menu size="22" ref={iconRef} />
```

---

## 20. lucian-icons 설치 명령이 "Runtime integrity check failed"

**원인**
Windows git(`core.autocrlf`)이 `.agents/skills/lucian-icons/code/*.js`를 CRLF로 받아서, 설치 명령이 계산한 해시가 카탈로그 값과 달라졌다. 파일 내용은 같다.

**해결** (`6c3e36b`)
줄바꿈을 LF로 맞춰 해시를 카탈로그(`catalog.json`)와 대조해 같은 것을 확인한 뒤 `menu.js`만 `src/vendor/lucian-icons/`에 복사. `runtime.js`는 이미 있던 것과 바이트까지 같아서 그대로 둠.
```bash
tr -d '\r' < .agents/skills/lucian-icons/code/menu.js | sha256sum
```

---

## 21. 데스크탑 CSS가 모바일 CSS를 못 덮어쓸 위험

**원인**
데스크탑 화면도 모바일 클래스(`.main-page`, `.main-nav` 등)를 그대로 쓰고 1024px 이상에서만 값을 바꾼다. 같은 우선순위의 선택자는 **나중에 불러온 CSS가 이긴다**.

**해결** (`6c3e36b`)
- `pages/mobile/MainPage.jsx`: `styles/mobile/MainPage.css` 다음 줄에 `styles/desktop/MainPage.css` import (순서를 바꾸지 말 것)
- 하단 바 숨기기(`.main-nav { display: none }`)는 `styles/desktop/DesktopHeader.css`에 두고, `Layout.jsx`에서 `Navigation` 다음에 `DesktopHeader`를 import
- 빌드 결과 CSS에서 모바일 규칙이 데스크탑 규칙보다 앞에 오는 것을 확인

---

## 22. 데스크탑 급한 재료 표의 줄이 어긋남

**원인** `<td className="dash-name">`에 `display: flex`를 주면 그 칸이 표 칸(table-cell)이 아니게 되어 줄 구분선과 높이가 어긋난다.

**해결** (`6c3e36b`, `components/desktop/MainPage/FridgeDashboard.jsx`) `<td>`는 그대로 두고 안쪽 `<span className="dash-name">`에 flex.

---

## 23. 레시피 작성 오른쪽 칸의 저장 버튼이 화면 밖에 걸림

**원인** 오른쪽 칸(대표 사진·요리 정보·저장)이 `position: sticky`인데 창 높이(900px)보다 길어서, 아래쪽 버튼이 본문 끝까지 스크롤하기 전에는 보이지 않았다.

**해결** (`6c3e36b`, `styles/desktop/recipe-write.css`)
```css
.dwrite-side { max-height: calc(100dvh - 174px); overflow-y: auto; }
```

---

## 24. 검색 결과 제목 `'두부'`의 따옴표가 벌어짐

**원인** `<h1>`이 `display: flex; gap: 14px`라서 `'`, `<em>두부</em>`, `' 검색 결과`가 각각 flex 항목이 되어 사이가 벌어짐.

**해결** (`6c3e36b`, `pages/desktop/Search.jsx`) 제목 글자를 `<span className="dsearch-q">` 하나로 묶고, 개수 표시만 따로 둠.

---

## 25. ESLint `react-hooks/set-state-in-effect` (알림센터)

**원인** 알림센터를 열면 바로 읽음 처리되므로, 열 때 안 읽었던 알림을 "새 알림"으로 기억하려고 effect 안에서 `setFresh(...)`를 부름 → eslint-plugin-react-hooks v7이 오류로 막음.

**해결** (`6c3e36b`, `pages/desktop/Notification.jsx`) 렌더 중에 "안 읽은 목록이 바뀌었으면 state를 맞추기" 방식(React 문서 권장)으로 변경. 알림 id는 DB에서 문자열로 오므로 `Number()`로 바꾸지 않음.

---

## 26. main 병합 후 빌드 실패 (`DetailInfo.jsx` import 오류)

**증상** `Could not resolve '../../../utils/auth.js' in src/components/mobile/Recipe/Detail/DetailInfo.jsx`

**원인**
이번 작업에서 `src/components/Recipe/...`를 `src/components/mobile/Recipe/...`로 옮겼는데, 그 사이 main에 올라온 팔로우 버튼 수정(`22131d6`)이 옛 파일을 고쳤다. git은 이름 바뀐 파일로 수정을 옮겨 주지만, **파일 안의 상대 경로(`../../../`)는 고쳐 주지 않는다**. 충돌 표시가 없어서 빌드해 보기 전에는 모른다.

**해결** (`0ea409d`)
- 팔로우 로직을 `utils/useAuthorFollow.js`, 버튼을 `components/mobile/Recipe/Detail/FollowButton.jsx`로 떼어 경로 문제를 없앰
- 병합한 뒤에는 꼭 `npm run build`까지 돌려 볼 것

---

## 27. 데스크탑 레시피 상세에 팔로우 버튼이 없음

**원인** 데스크탑 상세는 사진 옆 요약 카드(`components/desktop/recipe/DetailSummary.jsx`)를 쓰고 모바일 `DetailInfo`를 쓰지 않는다. 모바일에만 기능을 넣으면 데스크탑에선 빠진다.

**해결** (`0ea409d`) `FollowButton`을 `DetailSummary`에도 넣음. → 모바일 화면에 기능을 더할 때는 **같은 주소의 `pages/desktop/` 화면에도 들어가는지** 확인할 것 (`src/README.md`의 표 참고).

---

## 28. 미리보기에서 냉장고 칸·레시피 목록이 빈 채로 멈춤

**원인** 무한 스크롤은 목록 끝의 빈 칸이 화면에 보일 때(`IntersectionObserver`) 다음 페이지를 부른다. 개발 도구의 미리보기 창이 가려져 있으면 브라우저가 이 신호를 보내지 않아, 첫 페이지도 안 불러온 것처럼 보인다.

**해결** 코드 문제가 아님. 창을 화면에 보이게 하면 바로 불러온다. 자동 테스트나 숨긴 창으로 확인할 때만 주의.

---

## 29. 데스크탑 메인 "내 조미료들" 제목·더보기 글자가 안 보일 만큼 작음

**증상** 넓은 화면에서 "내 조미료들 한눈에 보기" 제목과 "더보기"가 8px로 나와 거의 읽을 수 없음.

**원인** 데스크탑 메인도 모바일 클래스(`.condiment-head`, `.condiment-more`)를 그대로 쓰는데, 데스크탑 CSS에 이 부분을 덮어쓰는 규칙이 없었다. 칸 높이도 고정이라 글자만 키우면 아래가 잘린다.

**해결** (`5d82fae`, `styles/desktop/MainPage.css`의 `@media (min-width: 1024px)` 안)
```css
.condiment-section     { height: auto; padding-bottom: 12px; } /* 높이 고정 해제 */
.condiment-head        { font-size: 16px; font-weight: 600; }
.condiment-more        { font-size: 14px; }
.condiment-more .chevron { width: 20px; height: 20px; }
```

---

## 30. 냉장고 거르기가 모바일·데스크탑에서 서로 다름

**증상**
- 모바일: 정렬 탭(유통기한순·재료 이름순·보관 장소순) + 툴바의 "조미료" 버튼
- 데스크탑: 상태 거르기(전체·임박·지남·다 떨어짐) + 조미료 버튼

같은 냉장고인데 화면 폭에 따라 고를 수 있는 것이 달랐다.

**해결** (`0cc16a7`, `f91e6c9`)
- 둘 다 **전체 · 이름순 · 지남 · 조미료** 기준 (데스크탑은 임박도 있음), 아무것도 안 고르면 유통기한순
- 데스크탑: "다 떨어짐" 대신 "이름순" 토글, 임박·지남·조미료와 같이 켤 수 있음
- 모바일: 기존 탭 디자인으로 하나만 고름. 조미료 버튼은 탭으로 옮기고 보관 장소순은 뺌. 임박 탭은 다음 커밋(`f91e6c9`)에서 뺌
- 18번(조미료 버튼이 사라지는 문제)은 모바일에서 버튼 자체가 탭으로 바뀌어 더 이상 해당 없음

**주의** 모바일 탭 밑줄은 CSS가 탭 개수를 알고 있어야 맞는다. 탭을 더하거나 빼면 `styles/mobile/fridge.css`의 두 값도 같이 바꾼다.
```css
grid-template-columns: repeat(4, minmax(0, 1fr)); /* 탭 수 */
width: calc(100% / 4);                             /* 밑줄 폭 */
```

---

## 31. 유통기한 "기한 없음"을 눌러도 기본값으로 돌아갈 위험

**상황** 모바일 재료 등록에 3일·7일·14일·한 달·기한 없음 빠른 선택을 넣었다 (`9d6ace4`). 그런데 등록 화면은 "아직 날짜를 안 골랐으면 재료 사전 기본값"을 보여 준다(16번). "기한 없음"을 `null`로 저장하면 "안 고름"과 구분이 안 돼 다시 기본 날짜가 뜬다.

**해결** (`components/mobile/Ingredient/Fields/ExpiryField.jsx`, `utils/useIngredientForm.js`)
- 안 고름 = `null`, 기한 없음 = `""`
- 기본값은 `??`로 계산해서 `""`는 그대로 둔다 (`||`를 쓰면 `""`도 기본값으로 바뀜)
- 서버에 보낼 때만 `""` → `null`
```js
const expiryDate = pickedExpiry ?? addDays(today, shelfLife);
body: { ..., expiryDate: expiryDate || null }
```
냉장고 목록은 `getExpiryBadge`가 날짜가 없으면 "기한 없음"으로 표시한다.

---

## 32. 배포 사이트가 "Unexpected Application Error (reading 'id')"로 멈춤

**증상** GitHub Actions로 처음 자동 배포한 뒤 `https://fridgeo.pages.dev/`가 오류 화면만 보임
```
Unexpected Application Error!
Cannot read properties of undefined (reading 'id')
```
네트워크 기록에서 로그인 확인 요청이 Neon Auth가 아니라 `https://fridgeo.pages.dev/api/auth/get-session`(사이트 자기 주소)으로 가고 있었다.

**원인**
- 프론트가 쓰는 Neon Auth 주소 `VITE_NEON_AUTH_URL`이 Git에 올라가지 않는 `.env`에만 있었다. PC에서 직접 배포할 때는 문제가 없었지만 GitHub Actions 빌드에는 `.env`가 없어서 주소가 비었다.
- 엉뚱한 응답을 세션으로 읽은 뒤 `components/Layout.jsx`가 `session?.user.id`를 읽다 앱 전체가 멈췄다.

**해결** (`382b4ec`, `b4317c0`)
- `.env.production`에 `VITE_NEON_AUTH_URL` 추가 (공개 주소, `wrangler.toml`과 같은 값)
- `vite.config.js`: 배포 빌드(`vite build`)에 `VITE_API_URL`·`VITE_NEON_AUTH_URL`이 없으면 빌드를 멈춤 → 깨진 사이트가 배포되기 전에 Actions에서 실패
- `session?.user?.id`처럼 `user`도 `?.`로 읽음 (응답이 이상해도 화면 전체가 멈추지 않게)

**확인** `.env` 없이 Git에 들어가는 파일만으로 빌드 → 두 주소가 결과물에 들어감. 주소를 지우고 빌드 → `빌드에 필요한 환경 변수가 없습니다: VITE_NEON_AUTH_URL`로 멈춤

**주의** 프론트에서 쓰는 `VITE_*` 값을 새로 만들면 `.env.production`에도 넣는다. `VITE_*`는 빌드 결과에 그대로 들어가 누구나 볼 수 있으므로 비밀 값은 넣지 않는다.

---

## 33. GitHub Actions에서 ESLint `'process' is not defined` (`vite.config.js`)

**증상** 32번을 고친 커밋(`382b4ec`)의 Actions가 check → `npm run lint`에서 실패, 배포 단계는 건너뜀 (사이트는 이전 버전 그대로)
```
vite.config.js:10  'process' is not defined
```

**원인** ESLint 설정이 브라우저 코드 기준이라 Node 전용 변수 `process`를 모름. 로컬에서 린트를 돌렸지만 출력 마지막 줄만 보고 통과로 판단해서 놓쳤다.

**해결** (`b4317c0`) `import process from 'node:process'`

**주의** 린트·테스트·빌드는 출력이 아니라 **종료 코드**로 확인한다.
```bash
npm run lint; echo "exit: $?"   # 0 이어야 통과
```

---

## 34. 사이트에 들어가자마자 회원가입 화면이 뜸

**증상** 로그인된 상태로 사이트를 열면 어느 주소든 `/signup`(휴대폰 인증 화면)으로 넘어감

**원인** 38번 작업 중 "휴대폰 번호 없는 계정은 어느 페이지에서든 가입 2단계로 보내기"를 `Layout.jsx`에 넣었다. 휴대폰 인증 단계가 생기기 전에 만든 계정도 번호가 없어서 전부 걸렸다.

**해결** (`8ff94bd`) 강제 이동 삭제. 번호 없는 계정도 로그인된 채로 그대로 쓴다. 직접 `/signup`에 들어가면 2단계(휴대폰 인증)를 이어서 할 수 있다.

**남은 점** 가입 중 인증을 안 하고 나간 계정은 번호 없이 남을 수 있고, 그 계정은 아이디·비밀번호 찾기를 쓸 수 없다.

---

## 35. 로그아웃 상태에서 API를 부를 때마다 Neon Auth 요청이 하나씩 더 나감

**증상** 로그아웃 상태로 레시피 목록을 스크롤하면 페이지마다 `get-session`(Neon Auth) + `/api/recipes` 두 요청이 나감

**원인** API 호출 전에 토큰을 꺼내려고 매번 `getSession()`을 부르는데, Neon SDK(`@neon/auth`)는 **로그인된 세션만** 캐시한다 (`adapter-core.js`의 `getSession.onSuccess`). 로그아웃 상태는 캐시가 없어서 매번 네트워크로 물어봤다.

**해결** (`api/client.js`)
- `useSession`이 쓰는 저장소(`authClient.$store.atoms.session`)가 이미 "로그아웃"으로 확인했으면 Neon Auth에 묻지 않는다
- 서버가 401을 주면 세션을 새로 받아 토큰이 바뀌었을 때만 한 번 더 보낸다 (로그인 직후 저장소가 아직 안 바뀐 경우, 토큰 만료)

**확인** 로그아웃 상태 레시피 목록: 바꾸기 전 API 5번에 세션 확인 5번 → 바꾼 뒤 처음 1번만

---

## 36. 로그인·로그아웃해도 화면이 바로 안 바뀜

**원인** 로그인 상태를 공유하는 곳이 없어서 `Layout`·메인 냉장고 카드·북마크·검색이 각자 처음 그려질 때 `isLoggedIn()`을 한 번씩 물어봤다. 페이지를 옮기기 전에는 이전 상태가 남았다.

**해결** `utils/auth.js`의 Neon 클라이언트를 React 어댑터(`BetterAuthReactAdapter`)로 바꾸고 `authClient.useSession()`을 씀. 새 패키지 없이 Context 역할을 한다 (로그인·로그아웃하면 이 훅을 쓰는 모든 화면이 다시 그려짐). 로그인 여부만 필요하면 `hooks/useLoggedIn.js`.
- 라우터의 `requireLogin`과 `apiFetch`는 컴포넌트 밖이라 지금처럼 `getSession()`을 씀

---

## 37. 아이디 찾기를 하면 그 계정으로 로그인됐다가 로그아웃됨

**원인** Neon Auth에는 "휴대폰 번호로 이메일 조회" API가 없어서, 휴대폰 인증으로 로그인 → 세션에서 이메일 읽기 → 로그아웃으로 우회했다. 이미 로그인한 사람이 쓰면 다른 계정으로 바뀌었다가 로그아웃됐다.

**해결** (`pages/mobile/Find_ID_Password.jsx`) `verify({ phoneNumber, code, disableSession: true })`. 세션·쿠키를 만들지 않고 응답의 `user.email`만 보여 준다 (Better Auth `phone-number/routes.mjs`에서 확인).

---

## 38. 회원가입 1단계만 하고 나가면 번호 없는 계정이 남음

**원인** 1단계("가입하기")에서 바로 `signUp.email()`로 계정을 만들었다. 2단계 휴대폰 인증 전에 나가면 번호 없는 계정이 남고, 그 계정은 아이디·비밀번호 찾기를 쓸 수 없다.

**확인한 제약** (Neon Auth 설정·문서)
- 가입 직후 자동 로그인은 끌 수 없다 (`auto_sign_in_after_verification`은 이메일 인증 **후**의 설정)
- 번호를 계정에 붙이는 `verify(updatePhoneNumber: true)`는 로그인된 계정에만 된다 → 가입은 인증 직전에 해야 한다

**해결** (`4e625c4`, `pages/mobile/Sign_up.jsx`)
1. 1단계 "다음": 이메일 중복만 서버에 확인(`POST /api/signup/check-email`, 서버 문서 19번)하고 입력값은 화면에만 둠
2. 2단계 "인증 요청": 처음이면 이때 가입 + 프로필 생성 → 인증번호 발송. 다시 요청하면 가입은 건너뜀
3. "인증 완료": 번호 연결 → 로그아웃 → 로그인 화면
- 뒤로가기: 인증 요청 전이면 1단계로, 후(가입된 상태)면 로그아웃 후 홈
- 인증번호를 틀려도 인증번호는 소모되지 않아(SDK 확인) 같은 화면에서 다시 입력하면 된다

**남은 점** 인증 요청 후 인증 없이 나가면 번호 없는 계정이 남는다 (34번 참고).

---

## 39. 저장한 뒤 다른 화면이 예전 값을 보여 줌 / 같은 데이터를 화면마다 따로 받음

**원인**
- 화면·훅마다 `useEffect` + `ignore` 변수 + 로딩·오류 상태로 따로 불러왔다. `/api/categories`는 4곳, `/api/recipes/:id`는 7곳에서 주소를 각자 조립했다.
- 저장 후 새로고침을 손으로 했다 (데스크탑 냉장고의 `version` 숫자, 메인 카드의 `reload`, 페이지를 옮길 때마다 알림 다시 받기).

**해결** (`ed58c46`, `93bb7b5`, `4004d4a`) 구조는 아래 "참고: 구조 변경 기록"
- `src/api/`: 서버 호출 함수만 (파일은 `server/routes/`와 1:1)
- `src/queries/`: React Query 훅. 캐시 키, "로그인했을 때만 받기", **저장 후 어떤 캐시를 다시 받을지**를 여기서만 정함
  - 예: 재료를 바꾸면 내 재료 목록·요약·조미료, 추천 레시피, 내 정보(임박 재료), 알림
  - 북마크·팔로우·알림 읽음·알림 설정은 화면을 먼저 바꾸고 실패하면 되돌림
- 로그아웃하거나 다른 계정으로 바뀌면 이전 계정 캐시를 지움 (`Layout.jsx` → `clearAccountData`)
- 4xx(로그인 필요 등)는 다시 시도하지 않음

**주의**
- 컴포넌트는 `@tanstack/react-query`를 직접 import하지 않고 `queries/`의 훅만 쓴다
- 새 저장 API를 만들면 `queries/`에 `useMutation` 훅을 만들고, 성공했을 때 다시 받을 캐시를 같이 적는다. 안 적으면 다른 화면에 예전 값이 남는다

**확인** 테스트 계정(`example.com`, 확인 후 삭제)으로 재료 추가·보관 장소 변경·수정·삭제, 북마크·해제, 레시피·리뷰 작성·삭제, 알림 설정, 알림 생성·전체삭제가 모두 새로고침 없이 반영되는지 확인 (2026-11-17)

---

## 데스크탑 버전 작업 정리와 의견

**구조** (`6c3e36b`, 자세한 흐름은 [src/README.md](../src/README.md))
- 주소 하나에 `pages/mobile/`과 `pages/desktop/` 화면이 하나씩 있고, `pages/Responsive.jsx`가 화면 폭 1024px을 기준으로 고른다. 기능이 같은 화면을 두 벌 유지하는 대신 **데이터·저장 로직은 훅 하나**로 모아 모바일·데스크탑이 같이 쓴다. 서버 데이터는 `queries/`의 React Query 훅, 입력 폼 같은 화면 상태는 `hooks/use*.js` (39번).
- 데스크탑에서만 쓰는 CSS는 `styles/desktop/`에 두고, 모바일 클래스를 덮어쓰는 규칙은 `@media (min-width: 1024px)` 안에만 둔다.
- 회원가입·계정 찾기는 모바일 입력 양식을 데스크탑 틀(`pages/desktop/AuthFrame.jsx`)에 그대로 넣었다. 인증 흐름이 복잡해서 새로 만들지 않았다.

**좋았던 점**
- 훅을 공유하니 모바일에서 저장 방식을 고치면 데스크탑도 같이 고쳐진다 (예: 재료 수정의 빈 수량 검사).
- 화면을 나눌 때 컴포넌트를 처음부터 다시 만들지 않고, 준비물 체크리스트·리뷰 목록처럼 모바일 조각을 가져다 써서 코드가 크게 늘지 않았다.

**주의할 점**
- 모바일 화면에 기능을 더하면 데스크탑 화면에도 넣어야 한다 (#27). 훅에 넣으면 두 화면이 같이 받는다.
- 폴더를 `mobile/`·`desktop/`으로 옮겼기 때문에, 예전 main을 기준으로 작업하던 브랜치는 병합할 때 경로 오류가 날 수 있다 (#26). 새 작업은 최신 main에서 시작할 것.
- 데스크탑 CSS는 모바일 CSS 뒤에 불러와야 한다 (#21).

**남은 일**
- 테스트 계정으로 재료·북마크·레시피·리뷰·알림 설정·알림까지 확인함(39번). 남은 것: 냉장고 끌어다 놓기(마우스), 다른 사람 팔로우(실제 작성자에게 알림이 가서 뺌), 닉네임·프로필 사진 변경, 레시피 사진 업로드
- 리뷰의 맛 평가·첨부 사진은 DB에 칸이 없어 저장되지 않음 (모바일도 같음)
- 북마크 안에서 찾기·정렬은 서버가 주는 최대 50개 안에서만 됨
- 재료 등록의 기본 유통기한은 보관 장소와 상관없이 재료 사전 값 (냉동이어도 냉장 기준 일수)
- 코드 리뷰(2026-11-16)에서 나온 화면 쪽 개선점 (아직 안 고침)
  - 화면 폭이 1024px을 넘나들면 쓰던 입력이 사라짐: `pages/Responsive.jsx`가 모바일·데스크탑 화면을 통째로 바꿔 그려서 입력값 상태가 초기화됨
  - 앱을 열 때마다 로딩 화면이 고정 2초 (`components/Layout.jsx`의 `LOADING_MS = 2000`), 데이터가 빨리 와도 기다림

---

## 참고: 구조 변경 기록

기능은 그대로 두고 파일 위치만 정리한 변경입니다. import 경로가 바뀌었으니 예전 경로로 import 하면 오류가 납니다.

| 커밋 | 변경 |
|---|---|
| `1f59537` | 통합 검색 `Search.jsx`: `src/pages` → `src/components` (router·Header 경로 수정) |
| `1ecc75b` | 마이페이지: 스타일 `styles/MyPage.css`, 영역별 `components/MyPage/*` |
| `c2237d6`, `a856fac` | 레시피 목록·상세: `components/Recipe/*` |
| `0b957a6` | `components/Recipe`를 `List` · `Detail` · `Review` · `Bookmark` 폴더로 |
| `c647efe` | 내 냉장고: `components/fridge/*` (정렬·툴바·목록·추가 버튼) |
| `2b58584`, `5b4e86d` | 재료 등록·편집: 스타일 `styles/Ingredient.css`, 입력 칸 `components/Ingredient/*` 공유 |
| `5c18d1e` | `components/Ingredient`를 `Fields`(입력 칸) · `Frame`(위·아래 바) 폴더로 |
| `6c3e36b` | `src/components` · `pages` · `styles`를 `mobile/` · `desktop/`으로 나눔 (`components/Layout.jsx`, `pages/Responsive.jsx`는 공통이라 그대로). 모바일 로직은 `utils/use*.js` 훅으로 |
| `da05595` | 안 쓰던 `utils/fridgeData.js`, 동작 없는 `EditBottomNav.jsx` 삭제, 흐름표 `src/README.md` 추가 |
| `fed8a2e` | `utils/use*.js` 훅을 `hooks/`로 이동. `utils/fridgeUtils.js` → `utils/date.js`, 약관 문구 `utils/terms.js` |
| `ed58c46` | 서버 호출을 `src/api/`로 모음 (`client.js`의 `apiFetch` + `server/routes/`와 1:1 파일). `utils/uploadImage.js` → `api/images.js` |
| `93bb7b5` | React Query 도입: `src/queries/`(조회·저장 훅, `queryClient.js`). `useToggleRequest`·옛 무한 스크롤 훅 정리 |
| `4004d4a` | queries 훅을 감싸기만 하던 `useRecipeDetail`·`useAuthorFollow`·`useExpiryAlertSetting`·`useBookmarks`·`useMyRecipes` 삭제, 화면에서 queries 훅 직접 사용 |

---

## 확인 방법

```bash
npm run lint
```
```bash
npm run build
```
```bash
git grep -n "^<<<<<<<\|^>>>>>>>"
```
```bash
git status
```
