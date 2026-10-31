# medicircle — product plan

Doctors create a profile and clinic; patients find doctors, book slots, join the live queue and keep their records. Backend: **Supabase** (auth, Postgres, RLS, realtime). App: Expo (React Native) with expo-router; one app, different tab bars per role.

## Surfaces
| Who | Surface |
|---|---|
| Doctor / clinic staff | Native app |
| Patient booking from home | Native app (register → find clinic → book → doctor approves) |
| Walk-in patient at the clinic | Web page opened by scanning the clinic QR (no download needed) — token + live position |

## Patient app
**Onboarding and account** — splash, login, register (phone OTP is better than email for India-style clinics), forgot/reset password; profile setup (name, DOB, gender, blood group, allergies, chronic conditions); family members (book on behalf of a child/parent)

**Find and book** — home (upcoming appointment, quick search, nearby clinics, "my doctors"); search and filters (specialty, distance, rating, fee, available today, language); doctor profile (bio, clinic, fees, reviews, slots); slot picker (date strip, time chips, reason, optional upload); booking summary + add-to-calendar; status: pending / approved / declined with suggested slots

**Visit day** — my appointments (upcoming/past, reschedule, cancel); check-in (scan clinic QR or "I'm here"); live queue ("You're #3, ~20 min") with push when nearly your turn; doctor drawer on the queue page (rating, rewards, reviews)

**Health record** — prescriptions (view, PDF, share, refill/book again); medical reports (upload, categorize, view); visit history with doctor notes if shared; medication reminders (later)

**Other** — notifications, reviews and ratings after a visit, help/support, settings

## Doctor app
**Setup** — sign up, profile (photo, specialty, registration no., qualifications, fees); clinic (address, map pin, photos); availability (weekly hours, slot length, breaks, leave days, auto-approve toggle); clinic QR (show, share, print)

**Daily work** — dashboard (today's count, next patient, pending requests, revenue); today's queue (walk-ins + booked on one list: Call next / Skip / Done); appointment requests (approve, decline, propose another time); calendar (day/week, block-out, reschedule); add walk-in manually

**Patient and consultation** — patient list (search, filters: repeat / new / follow-up due); patient profile (demographics, allergies, history timeline, reports, prescriptions); consultation screen (complaints, vitals, diagnosis, notes, follow-up date); prescription builder (medicine search, dose, frequency, duration, instructions, templates; PDF with clinic letterhead, sent in-app and via WhatsApp/SMS); reports viewer with notes

**Analytics** — appointments by day/week/month (booked vs walk-in); revenue (collected, pending, by day, by fee); no-show and cancellation rate, average wait, peak hours; new vs repeat patients, top reasons for visit; export CSV/PDF

**Billing** — mark paid (cash/UPI), receipts, fee per visit (feeds revenue analytics)

**Other** — staff accounts (receptionist, limited access), notifications, subscription plan, settings

## Decide early
- **Medical data is sensitive**: encryption, access logs, patient consent before a doctor sees uploaded records; DPDP Act (India) / HIPAA depending on launch market. Design now, not later.
- **Roles**: doctor/patient split at registration (role picker) — one app, different tab bars.
- **Prescription legality**: PDF needs doctor's registration number and signature; check local rules.

## Build order
1. **Phase 1 — booking loop**: roles + registration, doctor profile + availability, patient search + slot booking, doctor approve/decline, appointment lists
2. **Phase 2 — clinic day**: QR code, web check-in, live queue, push notifications
3. **Phase 3 — records**: patient profile + history, report upload, consultation notes, prescription PDFs
4. **Phase 4 — business**: analytics, billing, staff accounts, reviews

## Status (as of 2026-10-31)
**Done**
- Brand: logo + icons (`#0F8BC0`), tokens in `global.css`, animated logo loader
- Supabase auth (login, forgot/reset password), session stored via SecureStore (in-memory fallback)
- Schema `supabase/migrations/0001_init.sql`; doctor onboarding rpc `0002_doctor_onboarding.sql`
- Sign-up with patient/doctor choice; doctor onboarding (profile → clinic → availability)
- Role-based tabs (patient vs clinic) — **screens still use mock data** (`features/home/mock.ts`)
- Queue screen with doctor drawer (mock data)

**Next (Phase 1)**
- Patient: real doctor search from `doctors`/`clinics`, doctor profile, slot picker, create `appointments`
- Doctor: requests list from `appointments`, approve/decline (+ auto-approve), availability editing
- Replace mock data on home/appointments/records with Supabase queries

**Later** — phases 2–4 above.
