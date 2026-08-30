ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS duration TEXT NOT NULL DEFAULT 'half-day';

ALTER TABLE bookings
  ADD CONSTRAINT bookings_duration_valid CHECK (duration IN ('half-day', 'day'));
