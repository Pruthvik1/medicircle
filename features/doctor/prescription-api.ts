import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';

export const medicineSchema = z.object({
  medicine: z.string().trim().min(2, 'Medicine name'),
  dose: z.string().trim(),
  frequency: z.string().trim().min(1, 'Pick when to take it'),
  duration: z.string().trim().min(1, 'Add a duration'),
  instructions: z.string().trim(),
});
export type MedicineValues = z.infer<typeof medicineSchema>;

export const prescriptionSchema = z.object({
  diagnosis: z.string().trim().min(3, 'Add a diagnosis'),
  notes: z.string().trim().max(500, 'Keep notes under 500 characters'),
  followUp: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Use YYYY-MM-DD'),
  items: z.array(medicineSchema).min(1, 'Add at least one medicine'),
});
export type PrescriptionValues = z.infer<typeof prescriptionSchema>;

export type QueuePatient = {
  entryId: string;
  patientId: string | null;
  appointmentId: string | null;
  name: string;
};

// The queue entry the doctor is writing for (passed from the dashboard).
export function useQueuePatient(entryId: string | undefined) {
  return useQuery({
    queryKey: ['queue-entry', entryId],
    enabled: !!entryId,
    queryFn: async (): Promise<QueuePatient> => {
      const { data, error } = await supabase
        .from('queue_entries')
        .select(
          'id, patient_id, appointment_id, walk_in_name, profiles!queue_entries_patient_id_fkey(full_name)'
        )
        .eq('id', entryId as string)
        .single();
      if (error) throw error;
      const p = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      return {
        entryId: data.id,
        patientId: data.patient_id,
        appointmentId: data.appointment_id,
        name: data.walk_in_name || (p as { full_name?: string } | null)?.full_name || 'Patient',
      };
    },
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patient,
      values,
    }: {
      patient: QueuePatient;
      values: PrescriptionValues;
    }) => {
      const { error } = await supabase.rpc('create_prescription', {
        p_patient_id: patient.patientId,
        p_patient_name: patient.name,
        p_queue_entry_id: patient.entryId,
        p_appointment_id: patient.appointmentId,
        p_diagnosis: values.diagnosis,
        p_notes: values.notes || null,
        p_follow_up: values.followUp || null,
        p_items: values.items,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prescriptions'] }),
  });
}
