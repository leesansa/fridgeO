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
