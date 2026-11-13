// 조미료 목록 → 아이콘(public/condiments/*.svg)과 DB 반영 SQL(db/condiments.sql)을 만든다
// 실행: node scripts/condiments.mjs  (조미료를 더하거나 고치면 다시 실행)
// DB 반영까지: node --env-file=.env scripts/condiments.mjs --apply
import { mkdirSync, writeFileSync } from "node:fs";

// [이름, 파일 이름, 병 모양, 내용물 색, 기본 보관 일수, 사진(없으면 null)]
// 병 모양: bottle(긴 병) squeeze(짜는 병) jar(뚜껑 병) shaker(뿌리는 통) tube(튜브) tub(장류 통)
// 보관 일수·사진이 null 이면 이미 사전에 있는 값을 그대로 둔다 (사진은 비어 있을 때만 채움)
export const condiments = [
  // --- 원래 사전에 있던 조미료: 분류와 아이콘만 붙임 ---
  ["소금", "salt.png"], ["후추", "pepper.png"], ["케첩", "ketchup.png"], ["캐첩", "ketchup.png"],
  ["마요네즈", "mayo.png"], ["고추", "chili.png"], ["허브", "herbs.png"],
  ["설탕", "sugar", "jar", "#ffffff"], ["고춧가루", "gochugaru", "jar", "#d8402f"], ["통깨", "sesame", "jar", "#e9d3a1"],
  ["간장", "soy-sauce", "bottle", "#4a2a1a"], ["진간장", "jin-soy-sauce", "bottle", "#3a1f14"], ["국간장", "soup-soy-sauce", "bottle", "#6b4226"],
  ["고추장", "gochujang", "tub", "#c8372d"], ["된장", "doenjang", "tub", "#b07a3c"], ["쌈장", "ssamjang", "tub", "#9c5a2e"],
  ["굴소스", "oyster-sauce", "bottle", "#5a3320"], ["참치액", "tuna-extract", "bottle", "#c98a3a"], ["멸치액젓", "anchovy-sauce", "bottle", "#b8792f"],
  ["새우젓", "salted-shrimp", "jar", "#f3b7b0"], ["식초", "vinegar", "bottle", "#f3ecc0"], ["맛술", "mirin", "bottle", "#f0dc9a"],
  ["참기름", "sesame-oil", "bottle", "#b9772a"], ["들기름", "perilla-oil", "bottle", "#c9983a"], ["식용유", "cooking-oil", "bottle", "#f6d95a"],
  ["올리브유", "olive-oil", "bottle", "#b9c34a"], ["올리고당", "oligo-syrup", "squeeze", "#f4e3a6"], ["물엿", "corn-syrup", "squeeze", "#f1ecd4"],
  ["꿀", "honey", "jar", "#f0a92e"], ["알룰로스", "allulose", "squeeze", "#f7efcf"], ["매실청", "plum-syrup", "jar", "#c9b24a"],
  ["다진마늘", "minced-garlic", "jar", "#f3e7c4"], ["머스타드", "mustard", "squeeze", "#f2c230"], ["스리라차소스", "sriracha", "squeeze", "#d93a2b", null, null, "#3f9a4a"],
  ["토마토소스", "tomato-sauce", "jar", "#d94a34"], ["쯔유", "tsuyu", "bottle", "#4b2c1d"], ["와사비", "wasabi", "tube", "#8fbf4f"],
  ["레몬즙", "lemon-juice", "bottle", "#f7e04e"], ["코인육수", "coin-stock", "jar", "#c8a56a"], ["치킨스톡", "chicken-stock", "jar", "#f0c95a"],
  ["카레가루", "curry-powder", "shaker", "#e2a52a"], ["파슬리가루", "parsley", "shaker", "#6fa84a"],

  // --- 새로 넣는 조미료 50가지 ---
  ["MSG", "msg", "shaker", "#ffffff", 1095, "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Ajinomoto_msg.jpg/500px-Ajinomoto_msg.jpg"],
  ["다시다", "dashida", "jar", "#c98d4a", 365],
  ["맛소금", "seasoned-salt", "shaker", "#fdf6e3", 1095],
  ["굵은소금", "coarse-salt", "jar", "#eef1f4", 1095],
  ["허브솔트", "herb-salt", "shaker", "#dfe6c3", 730],
  ["흑설탕", "brown-sugar", "jar", "#8a5a2b", 1095, "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/%E7%8E%BB%E7%92%83%E7%BD%90%E4%B8%AD%E7%9A%84%E9%BB%91%E7%B3%96.jpg/500px-%E7%8E%BB%E7%92%83%E7%BD%90%E4%B8%AD%E7%9A%84%E9%BB%91%E7%B3%96.jpg"],
  ["스테비아", "stevia", "shaker", "#e9f3df", 730, "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Rio_stevia-xylitol_nl-fr-2026.jpg/500px-Rio_stevia-xylitol_nl-fr-2026.jpg"],
  ["통후추", "peppercorn", "shaker", "#3b3330", 730, "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Grinder_Pepper_%2811006524956%29.jpg/500px-Grinder_Pepper_%2811006524956%29.jpg"],
  ["흰후추", "white-pepper", "shaker", "#ece4d2", 730, "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Burdall%27s_Ground_White_Pepper_-_TWCMS-G12129_%2816692709481%29.jpg/500px-Burdall%27s_Ground_White_Pepper_-_TWCMS-G12129_%2816692709481%29.jpg"],
  ["데리야끼소스", "teriyaki", "bottle", "#5b3018", 365],
  ["돈까스소스", "tonkatsu-sauce", "squeeze", "#6a3a1d", 365, "https://upload.wikimedia.org/wikipedia/commons/5/55/Tonkatsu_sauce_by_arthit_crop.jpg"],
  ["우스터소스", "worcestershire", "bottle", "#4a2716", 730, "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Dimitri_Torterat_-_Bottle_of_Worcestershire_sauce.jpg/500px-Dimitri_Torterat_-_Bottle_of_Worcestershire_sauce.jpg"],
  ["바비큐소스", "bbq-sauce", "squeeze", "#8c2f1c", 365, "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Hunts-Barbecue-Sauce.jpg/500px-Hunts-Barbecue-Sauce.jpg"],
  ["스위트칠리소스", "sweet-chili", "bottle", "#e8603a", 365],
  ["핫소스", "hot-sauce", "bottle", "#d8321f", 730, "https://upload.wikimedia.org/wikipedia/commons/f/fd/Tabasco_bottle_2013.jpeg", "#3f9a4a"],
  ["두반장", "doubanjiang", "jar", "#a8321f", 365, "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Pixian_Doubanjiang.png/500px-Pixian_Doubanjiang.png"],
  ["춘장", "chunjang", "tub", "#2c1c16", 365, "https://upload.wikimedia.org/wikipedia/commons/1/1a/Chunjang_%28cropped%29.jpg"],
  ["초고추장", "cho-gochujang", "squeeze", "#cf3a2c", 180],
  ["미소된장", "miso", "tub", "#d2a05a", 180],
  ["까나리액젓", "sand-lance-sauce", "bottle", "#c7903c", 730, "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Aekjeot.jpg/500px-Aekjeot.jpg"],
  ["피시소스", "fish-sauce", "bottle", "#b8752a", 730, "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Thaifishsauce0609.jpg/500px-Thaifishsauce0609.jpg"],
  ["발사믹식초", "balsamic", "bottle", "#3a1a1c", 1095, "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Traditional_Balsamic_Vinegars_of_Modena_%28right%29_and_Reggio_Emilia_%28left%29.jpg/500px-Traditional_Balsamic_Vinegars_of_Modena_%28right%29_and_Reggio_Emilia_%28left%29.jpg"],
  ["사과식초", "apple-vinegar", "bottle", "#e8b85a", 730, "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/02023_0257_Apple_cider_vinegar.jpg/500px-02023_0257_Apple_cider_vinegar.jpg"],
  ["포도씨유", "grapeseed-oil", "bottle", "#dfe27a", 365, "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Grapeseed-oil.jpg/500px-Grapeseed-oil.jpg"],
  ["카놀라유", "canola-oil", "bottle", "#f4dd6a", 365, "https://upload.wikimedia.org/wikipedia/commons/e/eb/CanolaOil_bottle.jpg"],
  ["아보카도오일", "avocado-oil", "bottle", "#a9b84a", 365],
  ["고추기름", "chili-oil", "bottle", "#d6452a", 180, "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/S%26B_La-Yu_chili_oil_-_Momotaro_Rahmen_%282620979084%29.jpg/500px-S%26B_La-Yu_chili_oil_-_Momotaro_Rahmen_%282620979084%29.jpg"],
  ["트러플오일", "truffle-oil", "bottle", "#c9b85a", 365, "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Huile_aux_truffes_blanches.jpg/500px-Huile_aux_truffes_blanches.jpg", "#2c2a28"],
  ["메이플시럽", "maple-syrup", "bottle", "#b8651f", 365, "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Maple_syrup_bottle_Citadell%C3%A9_20190404_080933.jpg/500px-Maple_syrup_bottle_Citadell%C3%A9_20190404_080933.jpg"],
  ["아가베시럽", "agave-syrup", "squeeze", "#e3a94a", 730, "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Agave_Syrup.jpg/500px-Agave_Syrup.jpg"],
  ["조청", "jocheong", "jar", "#a9641f", 365],
  ["유자청", "yuja-syrup", "jar", "#f3c53a", 365],
  ["연겨자", "korean-mustard", "tube", "#f0c81e", 365],
  ["홀그레인머스타드", "wholegrain-mustard", "jar", "#c9a53a", 365],
  ["허니머스타드", "honey-mustard", "squeeze", "#f0cf5a", 180],
  ["타르타르소스", "tartar-sauce", "squeeze", "#f4efd9", 90],
  ["참깨드레싱", "sesame-dressing", "bottle", "#e2c58c", 180],
  ["오리엔탈드레싱", "oriental-dressing", "bottle", "#7a4a26", 180],
  ["바질페스토", "pesto", "jar", "#5f8f3a", 180, "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Jar_of_Pesto.jpg/500px-Jar_of_Pesto.jpg"],
  ["로제소스", "rose-sauce", "jar", "#ee8f6f", 365],
  ["살사소스", "salsa", "jar", "#c9402b", 365, "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Pace_Picante_sauce_%28Medium_salsa%29.jpg/500px-Pace_Picante_sauce_%28Medium_salsa%29.jpg"],
  ["강황가루", "turmeric", "shaker", "#e3a01c", 730],
  ["계피가루", "cinnamon", "shaker", "#a86a3a", 730],
  ["큐민", "cumin", "shaker", "#b08a4a", 730, "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Cumin.JPG/500px-Cumin.JPG"],
  ["파프리카가루", "paprika", "shaker", "#cf4a26", 730],
  ["오레가노", "oregano", "shaker", "#7f9a4f", 730],
  ["마늘가루", "garlic-powder", "shaker", "#f1e4bf", 730],
  ["들깨가루", "perilla-powder", "jar", "#b79a6a", 180],
  ["마라소스", "mala-sauce", "jar", "#b3261c", 365],
  ["호이신소스", "hoisin", "bottle", "#4f2418", 730],
].map(([name, file, shape, color, shelfLife = null, image = null, cap = "#f4f0e8"]) => ({ name, file, shape, color, shelfLife, image, cap }));

