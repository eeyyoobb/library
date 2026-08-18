import {
  varchar,
  uuid,
  integer,
  text,
  pgTable,
  date,
  pgEnum,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const STATUS_ENUM = pgEnum("status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const ROLE_ENUM = pgEnum("role", ["USER", "ADMIN"]);
export const BORROW_STATUS_ENUM = pgEnum("borrow_status", [
  "BORROWED",
  "RETURNED",
]);

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  fullName: varchar("full_name", { length: 255 }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  telegramUsername: text("university_card"),
  status: STATUS_ENUM("status").default("PENDING"),
  role: ROLE_ENUM("role").default("USER"),
  lastActivityDate: date("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
  telegramId: text("university_id").notNull().unique(),
});

export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom().notNull().unique(),

  title: varchar("title", { length: 255 }).notNull(),

  author: varchar("author", { length: 255 }).notNull(),

  genre: text("genre").notNull().default("spiritual"),

  category: varchar("category", { length: 100 }).notNull(),

  subcategory: varchar("subcategory", {
    length: 100,
  }),

  language: varchar("language", {
    length: 20,
  })
    .notNull()
    .default("am"),

  translated: boolean("translated").notNull().default(false),

  translator: varchar("translator", {
    length: 255,
  }),

  rating: integer("rating").notNull().default(1),

  keywords: text("keywords").array().notNull().default([]),

  topics: text("topics").array().notNull().default([]),

  audience: varchar("audience", {
    length: 50,
  })
    .notNull()
    .default("general"),

  tradition: varchar("tradition", {
    length: 50,
  })
    .notNull()
    .default("christian"),

  coverColor: varchar("cover_color", {
    length: 7,
  })
    .notNull()
    .default("#000000"),

  description: text("description").notNull(),

  summary: text("summary").notNull(),
  coverUrl: text("cover_url").notNull(),

  packageUrl: text("package_url").notNull(),

  uploader: text("uploader").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

export const borrowRecords = pgTable("borrow_records", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  bookId: uuid("book_id")
    .references(() => books.id)
    .notNull(),
  borrowDate: timestamp("borrow_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  status: BORROW_STATUS_ENUM("status").default("BORROWED").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
