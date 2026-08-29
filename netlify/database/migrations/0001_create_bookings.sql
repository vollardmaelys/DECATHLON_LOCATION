CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  equipment_id TEXT NOT NULL,
  rental_date DATE NOT NULL,
  start_time TIME NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_slot_unique UNIQUE (equipment_id, rental_date, start_time)
);

CREATE INDEX idx_bookings_equipment_date
ON bookings (equipment_id, rental_date);
