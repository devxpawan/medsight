
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP POLICY "Medicine images are publicly accessible" ON storage.objects;
CREATE POLICY "Medicine images are readable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'medicine-images' AND (storage.foldername(name))[1] IS NOT NULL);
