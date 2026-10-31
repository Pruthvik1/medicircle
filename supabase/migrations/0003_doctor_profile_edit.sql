-- Let a doctor edit the clinic they belong to (0001 only allowed public reads).
create policy "doctor edits own clinic" on clinics for update
  using (exists (select 1 from doctors d where d.clinic_id = clinics.id and d.id = auth.uid()))
  with check (exists (select 1 from doctors d where d.clinic_id = clinics.id and d.id = auth.uid()));
