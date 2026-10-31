import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type PastPrescription = {
  id: string;
  createdAt: string;
  diagnosis: string;
  notes: string;
  followUp: string | null;
  items: {
    id: string;
    medicine: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
};

export type PatientHistory = {
  bloodGroup: string | null;
  allergies: string[];
  gender: string | null;
  age: number | null;
  prescriptions: PastPrescription[];
};

// What the doctor already knows about this patient: their basics plus the
// prescriptions *this doctor* wrote before (row level security limits it to those).
// Reports uploaded by the patient will join this once consent sharing exists.
export function usePatientHistory(patientId: string | null | undefined) {
  return useQuery({
    queryKey: ['patient-history', patientId],
    enabled: !!patientId,
    queryFn: async (): Promise<PatientHistory> => {
      const [profile, prescriptions] = await Promise.all([
        supabase
          .from('profiles')
          .select('blood_group, allergies, gender, date_of_birth')
          .eq('id', patientId as string)
          .maybeSingle(),
        supabase
          .from('prescriptions')
          .select(
            'id, created_at, diagnosis, notes, follow_up_date, prescription_items(id, position, medicine, dose, frequency, duration, instructions)'
          )
          .eq('patient_id', patientId as string)
          .order('created_at', { ascending: false }),
      ]);
      if (prescriptions.error) throw prescriptions.error;

      const dob = profile.data?.date_of_birth ? new Date(profile.data.date_of_birth) : null;
      return {
        bloodGroup: profile.data?.blood_group ?? null,
        allergies: profile.data?.allergies ?? [],
        gender: profile.data?.gender ?? null,
        age: dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)) : null,
        prescriptions: (prescriptions.data ?? []).map((p) => ({
          id: p.id,
          createdAt: p.created_at,
          diagnosis: p.diagnosis,
          notes: p.notes ?? '',
          followUp: p.follow_up_date,
          items: [...(p.prescription_items ?? [])]
            .sort((a, b) => a.position - b.position)
            .map((i) => ({
              id: i.id,
              medicine: i.medicine,
              dose: i.dose ?? '',
              frequency: i.frequency ?? '',
              duration: i.duration ?? '',
              instructions: i.instructions ?? '',
            })),
        })),
      };
    },
  });
}