// ---------- 아이콘: 기존 아이콘(src 의 케첩·허브 등)과 같은 굵은 갈색 테두리 그림체 ----------
const LINE = "#4a1c1c";
const label = (x, y, w, h, color) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#f4f0e8"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${Math.min(w, h) / 4}" fill="${color}"/>`;
const shine = (x, y, h) => `<path d="M${x} ${y}v${h}" stroke="#fff" stroke-opacity=".45" stroke-width="12"/>`;

const shapes = {
  bottle: ({ color, cap }) => `
    <rect x="222" y="48" width="68" height="46" rx="10" fill="${cap}"/>
    <path d="M230 94h52v62q72 34 72 104v176q0 28-28 28H186q-28 0-28-28V260q0-70 72-104z" fill="${color}"/>
    ${label(190, 290, 132, 110, color)}${shine(184, 250, 30)}`,
  squeeze: ({ color, cap }) => `
    <rect x="243" y="52" width="26" height="46" rx="10" fill="${cap}"/>
    <path d="M232 98h48l28 44H204z" fill="${cap}"/>
    <rect x="182" y="142" width="148" height="36" rx="12" fill="${cap}"/>
    <path d="M200 178h112q44 26 44 70v188q0 28-28 28H184q-28 0-28-28V248q0-44 44-70z" fill="${color}"/>
    ${label(194, 280, 124, 124, color)}${shine(180, 250, 60)}`,
  jar: ({ color, cap }) => `
    <rect x="150" y="96" width="212" height="62" rx="16" fill="${cap}"/>
    <rect x="132" y="158" width="248" height="306" rx="42" fill="${color}"/>
    ${label(176, 250, 160, 130, color)}${shine(158, 206, 70)}`,
  shaker: ({ color, cap }) => `
    <path d="M176 176q0-96 80-96t80 96z" fill="${cap}"/>
    <circle cx="232" cy="132" r="7" fill="${LINE}" stroke="none"/><circle cx="256" cy="112" r="7" fill="${LINE}" stroke="none"/><circle cx="280" cy="132" r="7" fill="${LINE}" stroke="none"/>
    <rect x="164" y="176" width="184" height="288" rx="30" fill="${color}"/>
    ${label(192, 270, 128, 120, color)}${shine(188, 206, 40)}`,
  tube: ({ color, cap }) => `
    <path d="M168 56h176l-22 334H190z" fill="${color}"/>
    <rect x="212" y="390" width="88" height="70" rx="12" fill="${cap}"/>
    ${label(204, 150, 104, 120, color)}${shine(196, 90, 40)}`,
  tub: ({ color, cap }) => `
    <rect x="104" y="170" width="304" height="58" rx="16" fill="${cap}"/>
    <path d="M124 228h264l-20 204q-3 28-31 28H175q-28 0-31-28z" fill="${color}"/>
    ${label(188, 280, 136, 110, color)}${shine(160, 262, 50)}`,
};

