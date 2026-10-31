-- Clinic-day features: reject notes, awards with proof links, call-next, realtime.
-- Run in the Supabase SQL editor after 0001-0003.

-- 1. Decisions on appointment requests (approve / reject, with a note when rejecting)
alter table appointments
  add column if not exists decision_note text,
  add column if not exists decided_at timestamptz;

-- 2. Awards: link to the award page or an article that proves it. `verified` is
-- only ever set by an admin (service role) — doctors cannot set it themselves.
alter table doctor_rewards
  add column if not exists link_url text,
  add column if not exists verified boolean not null default false;

create policy "doctor adds awards" on doctor_rewards for insert
  with check (doctor_id = auth.uid() and verified = false);
create policy "doctor edits awards" on doctor_rewards for update
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid() and verified = false);
create policy "doctor deletes awards" on doctor_rewards for delete using (doctor_id = auth.uid());

-- 3. Doctors can add walk-ins to their own queue
create policy "doctor adds walk-ins" on queue_entries for insert with check (doctor_id = auth.uid());

-- 4. Call next patient: finish whoever is in the room, then bring in the next one.
create or replace function call_next_patient() returns uuid
language plpgsql as $$
declare
  uid uuid := auth.uid();
  nxt uuid;
begin
  with fin as (
    update queue_entries set status = 'done'
    where doctor_id = uid and status = 'in_consult'
    returning appointment_id
  )
  update appointments set status = 'completed'
  where id in (select appointment_id from fin where appointment_id is not null);

  select id into nxt from queue_entries
  where doctor_id = uid and status = 'waiting'
  order by joined_at limit 1;

  if nxt is not null then
    update queue_entries set status = 'in_consult' where id = nxt;
  end if;
  return nxt;
end $$;
grant execute on function call_next_patient to authenticated;

-- 5. Live updates for new requests and queue changes
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table queue_entries;
