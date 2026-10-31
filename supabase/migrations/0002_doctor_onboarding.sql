-- Doctor onboarding in one atomic call: creates the clinic, the doctors row
-- and the weekly availability. Run in the Supabase SQL editor after 0001.
-- availability: [{"weekday":1,"start_time":"09:00","end_time":"17:00","slot_minutes":15}, ...]

create or replace function complete_doctor_onboarding(
  p_specialty text,
  p_registration_no text,
  p_years_experience int,
  p_consultation_fee numeric,
  p_bio text,
  p_auto_approve boolean,
  p_clinic_name text,
  p_clinic_address text,
  p_availability jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  new_clinic uuid;
  slug_base text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from profiles where id = uid and role = 'doctor') then
    raise exception 'only doctors can complete onboarding';
  end if;
  if exists (select 1 from doctors where id = uid and clinic_id is not null) then
    raise exception 'onboarding already completed';
  end if;

  slug_base := trim(both '-' from lower(regexp_replace(p_clinic_name, '[^a-zA-Z0-9]+', '-', 'g')));
  insert into clinics (slug, name, address)
  values (slug_base || '-' || substr(md5(random()::text), 1, 5), p_clinic_name, p_clinic_address)
  returning id into new_clinic;

  insert into doctors (id, clinic_id, specialty, registration_no, years_experience,
                       consultation_fee, bio, auto_approve)
  values (uid, new_clinic, p_specialty, p_registration_no, p_years_experience,
          p_consultation_fee, p_bio, p_auto_approve)
  on conflict (id) do update set
    clinic_id = excluded.clinic_id, specialty = excluded.specialty,
    registration_no = excluded.registration_no, years_experience = excluded.years_experience,
    consultation_fee = excluded.consultation_fee, bio = excluded.bio,
    auto_approve = excluded.auto_approve;

  delete from availability where doctor_id = uid;
  insert into availability (doctor_id, weekday, start_time, end_time, slot_minutes)
  select uid, (a->>'weekday')::smallint, (a->>'start_time')::time,
         (a->>'end_time')::time, coalesce((a->>'slot_minutes')::smallint, 15)
  from jsonb_array_elements(p_availability) a;

  return new_clinic;
end $$;

grant execute on function complete_doctor_onboarding to authenticated;
