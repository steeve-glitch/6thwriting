create table if not exists books (
  id text primary key,
  title text not null,
  author text,
  content text,
  page_count int,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and allow public read access
alter table books enable row level security;

create policy "Public books are viewable by everyone"
  on books for select
  using ( true );

-- Allow inserts (for the upload script, enabling service role to bypass is automatic, but good to be explicit for anon if needed later)
-- For now we rely on service role key bypassing RLS.
