import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

export type AppNotification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

const listKey = (uid: string) => ['notifications', uid] as const;

export function useNotifications(uid: string | undefined) {
  return useQuery({
    queryKey: listKey(uid ?? ''),
    enabled: !!uid,
    queryFn: async (): Promise<AppNotification[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, kind, title, body, created_at, read_at')
        .eq('user_id', uid as string)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((n) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body ?? '',
        createdAt: n.created_at,
        read: !!n.read_at,
      }));
    },
  });
}

export function useUnreadCount(uid: string | undefined) {
  const { data } = useNotifications(uid);
  return data?.filter((n) => !n.read).length ?? 0;
}

export function useMarkRead(uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', ids)
        .is('read_at', null);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listKey(uid) }),
  });
}

// Keeps the list and the bell badge live. Realtime must be enabled on
// `notifications` (see 0005_prescriptions_notifications.sql).
export function useNotificationsRealtime(uid: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel(`notifications-${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${uid}`,
        },
        () => void queryClient.invalidateQueries({ queryKey: listKey(uid) })
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [uid, queryClient]);
}
