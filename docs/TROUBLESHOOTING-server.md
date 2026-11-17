# 트러블슈팅: 레시피 서버 (크롤링 → Neon → API)

만개의레시피 데이터를 Python으로 크롤링해 Neon(Postgres)에 넣고, React에서 쓸 수 있는 API 서버(`recipe-server`)를 만들면서 겪은 문제와 해결 방법을 정리한 문서입니다.

- 작업 위치: `C:\Users\tj1\Documents\GitHub\server_test\recipe-server`
- 구성: Python 크롤러(uv) → `db/seed.sql` → Neon → Node API 서버(`@neondatabase/serverless`) → React(Vite)

| # | 문제 | 원인 | 해결 |
|---|---|---|---|
| 1 | `python` 명령이 동작하지 않음 | Microsoft Store 바로가기만 있고 Python 미설치 | `uv run`으로 실행 |
| 2 | 크롤러가 도중에 `UnicodeEncodeError`로 종료 | Windows 콘솔 인코딩(cp949) | 표준출력을 UTF-8로 재설정 |
| 3 | 면/만두 분류가 통째로 빠짐 | 요청 시간 초과 1회로 분류 전체를 건너뜀 | 요청마다 재시도 3회 |
| 4 | ESLint `'process' is not defined` | 서버 코드를 브라우저 코드로 검사 | 서버 폴더에 Node 전역 변수 지정 |
| 5 | `db:seed` 실행 시 `DATABASE_URL`을 못 찾음 | `.env`가 저장되지 않아 0바이트 | 에디터에서 저장(Ctrl+S) |
| 6 | 임시 스크립트에서 `ERR_MODULE_NOT_FOUND` | `node_modules`가 없는 폴더에서 실행 | 프로젝트 폴더에서 표준입력으로 실행 |
| 7 | 레시피 재료를 냉장고 재료와 연결할 수 없음 | 재료가 "이름+분량" 문장으로 저장됨 | `recipe_ingredients` 테이블로 분리 |
| 8 | 재료 분리 후에도 `감자1개` 같은 값이 남음 | 이름과 분량 사이에 공백이 없음 | 숫자 앞에서 한 번 더 분리 |
| 9 | `계란`, `다진 마늘`이 카탈로그와 매칭 안 됨 | 표기 차이(`달걀`, 공백) | 별칭 변환 + 공백 무시 비교 |
| 10 | 사용자 id 타입이 Neon Auth와 맞지 않음 | Neon Auth id는 `uuid`, 테이블은 `neon_auth."user"` | 사용자 id 컬럼을 모두 `UUID`로 변경 |
| 11 | `users`에 email·password 중복 | 로그인 정보는 Neon Auth가 이미 관리 | 두 컬럼 제거, 앱 프로필만 저장 |
| 12 | 리뷰가 어느 레시피 것인지 알 수 없음 | `reviews`에 `recipe_id` 없음 | `recipe_id` 추가 + 별점 1~5 제한 |
| 13 | 재료 사전의 유통기한을 날짜로 저장 | 재료마다 고정 날짜는 의미가 없음 | 보관 일수(`shelf_life_days`)로 변경 |
| 14 | 수량을 개수로만 저장 | `300g`, `1단`, `500ml`를 표현 못 함 | `quantity NUMERIC` + `unit` |
| 15 | 중복·잘못된 데이터가 들어갈 수 있음 | 제약 조건 없음 | `UNIQUE`, `CHECK` 추가 |
| 16 | 앱 테이블 이름이 크롤링 테이블과 겹침 | 같은 DB에 `recipes` 등이 이미 있음 | **미해결**: 새 Neon 브랜치 또는 기존 테이블 정리 |
| 17 | 초기 레시피를 누구 이름으로 보여줄지 | 실제 서비스명 계정은 오해·저작권 문제 | 계정을 만들지 않고 `user_id = NULL` |
| 18 | 로컬 API 서버(`npm run server`)가 응답 없음, "Workers runtime crashed" 반복 | `wrangler dev`가 두 개 떠서 같은 3001 포트를 두고 충돌 | wrangler·workerd 프로세스를 모두 끄고 하나만 실행 |
| 19 | 회원가입 1단계에서 이메일 중복을 확인할 API가 없음 | Neon Auth에는 "가입 여부만 조회" API가 없음 | `POST /api/signup/check-email`가 `neon_auth."user"`를 직접 조회 |
| 20 | main에 푸시해도 자동 배포가 안 됨 | Pages는 직접 올리기(Direct Upload) 프로젝트, Worker는 PC에서 `wrangler deploy` | GitHub Actions(`.github/workflows/deploy.yml`)로 검사 후 백·프론트 배포 |
| 21 | Actions 경고 "Node.js 20 is deprecated" | `actions/checkout@v4`·`setup-node@v4`가 Node 20 기반 | v6으로 올림 (Node 24 기반) |
| 22 | 계정을 지워도 그 계정이 쓴 레시피는 남음 | `recipes.user_id`만 `ON DELETE SET NULL` | 의도된 동작(17번과 같은 형태). 테스트 계정은 레시피를 먼저 지운 뒤 계정 삭제 |
| 23 | Worker 주소가 Git과 프론트 빌드 결과에 공개됨 | `VITE_API_URL`은 브라우저가 직접 부르는 주소 | 숨길 수 없고 비밀도 아님. 대신 로그인 없이 부를 수 있는 API에 요청 제한이 필요 (**남은 일**) |

