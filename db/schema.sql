-- 1. 사용자 프로필 (로그인 정보·비밀번호는 Neon Auth가 관리)
CREATE TABLE users (
  id                UUID PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,                 -- 이름이자 닉네임
  profile_image_url TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 팔로우
CREATE TABLE follows (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- 나
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- 내가 팔로우한 사람
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, following_id),
  CHECK (user_id <> following_id)
);
CREATE INDEX follows_following_idx ON follows (following_id);  -- 내 팔로워 목록

-- 3. 재료 사전
CREATE TABLE ingredient_catalog (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,
  image_url       TEXT,
  icon_url        TEXT,
  shelf_life_days INT CHECK (shelf_life_days > 0)  -- 등록일로부터 기본 보관 일수
);

-- 4. 내 냉장고 재료
CREATE TABLE ingredients (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catalog_id  BIGINT REFERENCES ingredient_catalog(id) ON DELETE SET NULL,
  quantity    NUMERIC NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit        TEXT NOT NULL DEFAULT '개',           -- 개, g, ml, 단, 모 ...
  storage     TEXT NOT NULL CHECK (storage IN ('실온', '냉장', '냉동')),
  expiry_date DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ingredients_user_idx ON ingredients (user_id, expiry_date);

-- 5. 레시피 카테고리
CREATE TABLE categories (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  icon_url TEXT
);

-- 6. 레시피
CREATE TABLE recipes (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL = 초기 데이터 또는 탈퇴한 사용자
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  servings    INT CHECK (servings > 0),
  cook_time   INT CHECK (cook_time > 0),                     -- 분 단위
  difficulty  TEXT CHECK (difficulty IN ('쉬움', '보통', '어려움')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX recipes_user_idx     ON recipes (user_id);
CREATE INDEX recipes_category_idx ON recipes (category_id);

-- 7. 레시피 재료
CREATE TABLE recipe_ingredients (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id  BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position   INT NOT NULL,
  name       TEXT NOT NULL,                                               -- 화면 표시용 원문 이름
  amount     TEXT,                                                        -- '2개 (220g)', '약간'
  UNIQUE (recipe_id, position)
);

-- 8. 레시피 조리 단계
CREATE TABLE recipe_steps (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position  INT NOT NULL,
  text      TEXT NOT NULL,
  image_url TEXT,
  UNIQUE (recipe_id, position)
);

-- 9. 북마크
CREATE TABLE recipe_bookmarks (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id  BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

-- 10. 리뷰
CREATE TABLE reviews (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id  BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)          -- 레시피당 한 사람 리뷰 1개
);
CREATE INDEX reviews_recipe_idx ON reviews (recipe_id);

-- 11. 알림
CREATE TABLE notifications (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,       -- 받는 사람
  type          TEXT NOT NULL CHECK (type IN ('expiry', 'follow', 'review')),
  message       TEXT NOT NULL,
  ingredient_id BIGINT REFERENCES ingredients(id) ON DELETE CASCADE,       -- 유통기한 알림
  recipe_id     BIGINT REFERENCES recipes(id) ON DELETE CASCADE,           -- 리뷰 알림
  actor_id      UUID REFERENCES users(id) ON DELETE CASCADE,               -- 팔로우하거나 리뷰 단 사람
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

