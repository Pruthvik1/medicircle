import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type PatientAppointment = {
  id: string;
  doctorName: string;
  specialty: string;
  startsAt: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled' | 'completed' | 'no_show';
  decisionNote: string | null;
};

type DoctorEmbed = {
  specialty: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

export function usePatientAppointments(patientId: string | undefined) {
  return useQuery({
    queryKey: ['patient-appointments', patientId],
    enabled: !!patientId,
    queryFn: async (): Promise<PatientAppointment[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          'id, starts_at, status, decision_note, doctors!appointments_doctor_id_fkey(specialty, profiles(full_name))'
        )
        .eq('patient_id', patientId as string)
        .order('starts_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => {
        const d = (Array.isArray(row.doctors) ? row.doctors[0] : row.doctors) as DoctorEmbed | null;
        const p = Array.isArray(d?.profiles) ? d?.profiles[0] : d?.profiles;
        return {
          id: row.id,
          doctorName: p?.full_name ?? 'Doctor',
          specialty: d?.specialty ?? '',
          startsAt: row.starts_at,
          status: row.status,
          decisionNote: row.decision_note,
        };
      });
    },
  });
}

export type PatientPrescription = {
  id: string;
  createdAt: string;
  diagnosis: string;
  doctorName: string;
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

export function usePatientPrescriptions(patientId: string | undefined) {
  return useQuery({
    queryKey: ['prescriptions', patientId],
    enabled: !!patientId,
    queryFn: async (): Promise<PatientPrescription[]> => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(
          'id, created_at, diagnosis, notes, follow_up_date, doctors!prescriptions_doctor_id_fkey(profiles(full_name)), prescription_items(id, position, medicine, dose, frequency, duration, instructions)'
        )
        .eq('patient_id', patientId as string)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((rx) => {
        const d = (Array.isArray(rx.doctors) ? rx.doctors[0] : rx.doctors) as Pick<
          DoctorEmbed,
          'profiles'
        > | null;
        const p = Array.isArray(d?.profiles) ? d?.profiles[0] : d?.profiles;
        return {
          id: rx.id,
          createdAt: rx.created_at,
          diagnosis: rx.diagnosis,
          doctorName: p?.full_name ?? 'Doctor',
          notes: rx.notes ?? '',
          followUp: rx.follow_up_date,
          items: [...(rx.prescription_items ?? [])]
            .sort((a, b) => a.position - b.position)
            .map((i) => ({
              id: i.id,
              medicine: i.medicine,
              dose: i.dose ?? '',
              frequency: i.frequency ?? '',
              duration: i.duration ?? '',
              instructions: i.instructions ?? '',
            })),
        };
      });
    },
  });
}