---

## 1. `python` 명령이 동작하지 않음

**증상**
```
$ python --version
Python            ← 버전 없이 이상한 출력
```
`Get-Command python` 결과가 `C:\Users\...\AppData\Local\Microsoft\WindowsApps\python.exe` 하나뿐이었습니다.

**원인**
Python이 설치되어 있지 않고, Windows의 Microsoft Store 바로가기(가짜 실행 파일)만 있었습니다.

**해결**
이미 설치된 [uv](https://docs.astral.sh/uv/)로 실행했습니다. 스크립트 맨 위에 필요한 패키지를 적어 두면, uv가 Python과 패키지를 알아서 준비합니다.

```python
# /// script
# requires-python = ">=3.10"
# dependencies = ["requests", "beautifulsoup4"]
# ///
```
```bash
uv run scraper/crawl.py
```

---

## 2. 크롤러가 도중에 `UnicodeEncodeError`로 종료

**증상**
레시피 몇 개를 수집하고 출력하다가 멈췄습니다. 결과 파일(`recipes.json`, `seed.sql`)은 만들어지지 않았습니다.
```
UnicodeEncodeError: 'cp949' codec can't encode character '\xa0' in position 12
```

**원인**
Windows 콘솔의 기본 인코딩은 cp949입니다. 레시피 제목에 cp949로 표현할 수 없는 문자(줄바꿈 없는 공백 `\xa0` 등)가 있어서 `print()`에서 예외가 났습니다. 결과 파일은 모든 수집이 끝난 뒤에 쓰기 때문에, 그때까지 수집한 데이터도 함께 사라졌습니다.

**해결**
표준출력을 UTF-8로 바꾸고, 출력할 수 없는 문자는 대체 문자로 바꾸도록 했습니다.
```python
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
```
파일 저장은 원래 `encoding="utf-8"`을 지정하고 있어서 문제가 없었습니다.

---

## 3. 면/만두 분류가 통째로 빠짐

**증상**
수집은 끝났지만 16개 분류 중 15개만 들어갔습니다(160개 중 149개).
```
[skip] 면/만두 목록 실패: HTTPSConnectionPool(...): Read timed out.
[skip] 6941177: HTTPSConnectionPool(...): Read timed out.
```

**원인**
목록 페이지 요청이 한 번 시간 초과되면 그 분류 전체를 건너뛰는 구조였습니다.

**해결**
요청마다 최대 3번 재시도하고, 재시도할수록 대기 시간을 늘렸습니다(1초 → 2초 → 3초). 다시 수집하니 16개 분류, 160개가 모두 들어갔습니다.
```python
def get(url, tries=3):
    for attempt in range(tries):
        time.sleep(DELAY * (attempt + 1))
        try:
            r = session.get(url, timeout=15)
            r.raise_for_status()
            return r.text
        except requests.RequestException:
            if attempt == tries - 1:
                raise
```

---

## 4. ESLint `'process' is not defined`

**증상**
```
server/index.js  7:14  error  'process' is not defined  no-undef
```

**원인**
Vite 템플릿의 ESLint 설정은 모든 `.js` 파일을 브라우저 환경(`globals.browser`)으로 검사합니다. 서버 코드에서 쓰는 Node 전역 변수 `process`를 모른다고 판단했습니다.

**해결**
서버 폴더에만 Node 전역 변수를 지정했습니다(`eslint.config.js`).
```js
{ files: ['server/**/*.js', 'recipe-server/**/*.js'], languageOptions: { globals: globals.node } },
```

---

## 5. `db:seed` 실행 시 `DATABASE_URL`을 못 찾음

**증상**
`.env`에 연결 주소를 넣었는데도 아래 오류가 났습니다.
```
Error: .env 에 DATABASE_URL 을 설정하세요 (.env.example 참고)
```

**원인**
`wc -c .env` 결과가 `0`이었습니다. 에디터에 입력만 하고 저장하지 않아서 디스크에 있는 파일은 비어 있었습니다.

**해결**
에디터에서 저장(Ctrl+S)한 뒤 다시 실행하니 정상 동작했습니다.

**확인 방법** (비밀 값은 가리고 키 이름만 확인)
```bash
wc -c .env
sed -E 's/=.*/=<hidden>/' .env
```

`.env` 형식은 따옴표 없이 한 줄로 적습니다.
```
DATABASE_URL=postgresql://사용자:비밀번호@ep-xxxx.neon.tech/neondb?sslmode=require
```

---

## 6. 임시 스크립트에서 `ERR_MODULE_NOT_FOUND`

**증상**
DB 구조를 조회하려고 만든 스크립트를 임시 폴더에서 실행하니 오류가 났습니다.
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@neondatabase/serverless'
```

**원인**
Node는 스크립트 파일이 있는 위치를 기준으로 `node_modules`를 찾습니다. 임시 폴더에는 패키지가 설치되어 있지 않았습니다.

**해결**
패키지가 설치된 프로젝트 폴더로 이동해서, 스크립트를 표준입력으로 넘겨 실행했습니다. 이렇게 하면 현재 폴더 기준으로 패키지를 찾습니다.
```bash
cd recipe-server
node --env-file=.env --input-type=module < inspect.mjs
```

---

## 7. 레시피 재료를 냉장고 재료와 연결할 수 없음

**증상**
테이블 구조를 점검해 보니, 같은 DB에 냉장고 앱 테이블(`users`, `ingredients`, `ingredient_catalog`)이 있었습니다. 그런데 `recipes.ingredients`는 아래처럼 문장 배열이었습니다.
```json
["베이컨 6줄", "애호박 1/2개", "만두 10개 (교자만두/물만두)"]
```
이 형태로는 냉장고 재료 이름(`두부`, `달걀` 등)과 정확히 맞춰 볼 수 없습니다.

**원인**
크롤링한 원본(JSON-LD의 `recipeIngredient`)이 "이름 + 분량"을 한 문자열로 제공합니다.

**해결**
재료를 한 줄씩 담는 테이블을 따로 만들었습니다. 화면에 원문을 보여주기 위해 기존 `recipes.ingredients`는 그대로 두었습니다.
```sql
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position  INT    NOT NULL,
  name      TEXT   NOT NULL,
  amount    TEXT,
  PRIMARY KEY (recipe_id, position)
);
CREATE INDEX IF NOT EXISTS recipe_ingredients_name_idx ON recipe_ingredients (name);
```

크롤러에서 문자열을 나누는 규칙:
- 두 번째 단어부터 보면서, 숫자·분수(`½`, `1/2`)·괄호로 시작하거나 `약간`, `적당히`, `톡톡` 같은 분량 표현으로 시작하는 단어가 나오면 그 앞까지를 이름으로 봅니다.
- 이름 안의 괄호 설명은 지웁니다: `오이(소)` → `오이`

다시 크롤링하지 않고, 이미 받아 둔 `data/recipes.json`으로 SQL만 새로 만드는 옵션을 추가했습니다.
```bash
uv run scraper/crawl.py --sql-only
npm run db:seed
```
`seed.sql`은 `CREATE TABLE IF NOT EXISTS`와 `ON CONFLICT DO NOTHING`을 쓰기 때문에, 기존 데이터를 건드리지 않고 새 테이블만 추가됩니다.

---

## 8. 재료 분리 후에도 `감자1개` 같은 값이 남음

**증상**
나눈 결과를 확인해 보니 분량이 이름에 붙어 있는 값이 14개 정도 있었습니다.
```
{ name: '감자1개', amount: null }
{ name: '우유400ml', amount: null }
{ name: '파르메산치즈가루1큰술', amount: null }
```

**원인**
7번의 규칙은 공백을 기준으로 단어를 나눕니다. 원문에 이름과 분량 사이 공백이 없으면 나눌 수 없습니다.

**해결**
분량이 비어 있고 이름에 숫자가 있으면, 첫 숫자 앞에서 한 번 더 나눴습니다.
```python
if amount is None:  # 공백 없이 붙은 경우: '감자1개', '우유400ml'
    m = re.match(r"^(\D+?)\s*([\d½⅓¼].*)$", name)
    if m:
        name, amount = m.group(1).strip(), m.group(2)
