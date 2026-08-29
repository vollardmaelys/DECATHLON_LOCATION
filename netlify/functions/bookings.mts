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

const timeSlots = new Set(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']);
const rentalDurations = new Set(['half-day', 'day']);
const db = getDatabase();

type BookingRequest = {
  equipmentId?: unknown;
  date?: unknown;
  time?: unknown;
  duration?: unknown;
  name?: unknown;
  email?: unknown;
};

type ValidBookingRequest = {
  equipmentId: string;
  date: string;
  time: string;
  duration: 'half-day' | 'day';
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
    && typeof data.duration === 'string'
    && rentalDurations.has(data.duration)
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
      const rows = await db.sql<{ start_time: string; duration: string }>`
        SELECT start_time, duration
        FROM bookings
        WHERE equipment_id = ${equipmentId}
          AND rental_date = ${date}
          AND status = 'confirmed'
        ORDER BY start_time
      `;
      const hasFullDayBooking = rows.some((row) => row.duration === 'day');
      return json({ bookedSlots: hasFullDayBooking ? [...timeSlots] : rows.map((row) => row.start_time.slice(0, 5)) });
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
      WITH booking_lock AS (
        SELECT pg_advisory_xact_lock(hashtext(${data.equipmentId} || ':' || ${data.date}))
      ),
      conflicting_booking AS (
        SELECT 1
        FROM bookings, booking_lock
        WHERE equipment_id = ${data.equipmentId}
          AND rental_date = ${data.date}
          AND (duration = 'day' OR ${data.duration} = 'day' OR start_time = ${data.time})
        LIMIT 1
      ),
      inserted_booking AS (
        INSERT INTO bookings (id, equipment_id, rental_date, start_time, duration, customer_name, customer_email)
        SELECT
          ${id},
          ${data.equipmentId},
          ${data.date},
          ${data.time},
          ${data.duration},
          ${data.name.trim()},
          ${data.email.trim().toLowerCase()}
        FROM booking_lock
        WHERE NOT EXISTS (SELECT 1 FROM conflicting_booking)
        ON CONFLICT (equipment_id, rental_date, start_time) DO NOTHING
        RETURNING id
      )
      SELECT id FROM inserted_booking
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
