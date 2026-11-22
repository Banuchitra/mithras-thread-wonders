// Cloudflare Worker entry: wires the D1 store into the app.
import { createApp } from './app';
import { D1Store } from './adapters/d1-store';

export interface Env {
  DB: D1Database;
  SUPER_ADMIN_EMAIL: string;
  SESSION_SECRET: string;
  ALLOWED_ORIGINS: string;
  SITE_URL: string;
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return new Response('SESSION_SECRET is not configured', { status: 500 });
    return createApp({
      store: new D1Store(env.DB),
      sessionSecret: env.SESSION_SECRET,
      superAdminEmail: env.SUPER_ADMIN_EMAIL,
      allowedOrigins: env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
      siteUrl: env.SITE_URL,
    }).fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