```
남은 1건은 `토마토 스파게티 소스 / 적당히`처럼 이름이 원래 긴 정상 데이터였습니다.

나누는 규칙이 다시 깨지지 않도록 셀프테스트를 넣었습니다.
```bash
uv run scraper/crawl.py --test   # selftest ok
```

---

## 9. `계란`, `다진 마늘`이 카탈로그와 매칭 안 됨

**증상**
같은 재료인데도 표기가 달라서 연결되지 않았습니다.
- 레시피는 `계란`, 재료 목록(`ingredient_catalog`)은 `달걀`
- `다진 마늘`과 `다진마늘`, `슬라이스치즈`와 `슬라이스 치즈`

**해결**
- 자주 나오는 `계란`은 크롤러에서 `달걀`로 바꿔 저장합니다(`ALIASES = {"계란": "달걀"}`).
- 이름을 비교할 때 양쪽 공백을 빼고 비교합니다.
```sql
SELECT r.id, r.title, count(*) AS have,
  (SELECT count(*) FROM recipe_ingredients x WHERE x.recipe_id = r.id) AS total
FROM recipes r
JOIN recipe_ingredients ri ON ri.recipe_id = r.id
JOIN ingredients mine ON replace(mine.name, ' ', '') = replace(ri.name, ' ', '')
WHERE mine.user_id = $1
GROUP BY r.id
ORDER BY have DESC, total ASC
LIMIT 10;
```

**결과**
- 재료 목록 20개 중 17개가 레시피 재료와 연결되었습니다(달걀 38번, 우유 23번, 두부 14번 등).
- 추천 1위: "닭가슴살양배추말이"(재료 5개 중 3개 보유)

**남은 한계**
이름이 아예 다른 경우(`대파`와 `파`, `진간장`과 `간장`, `참치`와 `참치캔`)는 아직 연결되지 않습니다. 필요하면 `ALIASES`에 추가하거나 별칭 테이블을 만들어야 합니다.

---

> 10번부터는 냉장고 앱 전체 테이블을 Neon Auth 기준으로 다시 설계하면서 정리한 내용입니다(2026-11-10).
> - 작성 위치: `fridgeO/db/schema.sql` (수정 중), 처음 작성한 원본은 `fridgeO/db/schema.original.sql`
> - 아직 Neon에서 실행하지 않았습니다(16번 참고).

## 10. 사용자 id 타입이 Neon Auth와 맞지 않음

**증상**
처음 설계에서는 `users.id`를 `TEXT`(또는 `serial`)로 두었습니다. 그런데 Neon Auth의 사용자 id와 타입이 다르면 외래 키를 걸 수 없고, 다른 테이블의 `user_id`도 함께 어긋납니다.

**원인**
Neon DB에서 직접 조회해 보니, 현재 Neon Auth(Better Auth 기반)는 사용자를 `neon_auth."user"` 테이블에 저장하고 id 타입은 `uuid`였습니다.
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'neon_auth' AND table_name = 'user';
-- id uuid, name text, email text, emailVerified boolean, image text, ...
```

