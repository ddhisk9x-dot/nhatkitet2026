-- Add bonus_stars column (default 0)
ALTER TABLE students ADD COLUMN IF NOT EXISTS bonus_stars FLOAT DEFAULT 0;

-- Add completed_hidden_tasks column (array of text, default empty)
ALTER TABLE students ADD COLUMN IF NOT EXISTS completed_hidden_tasks TEXT[] DEFAULT '{}';
