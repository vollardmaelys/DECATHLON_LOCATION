import { equipmentIds } from './products';

export type RentalRequest = { equipmentId: string; date: string; returnDate: string; time: string; duration: 'week' | 'month' | 'custom'; destination: string; name: string; email: string };
function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
export function validRentalRequest(value: unknown): value is RentalRequest {
  if (!value || typeof value !== 'object') return false;
  const d = value as Record<string, unknown>;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Tahiti', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return typeof d.equipmentId === 'string' && equipmentIds.has(d.equipmentId)
    && validDate(d.date) && validDate(d.returnDate) && d.date >= today && d.returnDate > d.date
    && ['week', 'month', 'custom'].includes(String(d.duration))
    && typeof d.time === 'string' && /^(08|09|10|11|12|13|14|15|16|17):00$/.test(d.time)
    && typeof d.destination === 'string' && ['Tahiti', 'Moorea · transport en bateau', 'Autre île · à préciser avec le magasin'].includes(d.destination)
    && typeof d.name === 'string' && d.name.trim().length >= 2 && d.name.length <= 150
    && typeof d.email === 'string' && d.email.length <= 254 && /^\S+@\S+\.\S+$/.test(d.email);
}
export const rentalRequestsSchema = `CREATE TABLE IF NOT EXISTS rental_requests (
  id TEXT PRIMARY KEY, equipment_id TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
  start_time TEXT NOT NULL, duration TEXT NOT NULL, destination TEXT NOT NULL,
  customer_name TEXT NOT NULL, customer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;