**해결**
- `users.id`를 `UUID`로 바꾸고 Neon Auth 사용자를 참조하게 했습니다.
  ```sql
  id UUID PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE
  ```
- `user`는 PostgreSQL 예약어라서 반드시 큰따옴표(`"user"`)로 감싸야 합니다.
- 사용자 id를 담는 나머지 컬럼 8개도 모두 `UUID`로 맞췄습니다: `follows.user_id`, `follows.following_id`, `ingredients.user_id`, `recipes.user_id`, `recipe_bookmarks.user_id`, `reviews.user_id`, `notifications.user_id`, `notifications.actor_id`.

---

## 11. `users`에 email·password 중복

**증상**
처음 `users` 테이블에 email과 password를 두려고 했습니다.

**원인**
Neon Auth를 쓰면 이메일은 `neon_auth."user"`에, 비밀번호(해시)는 `neon_auth.account`에 이미 저장됩니다. 내 테이블에 또 두면 값이 두 곳에 생기고, 비밀번호는 쓰이지도 않으면서 유출 위험만 늘어납니다.

**해결**
- `users`에서 email과 password를 빼고, 앱 전용 정보(`name`, `profile_image_url`)만 남겼습니다. 이메일이 필요하면 `neon_auth."user"`와 JOIN해서 읽습니다.
- Neon Auth는 자기 테이블에만 사용자를 만듭니다. 그래서 가입 직후나 첫 로그인 때 API 서버가 `users` 행을 직접 만들어야 합니다.
  ```sql
  INSERT INTO users (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING;
  ```
