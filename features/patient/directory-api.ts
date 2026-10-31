import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type DirectoryDoctor = {
  id: string;
  name: string;
  specialty: string;
  fee: number;
  ratingAvg: number;
  ratingCount: number;
  clinicId: string;
  clinicName: string;
  clinicAddress: string;
};

export type DirectoryClinic = {
  id: string;
  name: string;
  address: string;
  doctors: DirectoryDoctor[];
  specialties: string[];
  topRating: number;
};

type Row = {
  id: string;
  specialty: string;
  consultation_fee: number | null;
  rating_avg: number;
  rating_count: number;
  profiles: { full_name: string } | { full_name: string }[] | null;
  clinics:
    | { id: string; name: string; address: string | null }
    | { id: string; name: string; address: string | null }[]
    | null;
};

const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

// Every onboarded doctor with their clinic. Small enough to fetch once and
// search on the device; move to a server-side search when the list grows.
export function useDirectory() {
  return useQuery({
    queryKey: ['directory'],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(
          'id, specialty, consultation_fee, rating_avg, rating_count, profiles!inner(full_name), clinics!inner(id, name, address)'
        )
        .limit(300);
      if (error) throw error;

      const doctors: DirectoryDoctor[] = ((data ?? []) as unknown as Row[]).flatMap((r) => {
        const p = one(r.profiles);
        const c = one(r.clinics);
        if (!p || !c) return [];
        return [
          {
            id: r.id,
            name: p.full_name,
            specialty: r.specialty,
            fee: Number(r.consultation_fee ?? 0),
            ratingAvg: Number(r.rating_avg),
            ratingCount: r.rating_count,
            clinicId: c.id,
            clinicName: c.name,
            clinicAddress: c.address ?? '',
          },
        ];
      });

      const byClinic = new Map<string, DirectoryClinic>();
      for (const d of doctors) {
        const existing = byClinic.get(d.clinicId);
        if (existing) {
          existing.doctors.push(d);
          if (!existing.specialties.includes(d.specialty)) existing.specialties.push(d.specialty);
          existing.topRating = Math.max(existing.topRating, d.ratingAvg);
        } else {
          byClinic.set(d.clinicId, {
            id: d.clinicId,
            name: d.clinicName,
            address: d.clinicAddress,
            doctors: [d],
            specialties: [d.specialty],
            topRating: d.ratingAvg,
          });
        }
      }
      return { doctors, clinics: [...byClinic.values()] };
    },
  });
}

export function matchesQuery(query: string, ...fields: string[]) {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => f.toLowerCase().includes(q));
}
