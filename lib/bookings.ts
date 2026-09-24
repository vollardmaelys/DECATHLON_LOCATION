import { env } from 'cloudflare:workers';
import { bookingsIndexSql, bookingsTableSql } from '@/db/schema';

export const equipmentIds = new Set(['tennis-tr500', 'padel-hybrid-metal', 'surf-mousse-86', 'vae-riverside-500e']);
export const timeSlots = new Set(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']);

let schemaReady: Promise<void> | undefined;

export function ensureBookingsSchema() {
  schemaReady ??= (async () => {
    await env.DB.batch([env.DB.prepare(bookingsTableSql), env.DB.prepare(bookingsIndexSql)]);
    await env.DB.prepare('PRAGMA optimize').run();
  })();
  return schemaReady;
}

export function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