- API 서버는 클라이언트가 보낸 `user_id`를 그대로 믿지 말고, Neon Auth 토큰을 검증해서 꺼낸 id를 사용해야 합니다.

---

## 12. 리뷰가 어느 레시피 것인지 알 수 없음

**증상**
`reviews` 설계에 `user_id`, `rating`, `comment`만 있었습니다.

**원인**
`recipe_id`가 빠져 있어서 리뷰를 레시피에 연결할 수 없었습니다.

**해결**
```sql
recipe_id  BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
UNIQUE (user_id, recipe_id)   -- 레시피당 한 사람 리뷰 1개
```

---

## 13. 재료 사전의 유통기한을 날짜로 저장

**증상**
`ingredient_catalog.expiry_date`를 날짜(`DATE`)로 두려고 했습니다.

**원인**
사전에 있는 재료는 모든 사용자가 같이 씁니다. "2026-11-20까지" 같은 고정 날짜는 사람마다, 등록한 날마다 맞지 않습니다.

**해결**
등록일로부터 며칠 보관할 수 있는지를 정수로 저장합니다. 재료를 등록할 때 `오늘 + shelf_life_days`로 `ingredients.expiry_date`의 기본값을 계산합니다.
```sql
shelf_life_days INT CHECK (shelf_life_days > 0)
```

---

## 14. 수량을 개수로만 저장

**증상**
`ingredients.quantity`를 개수(정수)로만 처리하려고 했습니다.

**원인**
프론트의 기존 데이터(`src/utils/fridgeData.js`)에 이미 `"1모"`, `"300g"`, `"500ml"`, `"1단"`이 있었습니다. 개수만 받으면 이 값들을 표현할 수 없습니다. 반대로 `"300g"` 같은 문자열 하나로 저장하면 "1개 남음 → 새로 채워야 하는 상품" 같은 계산을 할 수 없습니다.

**해결**
숫자와 단위를 나눴습니다. 대파 반 단(`0.5`)처럼 소수가 필요할 수 있어서 `INT`가 아니라 `NUMERIC`을 씁니다.
```sql
quantity NUMERIC NOT NULL DEFAULT 1 CHECK (quantity >= 0),
unit     TEXT    NOT NULL DEFAULT '개'   -- 개, g, ml, 단, 모 ...
```
조미료(소금, 후추 등)는 양 대신 "있음/부족/없음" 같은 상태로 관리하는 편이 실용적입니다(아직 반영 안 함).

---

## 15. 중복·잘못된 데이터가 들어갈 수 있음

**증상**
같은 사람을 두 번 팔로우하거나, 자기 자신을 팔로우하거나, 같은 레시피를 두 번 북마크하는 일을 DB가 막지 못하는 설계였습니다.

**해결**
DB 제약 조건으로 막았습니다. 앱 코드에서 실수해도 잘못된 데이터가 저장되지 않습니다.

| 테이블 | 추가한 제약 |
|---|---|
| `follows` | `UNIQUE (user_id, following_id)`, `CHECK (user_id <> following_id)` / 컬럼명 `follow_id` → `following_id` |
| `recipe_bookmarks` | `UNIQUE (user_id, recipe_id)` |
| `recipe_steps`, `recipe_ingredients` | `UNIQUE (recipe_id, position)` / `image` → `image_url` |
| `ingredients` | `storage IN ('실온', '냉장', '냉동')` |
| `recipes` | `difficulty IN ('쉬움', '보통', '어려움')`, `servings > 0`, `cook_time > 0`(분 단위) |
| `notifications` | `type IN ('expiry', 'follow', 'review')` |

자주 조회하는 외래 키(`ingredients.user_id`, `recipes.user_id`, `recipes.category_id`, `follows.following_id`, `reviews.recipe_id`)에는 인덱스를 추가했습니다.

---

## 16. 앱 테이블 이름이 크롤링 테이블과 겹침 (미해결)

**증상**
`schema.sql`을 지금 DB에서 실행하면 `relation "recipes" already exists` 오류가 날 것으로 예상됩니다.

**원인**
같은 Neon DB에 크롤링용 `authors`, `recipes`, `recipe_ingredients`, `recipe_bookmarks`, `author_follows`가 이미 있습니다.

**해결 방법(선택 필요)**
- Neon에서 개발용 DB 브랜치를 새로 만들어 거기서 실행합니다(기존 데이터 그대로 유지).
- 또는 크롤링 테이블을 지우거나 이름을 바꾼 뒤 실행합니다. `authors`는 만개의레시피 사용자 정보라 공개 배포 버전에서는 쓰지 않기로 했습니다(17번 참고).

