import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';

export type Award = {
  id: string;
  title: string;
  description: string;
  year: number;
  linkUrl: string;
  verified: boolean;
};

export const awardSchema = z.object({
  title: z.string().trim().min(3, 'Enter the award name'),
  year: z
    .string()
    .regex(/^(19|20)\d{2}$/, 'Enter a 4-digit year')
    .refine((y) => Number(y) <= new Date().getFullYear(), 'Year cannot be in the future'),
  description: z.string().trim().max(200, 'Keep it under 200 characters'),
  linkUrl: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || /^https?:\/\/\S+\.\S+/i.test(v),
      'Enter a full link starting with https://'
    ),
});
export type AwardValues = z.infer<typeof awardSchema>;

const key = (doctorId: string) => ['awards', doctorId] as const;

export function useAwards(doctorId: string | undefined) {
  return useQuery({
    queryKey: key(doctorId ?? ''),
    enabled: !!doctorId,
    queryFn: async (): Promise<Award[]> => {
      const { data, error } = await supabase
        .from('doctor_rewards')
        .select('id, title, description, awarded_at, link_url, verified')
        .eq('doctor_id', doctorId as string)
        .order('awarded_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description ?? '',
        year: new Date(r.awarded_at).getFullYear(),
        linkUrl: r.link_url ?? '',
        verified: r.verified,
      }));
    },
  });
}

export function useSaveAward(doctorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: AwardValues }) => {
      const row = {
        title: values.title,
        description: values.description || null,
        awarded_at: `${values.year}-01-01`,
        link_url: values.linkUrl || null,
        verified: false, // editing an award sends it back for re-verification
      };
      const { error } = id
        ? await supabase.from('doctor_rewards').update(row).eq('id', id)
        : await supabase.from('doctor_rewards').insert({ ...row, doctor_id: doctorId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(doctorId) }),
  });
}

export function useDeleteAward(doctorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('doctor_rewards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(doctorId) }),
  });
}
