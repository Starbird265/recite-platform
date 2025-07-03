-- users come from Auth
create table centres (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  referral_code text unique not null,
  created_at timestamptz default now()
);

create table videos (
  id uuid primary key default uuid_generate_v4(),
  module_id text not null,
  title text not null,
  youtube_id text not null,
  created_at timestamptz default now()
);

create table quizzes (
  id uuid primary key default uuid_generate_v4(),
  module_id text not null,
  question text not null,
  choices text[] not null,
  correct_index int not null,
  created_at timestamptz default now()
);

create table enquiries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text,
  email text,
  phone text,
  created_at timestamptz default now()
);

create table referrals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  centre_id uuid references centres(id),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table centres enable row level security;
alter table videos enable row level security;
alter table quizzes enable row level security;
alter table enquiries enable row level security;
alter table referrals enable row level security;