---

## 17. 초기 레시피를 누구 이름으로 보여줄지

**고민**
사용자가 레시피를 추가하기 전에도 레시피가 어느 정도 보이게 하려고, "만개의레시피"를 사용자로 등록해 초기 레시피를 보여주는 방법을 검토했습니다.

**검토 결과: 사용하지 않음**
- `users.id`가 Neon Auth를 참조하므로, 실제로 로그인하지 않는 가짜 인증 계정을 만들어야 합니다.
- 실제 서비스 이름의 계정은 제휴하거나 직접 올린 것처럼 보이게 만듭니다.
- 계정 이름과 관계없이, 크롤링한 레시피를 공개 배포하는 저작권 문제는 그대로 남습니다.

**정한 방법**
- 초기 레시피는 `recipes.user_id = NULL`로 저장합니다(`ON DELETE SET NULL`이라 탈퇴한 사용자 레시피도 같은 형태).
- 초기 데이터 출처는 공공데이터(식품안전나라 조리식품 레시피 API, COOKRCP01)나 팀원이 직접 작성한 레시피를 우선 검토합니다. 공공데이터의 이용 조건(공공누리 유형)은 신청할 때 확인해야 합니다.
- 출처 링크를 표시하는 것은 예의일 뿐, 사용 허락을 받은 것은 아닙니다.

---

## 18. 로컬 API 서버(`npm run server`)가 응답 없음, "Workers runtime crashed" 반복

**증상**
- `http://localhost:3001/api/categories`가 응답 없이 멈춤 (DB 직접 조회는 300ms 안에 정상)
- 로그에 같은 줄이 반복
```
[wrangler:warn] The Workers runtime crashed unexpectedly and is being restarted (crash #1).
```

**원인** `wrangler dev`(node)와 `workerd`가 두 벌 떠 있었다. 이전 서버를 끄지 않은 채 새로 실행해서 같은 3001 포트를 두고 서로 재시작시켰다.

**해결** wrangler·workerd 프로세스를 전부 끄고 하나만 다시 실행
```powershell
Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='workerd.exe'" |
  Where-Object { $_.CommandLine -match 'wrangler|workerd' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
npm run server
```

**주의** 위 명령은 PC의 모든 wrangler를 끈다. 다른 프로젝트의 wrangler도 같이 꺼진다.

---

## 19. 회원가입 1단계에서 이메일 중복을 확인할 API가 없음

**상황** 회원가입을 "1단계 입력 → 2단계 인증 요청 때 가입"으로 바꾸면서(프론트 38번), 이메일이 이미 가입돼 있으면 1단계에서 막아야 했다. Neon Auth(Better Auth)에는 가입을 시도하지 않고 여부만 묻는 API가 없다.

**해결** (`server/routes/signup.js`)
```sql
SELECT 1 FROM neon_auth."user" WHERE lower(email) = lower($1) LIMIT 1
```
- 로그인 없이 부를 수 있음 (`POST /api/signup/check-email` → `{ available }`)
- 대소문자 구분 없음, 형식이 틀리면 400
- 확인: 없는 이메일 → `available: true`, 기존 계정 이메일을 대문자로 → `false`, 형식 오류 → 400

**남은 점**
- 요청 횟수 제한이 없다. 가입 시도로도 "이미 가입된 이메일"이 나오므로 새로 알려 주는 정보는 아니지만, 계정을 만들지 않고 대량으로 조회하기는 더 쉬워진다. 코드에 `shortcut:` 주석으로 표시 (23번)
- 확인과 실제 가입 사이에 다른 사람이 같은 이메일로 가입하면 "인증 요청" 때 오류가 나고 1단계로 돌아간다 (드묾)

---

## 20. main에 푸시해도 자동 배포가 안 됨

**확인한 것** (2026-11-17)
| 대상 | 상태 |
|---|---|
| 프론트 Cloudflare Pages `fridgeo` | `wrangler pages project list`의 Git Provider가 **No** (직접 올리기 프로젝트). 배포된 것은 `43fa690` |
| 백 Worker `fridgeo-api` | `wrangler deployments list`: PC에서 올린 1번(Source: Upload) + 비밀값 등록뿐 |
| 저장소 | `.github/workflows` 없음 |

직접 올리기로 만든 Pages 프로젝트는 나중에 Git 연결로 바꿀 수 없다. 새로 만들면 주소가 바뀌고 서버의 `CORS_ORIGINS`도 바꿔야 한다.

