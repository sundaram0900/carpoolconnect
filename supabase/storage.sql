
-- Create avatars storage bucket if it doesn't exist
DO $$
BEGIN
    -- Check if the bucket already exists
    IF NOT EXISTS (
        SELECT 1
        FROM storage.buckets
        WHERE name = 'avatars'
    ) THEN
        -- Create a public bucket for avatars
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('avatars', 'avatars', true);
        
        -- Set up RLS policies for the bucket
        -- Allow public read access
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Public Read Access',
            'SELECT 1 FROM storage.objects WHERE bucket_id = ''avatars''',
            'avatars'
        );
        
        -- Allow authenticated users to upload their own avatars
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Auth Users Upload Access',
            'INSERT 1 FROM storage.objects WHERE bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(objects.name))[1]',
            'avatars'
        );
    END IF;
END $$;
