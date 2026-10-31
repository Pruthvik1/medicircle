import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { DoctorProfileValues } from '@/lib/schemas/doctor-profile';
import { supabase } from '@/lib/supabase';

export type DoctorProfile = {
  id: string;
  fullName: string;
  phone: string;
  specialty: string;
  registrationNo: string;
  yearsExperience: number;
  consultationFee: number;
  bio: string;
  autoApprove: boolean;
  ratingAvg: number;
  ratingCount: number;
  clinic: { id: string; slug: string; name: string; address: string };
  availability: {
    weekday: number;
    startTime: string;
    endTime: string;
    slotMinutes: number;
  }[];
};

const key = (id: string) => ['doctor-profile', id] as const;

async function fetchDoctorProfile(id: string): Promise<DoctorProfile> {
  const [profile, doctor, availability] = await Promise.all([
    supabase.from('profiles').select('full_name, phone').eq('id', id).single(),
    supabase
      .from('doctors')
      .select(
        'specialty, registration_no, years_experience, consultation_fee, bio, auto_approve, rating_avg, rating_count, clinics(id, slug, name, address)'
      )
      .eq('id', id)
      .single(),
    supabase
      .from('availability')
      .select('weekday, start_time, end_time, slot_minutes')
      .eq('doctor_id', id),
  ]);
  if (profile.error) throw profile.error;
  if (doctor.error) throw doctor.error;
  if (availability.error) throw availability.error;

  const d = doctor.data;
  // supabase-js types a to-one embed as an array without generated types.
  const clinic = (Array.isArray(d.clinics) ? d.clinics[0] : d.clinics) as
    DoctorProfile['clinic'] | null;

  return {
    id,
    fullName: profile.data.full_name ?? '',
    phone: profile.data.phone ?? '',
    specialty: d.specialty,
    registrationNo: d.registration_no ?? '',
    yearsExperience: d.years_experience ?? 0,
    consultationFee: Number(d.consultation_fee ?? 0),
    bio: d.bio ?? '',
    autoApprove: d.auto_approve,
    ratingAvg: Number(d.rating_avg),
    ratingCount: d.rating_count,
    clinic: clinic ?? { id: '', slug: '', name: '', address: '' },
    availability: (availability.data ?? []).map((a) => ({
      weekday: a.weekday,
      startTime: String(a.start_time).slice(0, 5),
      endTime: String(a.end_time).slice(0, 5),
      slotMinutes: a.slot_minutes,
    })),
  };
}

export function useDoctorProfile(id: string | undefined) {
  return useQuery({
    queryKey: key(id ?? ''),
    queryFn: () => fetchDoctorProfile(id as string),
    enabled: !!id,
  });
}

export function useUpdateDoctorProfile(id: string, clinicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (v: DoctorProfileValues) => {
      const results = await Promise.all([
        supabase
          .from('profiles')
          .update({ full_name: v.fullName, phone: v.phone || null })
          .eq('id', id),
        supabase
          .from('doctors')
          .update({
            specialty: v.specialty,
            registration_no: v.registrationNo,
            years_experience: Number(v.yearsExperience),
            consultation_fee: Number(v.consultationFee),
            bio: v.bio.trim() || null,
            auto_approve: v.autoApprove,
          })
          .eq('id', id),
        supabase
          .from('clinics')
          .update({ name: v.clinicName, address: v.clinicAddress })
          .eq('id', clinicId),
      ]);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;

      // Weekly hours: replace the rows. Existing bookings are not affected.
      const cleared = await supabase.from('availability').delete().eq('doctor_id', id);
      if (cleared.error) throw cleared.error;
      const inserted = await supabase.from('availability').insert(
        v.days.map((weekday) => ({
          doctor_id: id,
          weekday,
          start_time: v.startTime,
          end_time: v.endTime,
          slot_minutes: v.slotMinutes,
        }))
      );
      if (inserted.error) throw inserted.error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(id) }),
  });
}
