-- Prescriptions written during a consultation + in-app notifications.
-- Run in the Supabase SQL editor after 0001-0004.

create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors,
  patient_id uuid references profiles,          -- null for walk-ins without an account
  patient_name text,
  queue_entry_id uuid references queue_entries,
  appointment_id uuid references appointments,
  diagnosis text not null,
  notes text,
  follow_up_date date,
  created_at timestamptz not null default now()
);

create table prescription_items (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references prescriptions on delete cascade,
  position smallint not null default 0,
  medicine text not null,
  dose text,
  frequency text,
  duration text,
  instructions text
);

alter table prescriptions enable row level security;
alter table prescription_items enable row level security;

create policy "doctor manages own prescriptions" on prescriptions for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());
create policy "patient reads own prescriptions" on prescriptions for select
  using (patient_id = auth.uid());
create policy "items follow prescription" on prescription_items for all
  using (exists (select 1 from prescriptions p where p.id = prescription_id
         and (p.doctor_id = auth.uid() or p.patient_id = auth.uid())))
  with check (exists (select 1 from prescriptions p where p.id = prescription_id and p.doctor_id = auth.uid()));

-- Create a prescription and its medicines in one go.
-- p_items: [{"medicine":"Paracetamol 500mg","dose":"1 tablet","frequency":"Morning, Night","duration":"5 days","instructions":"After food"}]
create or replace function create_prescription(
  p_patient_id uuid, p_patient_name text, p_queue_entry_id uuid, p_appointment_id uuid,
  p_diagnosis text, p_notes text, p_follow_up date, p_items jsonb
) returns uuid language plpgsql as $$
declare new_id uuid;
begin
  insert into prescriptions (doctor_id, patient_id, patient_name, queue_entry_id, appointment_id,
                             diagnosis, notes, follow_up_date)
  values (auth.uid(), p_patient_id, p_patient_name, p_queue_entry_id, p_appointment_id,
          p_diagnosis, p_notes, p_follow_up)
  returning id into new_id;

  insert into prescription_items (prescription_id, position, medicine, dose, frequency, duration, instructions)
  select new_id, (ord - 1)::smallint, i->>'medicine', i->>'dose', i->>'frequency', i->>'duration', i->>'instructions'
  from jsonb_array_elements(p_items) with ordinality as t(i, ord);

  return new_id;
end $$;
grant execute on function create_prescription to authenticated;

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  kind text not null,                 -- appointment_request | appointment_decision | prescription
  title text not null,
  body text,
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on notifications (user_id, created_at desc);
alter table notifications enable row level security;
create policy "read own notifications" on notifications for select using (user_id = auth.uid());
create policy "mark own notifications read" on notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Doctor is notified when a patient books.
create function notify_new_appointment() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, kind, title, body, data)
  values (new.doctor_id, 'appointment_request', 'New appointment request',
          coalesce((select full_name from profiles where id = new.patient_id), 'A patient')
            || ' requested ' || to_char(new.starts_at, 'Dy DD Mon, HH12:MI AM'),
          jsonb_build_object('appointment_id', new.id));
  return new;
end $$;
create trigger appointment_created after insert on appointments
  for each row execute function notify_new_appointment();

-- Patient is notified when the doctor approves or rejects (rejection includes the note).
create function notify_appointment_decision() returns trigger
language plpgsql security definer set search_path = public as $$
declare doc text := coalesce((select full_name from profiles where id = new.doctor_id), 'Your doctor');
begin
  insert into notifications (user_id, kind, title, body, data)
  values (new.patient_id, 'appointment_decision',
          case new.status when 'approved' then 'Appointment confirmed' else 'Appointment rejected' end,
          case new.status
            when 'approved' then 'Dr. ' || doc || ' confirmed your visit on ' || to_char(new.starts_at, 'Dy DD Mon, HH12:MI AM')
            else 'Dr. ' || doc || ' could not take your visit on ' || to_char(new.starts_at, 'Dy DD Mon, HH12:MI AM')
                 || coalesce('. Note: ' || new.decision_note, '')
          end,
          jsonb_build_object('appointment_id', new.id));
  return new;
end $$;
create trigger appointment_decided after update of status on appointments
  for each row
  when (old.status is distinct from new.status and new.status in ('approved', 'declined'))
  execute function notify_appointment_decision();

-- Patient is notified when a prescription is added to their record.
create function notify_prescription() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.patient_id is not null then
    insert into notifications (user_id, kind, title, body, data)
    values (new.patient_id, 'prescription', 'New prescription',
            'Dr. ' || coalesce((select full_name from profiles where id = new.doctor_id), 'your doctor')
              || ' added a prescription for ' || new.diagnosis,
            jsonb_build_object('prescription_id', new.id));
  end if;
  return new;
end $$;
create trigger prescription_created after insert on prescriptions
  for each row execute function notify_prescription();

alter publication supabase_realtime add table notifications;

-- A doctor can read the profile (name, blood group, allergies…) of patients who
-- have booked with them or joined their queue — needed for the requests list,
-- the queue and the patient record.
create policy "doctor reads own patients" on profiles for select using (
  exists (select 1 from queue_entries q where q.patient_id = profiles.id and q.doctor_id = auth.uid())
  or exists (select 1 from appointments a where a.patient_id = profiles.id and a.doctor_id = auth.uid())
);
