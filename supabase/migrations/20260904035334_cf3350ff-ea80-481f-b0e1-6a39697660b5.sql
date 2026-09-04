CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL CHECK (area IN ('cafe','cowork')),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message text NOT NULL CHECK (char_length(message) <= 1000),
  contact text CHECK (contact IS NULL OR char_length(contact) <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.feedback TO anon;
GRANT INSERT ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
ON public.feedback FOR INSERT TO anon, authenticated
WITH CHECK (true);