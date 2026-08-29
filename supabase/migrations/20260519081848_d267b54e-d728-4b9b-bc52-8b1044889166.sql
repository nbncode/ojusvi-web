DROP POLICY "Anyone can submit an instructor application" ON public.instructor_applications;

CREATE POLICY "Anyone can submit a valid instructor application"
  ON public.instructor_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(social) BETWEEN 1 AND 200
    AND char_length(whatsapp) BETWEEN 5 AND 20
    AND char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(skill) BETWEEN 1 AND 100
    AND char_length(availability) BETWEEN 1 AND 50
  );