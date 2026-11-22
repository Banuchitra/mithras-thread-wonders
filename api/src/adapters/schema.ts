// D1 (SQLite) schema — Drizzle generates the SQL migrations in api/migrations from this file.
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  email: text('email').primaryKey(), // lower-case
  displayName: text('display_name').notNull().default(''),
  role: text('role', { enum: ['admin', 'editor', 'customer'] }).notNull().default('customer'),
  disabled: integer('disabled', { mode: 'boolean' }).notNull().default(false),
  passwordHash: text('password_hash'),
  mustChangePassword: integer('must_change_password', { mode: 'boolean' }).notNull().default(false),
  tokenVersion: integer('token_version').notNull().default(0),
  failedLogins: integer('failed_logins').notNull().default(0),
  lockedUntil: text('locked_until'),
  createdAt: text('created_at').notNull(),
  lastLoginAt: text('last_login_at'),
});

export const passwordResets = sqliteTable('password_resets', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  tokenHash: text('token_hash').unique(),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at'),
  usedAt: text('used_at'),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