**해결** (`3d38134`) `.github/workflows/deploy.yml`
1. main 푸시 → `check`: `npm ci` → `npm run lint` → `npm test`. 실패하면 배포 안 함
2. 통과하면 동시에
   - `deploy-server`: `npx wrangler deploy`
   - `deploy-web`: `npm run build` → `npx wrangler pages deploy dist --project-name fridgeo --branch main`
- 연달아 푸시해도 앞의 배포가 끝난 뒤 다음 배포 (`concurrency`)
- Actions 탭의 "Run workflow"로 다시 배포 가능

**GitHub Secrets** (저장소 → Settings → Secrets and variables → Actions)
| 이름 | 값 |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | 대시보드 주소 `dash.cloudflare.com/<계정 ID>/...` |
| `CLOUDFLARE_API_TOKEN` | 아래 권한으로 만든 토큰 |

**토큰 권한** (My Profile → API Tokens → Create Token → Start from scratch, 2026-11 화면 기준)
- Account policy (Include는 이 계정 하나만. 기본값 `All accounts`에서 바꿀 것)
  - **Workers Scripts: Edit**, **Cloudflare Pages: Edit**, **Workers R2 Storage: Read**, **Account Settings: Read**
  - 이름이 비슷한 "Workers"(Metadata Read·Admin), "Account Custom Pages"는 다른 항목
- User policy: **User Details: Read**
- Zone policy·IP 제한은 넣지 않음 (커스텀 도메인 없음, Actions 서버 IP는 매번 바뀜)

**필요 없는 것** Worker 비밀값(`DATABASE_URL`, `SOLAPI_*`)은 Cloudflare에 저장돼 있어 다시 넣지 않는다. 프론트가 쓰는 공개 주소는 `.env.production`에 있다 (빠지면 사이트가 깨짐 → 프론트 32번).

---

## 21. Actions 경고 "Node.js 20 is deprecated"

**증상** 세 단계 모두 같은 경고 (실패는 아님)
```
Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: actions/checkout@v4, actions/setup-node@v4.
```

**해결** 두 액션을 v6으로 (v6·v7 모두 `action.yml`이 `using: node24`인 것을 확인, 나온 지 오래된 v6을 고름)

**참고** "ubuntu-latest가 2026-10-19부터 Ubuntu 26으로 바뀐다"는 안내도 같이 나오지만 정보 메시지라 지금은 할 일 없음.

---

## 22. 계정을 지워도 그 계정이 쓴 레시피는 남음

**확인** 테스트 계정을 지우기 전에 외래 키 삭제 규칙을 조회 (`pg_constraint`)
| 지우는 것 | 같이 지워짐 (CASCADE) | 남음 |
|---|---|---|
| `neon_auth."user"` | 세션·계정 연결, `users`(프로필) | |
| `users` | 재료, 북마크, 리뷰, 팔로우, 알림 | `recipes` (`user_id` → NULL) |
| `recipes` | 레시피 재료·순서, 리뷰, 북마크, 알림 | |

17번에서 정한 대로 레시피는 작성자만 비운 채 남는다. 테스트 계정은 그 계정 레시피를 먼저 지운 뒤 `neon_auth."user"`를 지웠다. 지운 뒤 계정·세션·프로필·재료·북마크·리뷰·알림·테스트 레시피가 모두 0개인 것을 확인했다.

**주의** 탈퇴 기능을 만들 때 "탈퇴하면 내 레시피도 지울지"를 정해야 한다. 지금 구조로는 남는다.

---

## 23. Worker 주소가 Git과 프론트 빌드 결과에 공개됨

**상황** `.env.production`의 `VITE_API_URL=https://fridgeo-api.fridgeo.workers.dev`가 Git에 올라가 있다.

**판단: 그대로 둠**
- `VITE_*` 값은 빌드 결과(JS)에 그대로 들어가서, 사이트를 열고 개발자도구만 봐도 보인다. Git에서 빼도 숨겨지지 않는다.
- Neon Auth 주소, R2 이미지 주소도 브라우저가 직접 접속하는 공개 주소다.
- 진짜 비밀(`DATABASE_URL`, `SOLAPI_*`)은 `wrangler secret`으로만 넣고 Git에 없다.

**실제로 막아야 하는 것**
- 로그인이 필요한 API는 JWT 검증(`requireAuth`)으로 401
- CORS(`CORS_ORIGINS`)는 다른 사이트의 **브라우저**만 막는다. `curl`·스크립트 호출은 못 막음
- **남은 일**: 로그인 없이 부를 수 있는 API(레시피 목록·상세, `/api/signup/check-email`)에 요청 횟수 제한(Cloudflare Rate Limiting)

