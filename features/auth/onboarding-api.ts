import { useMutation } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { OnboardingValues } from '@/lib/schemas/onboarding';

// One atomic rpc (supabase/migrations/0002_doctor_onboarding.sql): clinic +
// doctors row + weekly availability, or nothing.
async function completeOnboarding(v: OnboardingValues) {
  const { error } = await supabase.rpc('complete_doctor_onboarding', {
    p_specialty: v.specialty,
    p_registration_no: v.registrationNo,
    p_years_experience: Number(v.yearsExperience),
    p_consultation_fee: Number(v.consultationFee),
    p_bio: v.bio?.trim() || null,
    p_auto_approve: v.autoApprove,
    p_clinic_name: v.clinicName,
    p_clinic_address: v.clinicAddress,
    p_availability: v.days.map((weekday) => ({
      weekday,
      start_time: v.startTime,
      end_time: v.endTime,
      slot_minutes: v.slotMinutes,
    })),
  });
  if (error) throw error;
}

export function useCompleteOnboardingMutation() {
  return useMutation({ mutationFn: completeOnboarding });
}
