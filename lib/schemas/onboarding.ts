import { z } from 'zod';

export const SPECIALTIES = [
  'General Physician',
  'Pediatrician',
  'Dermatologist',
  'Gynecologist',
  'Orthopedic',
  'Dentist',
  'ENT',
  'Cardiologist',
  'Psychiatrist',
  'Ophthalmologist',
] as const;

export const WEEKDAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
] as const;

export const SLOT_LENGTHS = [10, 15, 20, 30] as const;

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:MM, e.g. 09:00');
const wholeNumber = (label: string) => z.string().regex(/^\d+$/, `${label} must be a number`);

export const onboardingSchema = z
  .object({
    // Step 1 — professional
    specialty: z.string().min(1, 'Choose a specialty'),
    registrationNo: z.string().trim().min(3, 'Enter your medical registration number'),
    yearsExperience: wholeNumber('Experience'),
    consultationFee: wholeNumber('Fee'),
    bio: z.string().max(400, 'Keep it under 400 characters').optional(),
    // Step 2 — clinic
    clinicName: z.string().trim().min(2, 'Enter your clinic name'),
    clinicAddress: z.string().trim().min(5, 'Enter the clinic address'),
    // Step 3 — availability
    days: z.array(z.number()).min(1, 'Pick at least one working day'),
    startTime: time,
    endTime: time,
    slotMinutes: z.number(),
    autoApprove: z.boolean(),
  })
  .refine((v) => v.endTime > v.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });
export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const STEP_FIELDS: (keyof OnboardingValues)[][] = [
  ['specialty', 'registrationNo', 'yearsExperience', 'consultationFee', 'bio'],
  ['clinicName', 'clinicAddress'],
  ['days', 'startTime', 'endTime', 'slotMinutes', 'autoApprove'],
];
