-- Supabase schema for student progress tracking
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  progress JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index on student name for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_progress_name
ON student_progress(student_name);

-- Function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function on updates
DROP TRIGGER IF EXISTS update_student_progress_updated_at ON student_progress;
CREATE TRIGGER update_student_progress_updated_at
  BEFORE UPDATE ON student_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (adjust as needed for your auth setup)
CREATE POLICY "Allow all operations" ON student_progress
  FOR ALL USING (true) WITH CHECK (true);
