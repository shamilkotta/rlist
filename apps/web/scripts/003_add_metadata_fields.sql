-- Add metadata fields to read_later_items table for URL-fetched content
ALTER TABLE read_later_items 
ADD COLUMN IF NOT EXISTS fetched_title TEXT,
ADD COLUMN IF NOT EXISTS fetched_description TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- Add index for better search performance on fetched content
CREATE INDEX IF NOT EXISTS idx_read_later_items_fetched_title ON read_later_items(fetched_title);
