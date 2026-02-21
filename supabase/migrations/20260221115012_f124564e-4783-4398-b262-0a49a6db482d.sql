
-- Add column without constraint first
ALTER TABLE public.requests
  ADD COLUMN request_number integer NOT NULL DEFAULT 0;

-- Assign unique numbers to existing rows
UPDATE public.requests SET request_number = 1000 + (row_number - 1)
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number
  FROM public.requests
) sub
WHERE public.requests.id = sub.id;

-- Now add the check constraint
ALTER TABLE public.requests
  ADD CONSTRAINT requests_number_range CHECK (request_number >= 1000 AND request_number <= 9999);

-- Add unique index
CREATE UNIQUE INDEX requests_number_unique ON public.requests (request_number);

-- Remove the default since we generate it in application code
ALTER TABLE public.requests ALTER COLUMN request_number DROP DEFAULT;
