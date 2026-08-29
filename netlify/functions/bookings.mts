import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';

const equipmentIds = new Set([
  'kayak-duo',
  'paddle-11',
  'surf-mousse',
  'tennis-racket',
  'padel-racket',
  'beach-tennis',
]);

const timeSlots = new Set(['08:00', '10:00', '12:00', '14:00', '16:00']);
const db = getDatabase();

type BookingRequest = {
  equipmentId?: unknown;
  date?: unknown;
  time?: unknown;
  name?: unknown;
  email?: unknown;
};

type ValidBookingRequest = {
  equipmentId: string;
  date: string;
  time: string;
  name: string;
  email: string;
};

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidRequest(data: BookingRequest): data is ValidBookingRequest {
  return typeof data.equipmentId === 'string'
    && equipmentIds.has(data.equipmentId)
    && isValidDate(data.date)
    && typeof data.time === 'string'
    && timeSlots.has(data.time)
    && typeof data.name === 'string'
    && data.name.trim().length >= 2
    && typeof data.email === 'string'
    && /^\S+@\S+\.\S+$/.test(data.email);
}

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export default async (request: Request) => {
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const equipmentId = url.searchParams.get('equipmentId');
    const date = url.searchParams.get('date');
    if (!equipmentId || !equipmentIds.has(equipmentId) || !isValidDate(date)) {
      return json({ error: 'Paramètres de disponibilité invalides.' }, 400);
    }

    try {
      const rows = await db.sql<{ start_time: string }>`
        SELECT start_time
        FROM bookings
        WHERE equipment_id = ${equipmentId}
          AND rental_date = ${date}
          AND status = 'confirmed'
        ORDER BY start_time
      `;
      return json({ bookedSlots: rows.map((row) => row.start_time.slice(0, 5)) });
    } catch {
      return json({ error: 'Impossible de charger les disponibilités.' }, 500);
    }
  }

  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
  }

  let data: BookingRequest;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'La demande de réservation est invalide.' }, 400);
  }

  if (!isValidRequest(data)) {
    return json({ error: 'Complète correctement les informations de réservation.' }, 400);
  }

  try {
    const id = crypto.randomUUID();
    const rows = await db.sql<{ id: string }>`
      INSERT INTO bookings (id, equipment_id, rental_date, start_time, customer_name, customer_email)
      VALUES (
        ${id},
        ${data.equipmentId},
        ${data.date},
        ${data.time},
        ${data.name.trim()},
        ${data.email.trim().toLowerCase()}
      )
      ON CONFLICT (equipment_id, rental_date, start_time) DO NOTHING
      RETURNING id
    `;

    if (rows.length === 0) {
      return json({ error: 'Ce créneau vient d’être réservé. Choisis-en un autre.' }, 409);
    }

    return json({ id: rows[0].id }, 201);
  } catch {
    return json({ error: 'La réservation est momentanément indisponible. Réessaie dans un instant.' }, 500);
  }
};

export const config: Config = {
  path: '/api/bookings',
};