const svg = (c) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" stroke="${LINE}" stroke-width="18" stroke-linejoin="round" stroke-linecap="round">${shapes[c.shape](c)}\n</svg>\n`;

// ---------- DB 반영 SQL: 여러 번 실행해도 결과가 같다 ----------
const q = (v) => (v === null ? "NULL" : typeof v === "number" ? v : `'${String(v).replaceAll("'", "''")}'`);
const iconUrl = (c) => `/condiments/${c.shape ? `${c.file}.svg` : c.file}`;

const sql = `-- 조미료 분류 + 아이콘 + 새 조미료. scripts/condiments.mjs 가 만든 파일 (직접 고치지 말 것)
ALTER TABLE ingredient_catalog ADD COLUMN IF NOT EXISTS category TEXT;

INSERT INTO ingredient_catalog (name, category, icon_url, image_url, shelf_life_days) VALUES
${condiments.map((c) => `  (${q(c.name)}, '조미료', ${q(iconUrl(c))}, ${q(c.image)}, ${q(c.shelfLife)})`).join(",\n")}
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  icon_url = EXCLUDED.icon_url,
  image_url = COALESCE(ingredient_catalog.image_url, EXCLUDED.image_url),
  shelf_life_days = COALESCE(ingredient_catalog.shelf_life_days, EXCLUDED.shelf_life_days);
`;

if (import.meta.main) {
  mkdirSync("public/condiments", { recursive: true });
  for (const c of condiments) if (c.shape) writeFileSync(`public/condiments/${c.file}.svg`, svg(c));
  writeFileSync("db/condiments.sql", sql);
  const names = condiments.map((c) => c.name);
  console.assert(new Set(names).size === names.length, "이름이 겹칩니다");
  console.log(`조미료 ${condiments.length}개: 아이콘 ${condiments.filter((c) => c.shape).length}개, db/condiments.sql`);

  // --apply: 만든 SQL 을 .env 의 DATABASE_URL DB 에 반영 (node --env-file=.env scripts/condiments.mjs --apply)
  if (process.argv.includes("--apply")) {
    const { neon } = await import("@neondatabase/serverless");
    const db = neon(process.env.DATABASE_URL);
    const [alter, insert] = sql.replace(/^--.*\n/, "").split(/;\n\n/); // Neon HTTP 는 한 번에 한 문장만 받음
    await db.query(alter);
    await db.query(insert);
    const [row] = await db.query("SELECT count(*)::int AS n FROM ingredient_catalog WHERE category = '조미료'");
    console.log(`DB 반영 완료: 조미료 ${row.n}개`);
  }
}
