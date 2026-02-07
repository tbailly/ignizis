
ALTER TABLE public.companies ADD COLUMN slug text;

UPDATE public.companies SET slug = lower(replace(name, ' ', '-'));

ALTER TABLE public.companies ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.companies ADD CONSTRAINT companies_slug_unique UNIQUE (slug);
