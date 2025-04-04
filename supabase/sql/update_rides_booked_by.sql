
-- Add booked_by column to rides table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'rides'
        AND column_name = 'booked_by'
    ) THEN
        ALTER TABLE public.rides
        ADD COLUMN booked_by UUID[] DEFAULT '{}';
    END IF;
END
$$;
