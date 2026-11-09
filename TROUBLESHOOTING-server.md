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
