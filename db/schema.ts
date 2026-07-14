import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const processes = sqliteTable("processes", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  rut: text("rut").notNull(),
  personName: text("person_name").notNull(),
  company: text("company").notNull(),
  costCenter: text("cost_center").notNull(),
  role: text("role").notNull(),
  workday: text("workday").notNull(),
  startDate: text("start_date").notNull(),
  status: text("status").notNull().default("Iniciado"),
  stage: text("stage").notNull().default("Revisión de RRHH"),
  requiredDocuments: text("required_documents").notNull().default("[]"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditEvents = sqliteTable("audit_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userName: text("user_name").notNull(),
  module: text("module").notNull(),
  action: text("action").notNull(),
  recordId: text("record_id").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
