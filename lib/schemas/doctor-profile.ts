import { z } from 'zod';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:MM, e.g. 09:00');

const wholeNumber = (label: string) => z.string().regex(/^\d+$/, `${label} must be a number`);

export const doctorProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Please enter your name.'),
    phone: z
      .string()
      .trim()
      .regex(/^\+?\d{10,13}$/, 'Enter a valid phone number')
      .or(z.literal('')),
    specialty: z.string().min(1, 'Choose a specialty'),
    registrationNo: z.string().trim().min(3, 'Enter your medical registration number'),
    yearsExperience: wholeNumber('Experience'),
    consultationFee: wholeNumber('Fee'),
    bio: z.string().max(400, 'Keep it under 400 characters'),
    clinicName: z.string().trim().min(2, 'Enter your clinic name'),
    clinicAddress: z.string().trim().min(5, 'Enter the clinic address'),
    autoApprove: z.boolean(),
    days: z.array(z.number()).min(1, 'Pick at least one working day'),
    startTime: time,
    endTime: time,
    slotMinutes: z.number(),
  })
  .refine((v) => v.endTime > v.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });
export type DoctorProfileValues = z.infer<typeof doctorProfileSchema>;
