import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

export type RequestStatus = 'pending' | 'approved' | 'declined';

export type AppointmentRequest = {
  id: string;
  patientName: string;
  startsAt: string;
  reason: string;
  status: RequestStatus;
  decisionNote: string | null;
};

const listKey = (doctorId: string, status: RequestStatus) =>
  ['requests', doctorId, status] as const;

async function fetchRequests(
  doctorId: string,
  status: RequestStatus
): Promise<AppointmentRequest[]> {
  let query = supabase
    .from('appointments')
    .select(
      'id, starts_at, reason, status, decision_note, profiles!appointments_patient_id_fkey(full_name)'
    )
    .eq('doctor_id', doctorId)
    .eq('status', status)
    .order('starts_at', { ascending: status !== 'declined' });
  // Approved list is "what's coming up", not history.
  if (status === 'approved') query = query.gte('starts_at', new Date().toISOString());

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => {
    const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      patientName: (p as { full_name?: string } | null)?.full_name || 'Patient',
      startsAt: row.starts_at,
      reason: row.reason ?? '',
      status: row.status as RequestStatus,
      decisionNote: row.decision_note,
    };
  });
}

export function useRequests(doctorId: string | undefined, status: RequestStatus) {
  return useQuery({
    queryKey: listKey(doctorId ?? '', status),
    queryFn: () => fetchRequests(doctorId as string, status),
    enabled: !!doctorId,
  });
}

export function usePendingCount(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['requests-count', doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('doctor_id', doctorId as string)
        .eq('status', 'pending');
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useDecideRequest(doctorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: 'approved' | 'declined';
      note?: string;
    }) => {
      const { error } = await supabase
        .from('appointments')
        .update({
          status,
          decision_note: status === 'declined' ? (note ?? '').trim() : null,
          decided_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('doctor_id', doctorId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['requests', doctorId] });
      void queryClient.invalidateQueries({
        queryKey: ['requests-count', doctorId],
      });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', doctorId] });
    },
  });
}

// Subscribes to new booking requests for this doctor. Calls `onNew` for each
// one and keeps the lists and the tab badge fresh. Realtime must be enabled on
// `appointments` (see 0004_clinic_day.sql).
export function useNewRequestListener(
  doctorId: string | undefined,
  onNew: (requestId: string) => void
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!doctorId) return;
    const channel = supabase
      .channel(`doctor-requests-${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          void queryClient.invalidateQueries({
            queryKey: ['requests', doctorId],
          });
          void queryClient.invalidateQueries({
            queryKey: ['requests-count', doctorId],
          });
          void queryClient.invalidateQueries({
            queryKey: ['dashboard', doctorId],
          });
          if (payload.eventType === 'INSERT') onNew((payload.new as { id: string }).id);
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [doctorId, queryClient, onNew]);
}
