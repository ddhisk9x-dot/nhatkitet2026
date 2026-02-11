-- Add avatar_config column to students table
alter table public.students 
add column if not exists avatar_config jsonb default '{}'::jsonb;

-- Example config structure:
-- {
--   "base": "chibi_male",    -- or chibi_female
--   "outfit": "aodai_red",
--   "hat": "nonla",
--   "hand": "lixi"
-- }
