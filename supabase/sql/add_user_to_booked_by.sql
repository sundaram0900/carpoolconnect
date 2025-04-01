
-- Function to add a user to the booked_by array of a ride
CREATE OR REPLACE FUNCTION public.add_user_to_booked_by(ride_id_param UUID, user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.rides
  SET booked_by = array_append(COALESCE(booked_by, '{}'), user_id_param)
  WHERE id = ride_id_param 
    AND (booked_by IS NULL OR NOT (user_id_param = ANY(booked_by)));
END;
$$;

-- Function to get detailed receipt information
CREATE OR REPLACE FUNCTION public.get_receipt_details(receipt_id_param UUID)
RETURNS TABLE (
    id UUID,
    booking_id UUID,
    amount NUMERIC,
    payment_method TEXT,
    payment_status TEXT,
    transaction_id TEXT,
    created_at TIMESTAMPTZ,
    booking_details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.booking_id,
        r.amount,
        r.payment_method,
        r.payment_status,
        r.transaction_id,
        r.created_at,
        jsonb_build_object(
            'id', b.id,
            'seats', b.seats,
            'contact_phone', b.contact_phone,
            'notes', b.notes,
            'created_at', b.created_at,
            'ride', jsonb_build_object(
                'id', rd.id,
                'start_city', rd.start_city,
                'end_city', rd.end_city,
                'start_address', rd.start_address,
                'end_address', rd.end_address,
                'date', rd.date,
                'time', rd.time,
                'price', rd.price,
                'driver', jsonb_build_object(
                    'id', p.id,
                    'name', p.name,
                    'email', p.email,
                    'avatar', p.avatar,
                    'phone', p.phone,
                    'rating', p.rating
                )
            ),
            'user', jsonb_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email,
                'avatar', u.avatar,
                'phone', u.phone
            )
        ) AS booking_details
    FROM 
        public.receipts r
    JOIN 
        public.bookings b ON r.booking_id = b.id
    JOIN 
        public.rides rd ON b.ride_id = rd.id
    JOIN 
        public.profiles p ON rd.driver_id = p.id
    JOIN 
        public.profiles u ON b.user_id = u.id
    WHERE 
        r.id = receipt_id_param;
END;
$$;
