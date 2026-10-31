import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

export type ServingPatient = {
  entryId: string;
  patientId: string | null;
  appointmentId: string | null;
  name: string;
};

export type DoctorDashboard = {
  appointmentsToday: number;
  waiting: number;
  revenueToday: number;
  serving: ServingPatient | null;
  nextUp: string | null;
};

const key = (id: string) => ['dashboard', id] as const;

function todayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

type QueueRow = {
  id: string;
  status: string;
  patient_id: string | null;
  appointment_id: string | null;
  walk_in_name: string | null;
  profiles: unknown;
};
const nameOf = (r: QueueRow) => {
  const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
  return r.walk_in_name || (p as { full_name?: string } | null)?.full_name || 'Patient';
};

async function fetchDashboard(id: string): Promise<DoctorDashboard> {
  const { from, to } = todayBounds();
  const [appts, queue] = await Promise.all([
    supabase
      .from('appointments')
      .select('status, fee')
      .eq('doctor_id', id)
      .gte('starts_at', from)
      .lt('starts_at', to)
      .in('status', ['approved', 'completed']),
    supabase
      .from('queue_entries')
      .select(
        'id, status, patient_id, appointment_id, walk_in_name, profiles!queue_entries_patient_id_fkey(full_name)'
      )
      .eq('doctor_id', id)
      .in('status', ['waiting', 'in_consult'])
      .gte('joined_at', from)
      .order('joined_at'),
  ]);
  if (appts.error) throw appts.error;
  if (queue.error) throw queue.error;

  const rows = (queue.data ?? []) as QueueRow[];
  const waiting = rows.filter((r) => r.status === 'waiting');
  const serving = rows.find((r) => r.status === 'in_consult');
  return {
    appointmentsToday: appts.data?.length ?? 0,
    waiting: waiting.length,
    revenueToday: (appts.data ?? [])
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + Number(a.fee ?? 0), 0),
    serving: serving
      ? {
          entryId: serving.id,
          patientId: serving.patient_id,
          appointmentId: serving.appointment_id,
          name: nameOf(serving),
        }
      : null,
    nextUp: waiting[0] ? nameOf(waiting[0]) : null,
  };
}

export function useDoctorDashboard(id: string | undefined) {
  const queryClient = useQueryClient();

  // Walk-ins joining or leaving should show up without pulling to refresh.
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`doctor-queue-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `doctor_id=eq.${id}`,
        },
        () => void queryClient.invalidateQueries({ queryKey: key(id) })
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: key(id ?? ''),
    queryFn: () => fetchDashboard(id as string),
    enabled: !!id,
  });
}

export function useCallNext(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('call_next_patient');
      if (error) throw error;
      return data as string | null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(id) }),
  });
}
