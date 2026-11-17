import { pgSchema, pgTable, index, foreignKey, unique, check, bigint, uuid, timestamp, text, boolean, numeric, date, integer, smallint, uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Neon Auth 가 관리하는 사용자 테이블. users.id 외래키가 가리키기만 하고, drizzle 은 이 스키마를 만들거나 고치지 않음 (drizzle.config.js 의 schemaFilter)
const user = pgSchema("neon_auth").table("user", { id: uuid().primaryKey() })

// 문자 인증번호 웹훅 처리 기록 (Neon 재시도로 같은 이벤트의 문자가 두 번 가지 않게). 하루 지난 행은 서버가 지움
export const otpEvents = pgTable("otp_events", {
	eventId: text("event_id").primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
})



export const follows = pgTable("follows", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "follows_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	followingId: uuid("following_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("follows_following_idx").using("btree", table.followingId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "follows_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.followingId],
			foreignColumns: [users.id],
			name: "follows_following_id_fkey"
		}).onDelete("cascade"),
	unique("follows_user_id_following_id_key").on(table.userId, table.followingId),
	check("follows_check", sql`user_id <> following_id`),
]);

export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	name: text().notNull(),
	profileImageUrl: text("profile_image_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	expiryAlert: boolean("expiry_alert").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [user.id],
			name: "users_id_fkey"
		}).onDelete("cascade"),
]);

export const ingredients = pgTable("ingredients", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "ingredients_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	catalogId: bigint("catalog_id", { mode: "number" }),
	quantity: numeric().default('1').notNull(),
	unit: text().default('개').notNull(),
	storage: text().notNull(),
	expiryDate: date("expiry_date"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ingredients_user_idx").using("btree", table.userId.asc().nullsLast().op("date_ops"), table.expiryDate.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ingredients_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.catalogId],
			foreignColumns: [ingredientCatalog.id],
			name: "ingredients_catalog_id_fkey"
		}).onDelete("set null"),
	check("ingredients_quantity_check", sql`quantity >= (0)::numeric`),
	check("ingredients_storage_check", sql`storage = ANY (ARRAY['실온'::text, '냉장'::text, '냉동'::text])`),
]);

export const recipeIngredients = pgTable("recipe_ingredients", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "recipe_ingredients_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	recipeId: bigint("recipe_id", { mode: "number" }).notNull(),
	position: integer().notNull(),
	name: text().notNull(),
	amount: text(),
}, (table) => [
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "recipe_ingredients_recipe_id_fkey"
		}).onDelete("cascade"),
	unique("recipe_ingredients_recipe_id_position_key").on(table.recipeId, table.position),
]);

export const recipes = pgTable("recipes", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "recipes_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	title: text().notNull(),
	description: text(),
	imageUrl: text("image_url"),
	userId: uuid("user_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	categoryId: bigint("category_id", { mode: "number" }),
	servings: integer(),
	cookTime: integer("cook_time"),
	difficulty: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("recipes_category_idx").using("btree", table.categoryId.asc().nullsLast().op("int8_ops")),
	index("recipes_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "recipes_user_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "recipes_category_id_fkey"
		}).onDelete("set null"),
	check("recipes_servings_check", sql`servings > 0`),
	check("recipes_cook_time_check", sql`cook_time > 0`),
	check("recipes_difficulty_check", sql`difficulty = ANY (ARRAY['쉬움'::text, '보통'::text, '어려움'::text])`),
]);

export const categories = pgTable("categories", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "categories_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	name: text().notNull(),
	iconUrl: text("icon_url"),
}, (table) => [
	unique("categories_name_key").on(table.name),
]);

export const ingredientCatalog = pgTable("ingredient_catalog", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "ingredient_catalog_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	name: text().notNull(),
	imageUrl: text("image_url"),
	iconUrl: text("icon_url"),
	shelfLifeDays: integer("shelf_life_days"),
	category: text(),
}, (table) => [
	unique("ingredient_catalog_name_key").on(table.name),
	check("ingredient_catalog_shelf_life_days_check", sql`shelf_life_days > 0`),
]);

export const recipeSteps = pgTable("recipe_steps", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "recipe_steps_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	recipeId: bigint("recipe_id", { mode: "number" }).notNull(),
	position: integer().notNull(),
	text: text().notNull(),
	imageUrl: text("image_url"),
}, (table) => [
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "recipe_steps_recipe_id_fkey"
		}).onDelete("cascade"),
	unique("recipe_steps_recipe_id_position_key").on(table.recipeId, table.position),
]);

export const recipeBookmarks = pgTable("recipe_bookmarks", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "recipe_bookmarks_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	recipeId: bigint("recipe_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "recipe_bookmarks_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "recipe_bookmarks_recipe_id_fkey"
		}).onDelete("cascade"),
	unique("recipe_bookmarks_user_id_recipe_id_key").on(table.userId, table.recipeId),
]);

export const reviews = pgTable("reviews", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "reviews_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	recipeId: bigint("recipe_id", { mode: "number" }).notNull(),
	rating: smallint().notNull(),
	comment: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("reviews_recipe_idx").using("btree", table.recipeId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reviews_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "reviews_recipe_id_fkey"
		}).onDelete("cascade"),
	unique("reviews_user_id_recipe_id_key").on(table.userId, table.recipeId),
	check("reviews_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const notifications = pgTable("notifications", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "notifications_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	userId: uuid("user_id").notNull(),
	type: text().notNull(),
	message: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ingredientId: bigint("ingredient_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	recipeId: bigint("recipe_id", { mode: "number" }),
	actorId: uuid("actor_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
	dismissedAt: timestamp("dismissed_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("notifications_expiry_once").using("btree", table.ingredientId.asc().nullsLast().op("int8_ops")).where(sql`(type = 'expiry'::text)`),
	index("notifications_user_idx").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ingredientId],
			foreignColumns: [ingredients.id],
			name: "notifications_ingredient_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "notifications_recipe_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [users.id],
			name: "notifications_actor_id_fkey"
		}).onDelete("cascade"),
	check("notifications_type_check", sql`type = ANY (ARRAY['expiry'::text, 'follow'::text, 'review'::text])`),
]);
