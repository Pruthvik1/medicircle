// Mock data shaped like the supabase tables (queue_entries, doctors,
// doctor_rewards, doctor_reviews). Replace with queries once the project is
// connected; `ahead` comes from the queue_position() rpc.
export type DoctorReward = {
  id: string;
  title: string;
  description: string;
  year: number;
};
export type DoctorReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
};

export type QueueDoctor = {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  yearsExperience: number;
  ratingAvg: number;
  ratingCount: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  rewards: DoctorReward[];
  reviews: DoctorReview[];
};

export type QueueStatusData = {
  token: number;
  ahead: number;
  avgMinutesPerPatient: number;
  nowServing: number;
  doctor: QueueDoctor;
};

export const MOCK_QUEUE: QueueStatusData = {
  token: 6,
  ahead: 3,
  avgMinutesPerPatient: 8,
  nowServing: 3,
  doctor: {
    id: 'doc-1',
    name: 'Dr. Ananya Mehta',
    specialty: 'General Physician',
    clinic: 'Mehta Family Clinic',
    yearsExperience: 12,
    ratingAvg: 4.8,
    ratingCount: 214,
    ratingBreakdown: { 5: 176, 4: 28, 3: 7, 2: 2, 1: 1 },
    rewards: [
      {
        id: 'r1',
        title: 'Top Rated 2026',
        description: 'Top 5% of doctors by patient rating',
        year: 2026,
      },
      {
        id: 'r2',
        title: 'Punctuality Star',
        description: 'Average wait under 10 minutes',
        year: 2026,
      },
      {
        id: 'r3',
        title: '1,000 Consultations',
        description: 'Completed on medicircle',
        year: 2025,
      },
    ],
    reviews: [
      {
        id: 'v1',
        author: 'Rahul S.',
        rating: 5,
        comment: 'Listens carefully and explains everything clearly.',
      },
      {
        id: 'v2',
        author: 'Priya K.',
        rating: 5,
        comment: 'Barely any waiting and the live queue was accurate.',
      },
      {
        id: 'v3',
        author: 'Imran A.',
        rating: 4,
        comment: 'Great doctor, clinic gets busy in the evening.',
      },
    ],
  },
};
