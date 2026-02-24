-- Add new values to document_type enum
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'passport';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'secondary_id';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'power_of_attorney';
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'legal';
