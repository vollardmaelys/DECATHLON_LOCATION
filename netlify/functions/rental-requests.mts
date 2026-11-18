import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { validRentalRequest } from '../../lib/rental-request';

export default async (request: Request) => {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  let data: unknown;
  try { data = await request.json(); } catch { return Response.json({ error: 'Demande invalide.' }, { status: 400 }); }
  if (!validRentalRequest(data)) return Response.json({ error: 'Vérifie les dates et tes coordonnées.' }, { status: 400 });
  try {
    const db = getDatabase();
    await db.sql`CREATE TABLE IF NOT EXISTS rental_requests (
      id TEXT PRIMARY KEY, equipment_id TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
      start_time TEXT NOT NULL, duration TEXT NOT NULL, destination TEXT NOT NULL,
      customer_name TEXT NOT NULL, customer_email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`;
    const id = crypto.randomUUID();
    await db.sql`INSERT INTO rental_requests (id, equipment_id, start_date, end_date, start_time, duration, destination, customer_name, customer_email)
      VALUES (${id}, ${data.equipmentId}, ${data.date}, ${data.returnDate}, ${data.time}, ${data.duration}, ${data.destination}, ${data.name.trim()}, ${data.email.trim().toLowerCase()})`;
    return Response.json({ id, status: 'pending' }, { status: 201 });
  } catch { return Response.json({ error: 'La demande n’a pas pu être enregistrée. Réessaie ou contacte le magasin.' }, { status: 503 }); }
};
export const config: Config = { path: '/api/rental-requests' };
