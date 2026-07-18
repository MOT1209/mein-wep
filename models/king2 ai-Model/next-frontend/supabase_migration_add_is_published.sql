-- Add missing is_published column to knowledge_base table
ALTER TABLE knowledge_base 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;

-- Recreate index for the column
DROP INDEX IF EXISTS idx_kb_published;
CREATE INDEX IF NOT EXISTS idx_kb_published ON knowledge_base(is_published);
