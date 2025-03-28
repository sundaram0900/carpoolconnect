
-- Create verification_codes table for OTP verification
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    ride_id UUID REFERENCES public.rides(id) NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on verification_codes
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for verification_codes
CREATE POLICY "Users can view their own verification codes"
ON public.verification_codes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) NOT NULL,
    ride_id UUID REFERENCES public.rides(id) NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages they sent or received"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

-- Create the get_user_receipts function
CREATE OR REPLACE FUNCTION public.get_user_receipts(user_id_param UUID)
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
        b.user_id = user_id_param OR rd.driver_id = user_id_param
    ORDER BY 
        r.created_at DESC;
END;
$$;

-- Add real-time capabilities to these tables
ALTER PUBLICATION supabase_realtime ADD TABLE rides;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE verification_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE receipts;