---

## 현재 `db/schema.sql` 확인 사항

원본(`schema.original.sql`)에서 아래 항목이 빠진 상태입니다. 의도한 변경이라면 그에 따른 영향을 확인해야 합니다.

| 빠진 항목 | 영향 |
|---|---|
| `BEGIN;` / `COMMIT;` | 중간에 오류가 나면 앞부분 테이블만 만들어진 채로 남습니다. 다시 실행하면 `already exists` 오류가 납니다. |
| `ingredients.custom_name` + `CHECK` | `catalog_id`가 NULL을 허용하므로 재료 이름이 전혀 없는 행이 생길 수 있습니다. 사전 재료만 등록하게 할 거라면 `catalog_id`를 `NOT NULL`로 하고 `ON DELETE SET NULL` 대신 `ON DELETE RESTRICT`를 써야 합니다(`NOT NULL`과 `SET NULL`은 함께 쓸 수 없음). |
| `ingredient_catalog.default_unit` | 등록할 때 단위를 자동으로 채울 수 없습니다(직접 선택). |
| `recipes.source_name`, `source_url` | 외부에서 가져온 레시피의 출처를 표시할 수 없습니다. 17번처럼 공공데이터를 쓰면 출처 표시가 이용 조건일 수 있습니다. |
| `recipe_ingredients.catalog_id` + 인덱스 | 레시피 재료와 냉장고 재료를 계속 이름으로 비교합니다(9번의 남은 한계 그대로). |
| `notifications.is_read` + 인덱스 | 알림을 읽었는지 저장할 수 없어서, 메인 화면의 새 알림 표시(`hasUnread`)를 계산할 방법이 없습니다. |

---

## 참고: 미리 피한 문제

실제로 오류가 나지는 않았지만, 설계할 때 고려한 내용입니다.

| 항목 | 내용 |
|---|---|
| 여러 SQL 문 한 번에 실행 | Neon의 HTTP 방식(`neon()`)은 한 번에 SQL 문 하나만 실행합니다. 그래서 `seed.js`는 WebSocket 방식의 `Pool`을 써서 `seed.sql` 전체를 한 번에 실행합니다. |
| BIGINT가 문자열로 옴 | `recipes.id`는 BIGINT라서 JSON 응답에 `"7080727"`처럼 문자열로 옵니다. 프론트에서 숫자 비교를 할 때 주의해야 합니다. |
| 다른 주소에서 API 호출 | 다른 포트나 도메인의 프론트에서 API를 직접 부를 수 있도록 CORS 헤더를 넣었습니다. 허용할 주소는 `.env`의 `CORS_ORIGIN`으로 정합니다. |
| 이미지 외부 링크 | 레시피 사진은 원본 사이트 서버에서 직접 불러옵니다. 막힐 가능성에 대비해 `referrerPolicy="no-referrer"`를 지정했습니다. 브라우저에서 실제로 뜨는지는 아직 확인하지 않았습니다. |
| 크롤링 예의 | 크롤링 전에 `robots.txt`를 확인했습니다(`/recipe/` 허용, AI 학습 금지). 요청 사이에 1초 이상 간격을 두었고, 원본 링크(`source_url`)를 저장합니다. 레시피 저작권은 원작성자에게 있으므로 개인 학습용으로만 사용합니다. |

## 검증 방법

| 확인한 것 | 방법 |
|---|---|
| SQL이 오류 없이 실행되는지, 두 번 실행해도 중복이 없는지 | 로컬 Postgres(PGlite)에 `seed.sql`을 두 번 실행 |
| Neon에 데이터가 들어갔는지 | `npm run db:seed` → `recipes 160개`, `recipe_ingredients 1267개` |
| API가 동작하는지 | 서버를 띄워 `/api/categories`, `/api/recipes?q=김치`, `/api/recipes/:id` 요청 |
| 재료 분리 규칙 | `uv run scraper/crawl.py --test` |
| 이메일 중복 확인 API (19번) | 로컬 서버에 없는 이메일·기존 이메일(대문자)·형식 오류로 요청 |
| 자동 배포 (20번) | GitHub Actions의 check·deploy-server·deploy-web이 모두 성공, `fridgeo.pages.dev`가 Neon Auth 주소로 세션을 확인하는지 네트워크 기록으로 확인 |
| 계정 삭제 시 남는 데이터 (22번) | 테스트 계정 삭제 후 계정·세션·프로필·재료·북마크·리뷰·알림 0개 확인 |

