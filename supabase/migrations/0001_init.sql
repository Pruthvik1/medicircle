-- medicircle core schema. Run in the Supabase SQL editor or `supabase db push`.

create type user_role as enum ('patient', 'doctor', 'staff');
create type appointment_status as enum
  ('pending', 'approved', 'declined', 'cancelled', 'completed', 'no_show');
create type queue_status as enum ('waiting', 'in_consult', 'done', 'skipped');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'patient',
  full_name text not null,
  phone text,
  avatar_url text,
  date_of_birth date,
  gender text,
  blood_group text,
  allergies text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table clinics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,           -- used in the QR code URL
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create table doctors (
  id uuid primary key references profiles on delete cascade,
  clinic_id uuid references clinics on delete set null,
  specialty text not null,
  registration_no text,
  bio text,
  years_experience int,
  consultation_fee numeric(10, 2),
  auto_approve boolean not null default false,
  rating_avg numeric(3, 2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now()
);

create table availability (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes smallint not null default 15
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors,
  patient_id uuid not null references profiles,
  starts_at timestamptz not null,
  status appointment_status not null default 'pending',
  reason text,
  fee numeric(10, 2),
  created_at timestamptz not null default now(),
  unique (doctor_id, starts_at)
);

create table queue_entries (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics,
  doctor_id uuid not null references doctors,
  patient_id uuid references profiles,  -- null for manual walk-ins
  walk_in_name text,
  appointment_id uuid references appointments,
  token int not null,
  status queue_status not null default 'waiting',
  joined_at timestamptz not null default now()
);
create index on queue_entries (doctor_id, status, joined_at);

create table doctor_reviews (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors on delete cascade,
  patient_id uuid not null references profiles,
  appointment_id uuid not null unique references appointments,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table doctor_rewards (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors on delete cascade,
  title text not null,                 -- e.g. "Top Rated 2026"
  description text,
  awarded_at date not null default current_date
);

-- Keep doctors.rating_avg / rating_count in sync with reviews.
create function refresh_doctor_rating() returns trigger language plpgsql as $$
declare d uuid := coalesce(new.doctor_id, old.doctor_id);
begin
  update doctors set
    rating_avg = coalesce((select round(avg(rating), 2) from doctor_reviews where doctor_id = d), 0),
    rating_count = (select count(*) from doctor_reviews where doctor_id = d)
  where id = d;
  return null;
end $$;
create trigger doctor_reviews_rating after insert or update or delete
  on doctor_reviews for each row execute function refresh_doctor_rating();

-- How many people are ahead of a queue entry (0 = you're next).
-- security definer so patients can see their position without reading others' rows.
create function queue_position(entry uuid) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from queue_entries q, queue_entries me
  where me.id = entry and q.doctor_id = me.doctor_id
    and q.status = 'waiting' and q.joined_at < me.joined_at
$$;

-- Row level security
alter table profiles enable row level security;
alter table clinics enable row level security;
alter table doctors enable row level security;
alter table availability enable row level security;
alter table appointments enable row level security;
alter table queue_entries enable row level security;
alter table doctor_reviews enable row level security;
alter table doctor_rewards enable row level security;

create policy "own profile" on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "doctors are visible" on profiles for select
  using (exists (select 1 from doctors d where d.id = profiles.id));

create policy "public read" on clinics for select using (true);
create policy "public read" on doctors for select using (true);
create policy "public read" on availability for select using (true);
create policy "public read" on doctor_reviews for select using (true);
create policy "public read" on doctor_rewards for select using (true);

create policy "doctor manages self" on doctors for all using (id = auth.uid()) with check (id = auth.uid());
create policy "doctor manages availability" on availability for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

create policy "patient books" on appointments for insert with check (patient_id = auth.uid());
create policy "parties read" on appointments for select
  using (patient_id = auth.uid() or doctor_id = auth.uid());
create policy "parties update" on appointments for update
  using (patient_id = auth.uid() or doctor_id = auth.uid());

create policy "patient joins queue" on queue_entries for insert with check (patient_id = auth.uid());
create policy "own or doctor's queue" on queue_entries for select
  using (patient_id = auth.uid() or doctor_id = auth.uid());
create policy "doctor runs queue" on queue_entries for update using (doctor_id = auth.uid());

create policy "patient reviews own visit" on doctor_reviews for insert with check (
  patient_id = auth.uid() and exists (
    select 1 from appointments a
    where a.id = appointment_id and a.patient_id = auth.uid() and a.status = 'completed')
);

-- Create a profile row automatically on sign-up.
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''),
          coalesce((new.raw_user_meta_data->>'role')::user_role, 'patient'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
