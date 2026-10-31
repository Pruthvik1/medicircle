// Mock data for the role-based screens until the supabase queries land.
// Shapes follow the tables in supabase/migrations/0001_init.sql.
export type DoctorSummary = {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  distanceKm: number;
  fee: number;
  ratingAvg: number;
  ratingCount: number;
  nextSlot: string;
};

export const NEARBY_DOCTORS: DoctorSummary[] = [
  {
    id: 'd1',
    name: 'Dr. Ananya Mehta',
    specialty: 'General Physician',
    clinic: 'Mehta Family Clinic',
    distanceKm: 0.8,
    fee: 400,
    ratingAvg: 4.8,
    ratingCount: 214,
    nextSlot: 'Today, 5:30 PM',
  },
  {
    id: 'd2',
    name: 'Dr. Rohan Shah',
    specialty: 'Pediatrician',
    clinic: 'Little Steps Clinic',
    distanceKm: 1.6,
    fee: 500,
    ratingAvg: 4.6,
    ratingCount: 132,
    nextSlot: 'Today, 6:15 PM',
  },
  {
    id: 'd3',
    name: 'Dr. Kavita Rao',
    specialty: 'Dermatologist',
    clinic: 'ClearSkin Centre',
    distanceKm: 2.4,
    fee: 700,
    ratingAvg: 4.7,
    ratingCount: 98,
    nextSlot: 'Tomorrow, 10:00 AM',
  },
];

export type PatientAppointment = {
  id: string;
  doctor: string;
  specialty: string;
  when: string;
  status: 'pending' | 'approved' | 'completed' | 'declined';
};

export const PATIENT_APPOINTMENTS: PatientAppointment[] = [
  {
    id: 'a1',
    doctor: 'Dr. Ananya Mehta',
    specialty: 'General Physician',
    when: 'Today, 5:30 PM',
    status: 'approved',
  },
  {
    id: 'a2',
    doctor: 'Dr. Kavita Rao',
    specialty: 'Dermatologist',
    when: 'Sat, 2 Nov, 10:00 AM',
    status: 'pending',
  },
  {
    id: 'a3',
    doctor: 'Dr. Rohan Shah',
    specialty: 'Pediatrician',
    when: '12 Oct, 6:15 PM',
    status: 'completed',
  },
];

export type PatientRecord = {
  id: string;
  title: string;
  kind: 'Prescription' | 'Lab report' | 'Scan';
  date: string;
  doctor: string;
};

export const PATIENT_RECORDS: PatientRecord[] = [
  {
    id: 'r1',
    title: 'Prescription — viral fever',
    kind: 'Prescription',
    date: '12 Oct 2026',
    doctor: 'Dr. Rohan Shah',
  },
  {
    id: 'r2',
    title: 'Complete blood count',
    kind: 'Lab report',
    date: '3 Oct 2026',
    doctor: 'Dr. Ananya Mehta',
  },
  {
    id: 'r3',
    title: 'Chest X-ray',
    kind: 'Scan',
    date: '21 Aug 2026',
    doctor: 'Dr. Ananya Mehta',
  },
];

export type AppointmentRequest = {
  id: string;
  patient: string;
  when: string;
  reason: string;
};

export const APPOINTMENT_REQUESTS: AppointmentRequest[] = [
  {
    id: 'q1',
    patient: 'Rahul Sharma',
    when: 'Today, 5:30 PM',
    reason: 'Fever and cough for 3 days',
  },
  {
    id: 'q2',
    patient: 'Priya Kapoor',
    when: 'Today, 6:00 PM',
    reason: 'Follow-up on blood test',
  },
  {
    id: 'q3',
    patient: 'Imran Ali',
    when: 'Tomorrow, 10:30 AM',
    reason: 'Skin rash',
  },
];

export type ClinicPatient = {
  id: string;
  name: string;
  visits: number;
  lastVisit: string;
  returning: boolean;
};

export const CLINIC_PATIENTS: ClinicPatient[] = [
  {
    id: 'p1',
    name: 'Rahul Sharma',
    visits: 4,
    lastVisit: '3 Oct 2026',
    returning: true,
  },
  {
    id: 'p2',
    name: 'Priya Kapoor',
    visits: 2,
    lastVisit: '19 Sep 2026',
    returning: true,
  },
  {
    id: 'p3',
    name: 'Imran Ali',
    visits: 1,
    lastVisit: 'First visit',
    returning: false,
  },
  {
    id: 'p4',
    name: 'Sneha Joshi',
    visits: 7,
    lastVisit: '28 Oct 2026',
    returning: true,
  },
];

export const DOCTOR_TODAY = {
  appointments: 14,
  waiting: 4,
  revenue: 5600,
  nowServing: 'Sneha Joshi',
  next: 'Rahul Sharma',
};
