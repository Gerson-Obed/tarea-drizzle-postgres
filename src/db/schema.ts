import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tabla de usuarios
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla de tareas (cada tarea pertenece a un usuario)
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relaciones (para usar db.query con joins tipados)
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
