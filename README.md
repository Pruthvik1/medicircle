<p align="center">
  <img src="assets/brand/medicircle-logo.svg" alt="medicircle" width="320" />
</p>

<p align="center">
  <b>Book the doctor. Skip the waiting room.</b><br/>
  One app for clinics and patients — appointments, live queue and health records.
</p>

<p align="center">
  <img alt="Expo SDK 57" src="https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo" />
  <img alt="React Native 0.86" src="https://img.shields.io/badge/React%20Native-0.86-0F8BC0?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white" />
</p>

---

## Download

**Android:** [Download the latest APK](https://github.com/Pruthvik1/medicircle/releases/latest/download/medicircle.apk) (or browse all [releases](https://github.com/Pruthvik1/medicircle/releases)).

1. Open the link on your phone and download `medicircle.apk`.
2. Tap the file and allow **Install unknown apps** for your browser if Android asks.
3. Open medicircle and sign in.

> iOS builds need TestFlight or an App Store listing, so they can't be shared as a direct download.

<details>
<summary>Maintainers: publish a new APK</summary>

```bash
npx eas-cli login
npx eas-cli build --profile preview --platform android   # builds an installable .apk
```

When the build finishes, download the `.apk` from the EAS link, rename it to `medicircle.apk`, and attach it to a new [GitHub release](https://github.com/Pruthvik1/medicircle/releases/new). The download link above always points at the newest release.

</details>

---

## About

**medicircle** connects doctors and patients in a single mobile app. Doctors set up a profile and clinic; patients find doctors, book slots, join the live queue and keep their records in one place. The same app shows a different experience (and tab bar) depending on the user's role.

| Who                           | Surface                                                        |
| ----------------------------- | -------------------------------------------------------------- |
| Doctor / clinic staff         | Native app                                                     |
| Patient booking from home     | Native app — register → find clinic → book → doctor approves   |
| Walk-in patient at the clinic | Web page opened by scanning the clinic QR (no download needed) |

## Features

**Patients**

- Sign up / login, forgot & reset password
- Find doctors and clinics, book appointment slots
- Scan the clinic QR to check in and follow the live queue ("You're #3")
- Prescriptions, medical records and notifications

**Doctors & clinics**

- Guided onboarding: profile → clinic → availability
- Clinic QR code to show, share or print
- Today's queue, appointment requests, patient records
- Prescriptions and edit-profile

> Planned work and phases live in [`plan.md`](plan.md). Some screens still use mock data (`features/home/mock.ts`) while Supabase wiring is finished.

## Tech stack

| Area         | Choice                                                                              |
| ------------ | ----------------------------------------------------------------------------------- |
| Framework    | [Expo](https://docs.expo.dev/versions/v57.0.0/) SDK 57, React Native 0.86, React 19 |
| Routing      | `expo-router` (file-based, typed routes)                                            |
| Styling / UI | NativeWind 5 + Tailwind CSS 4, gluestack-ui                                         |
| Backend      | Supabase (Auth, Postgres, RLS, Realtime)                                            |
| Data & forms | TanStack Query, React Hook Form, Zod                                                |
| Device       | `expo-camera` (QR scan), `expo-secure-store` (session)                              |
| Tooling      | TypeScript, ESLint, Prettier, Husky + lint-staged, EAS Build                        |

## Project structure

```
app/          Screens & routes (expo-router); (tabs) = role-based tab bar
components/   UI building blocks (ui, brand, forms, queue, doctor, patient…)
features/     Feature modules (auth, doctor, patient, queue, notifications, home)
context/      React contexts (auth)
lib/          Supabase client, query client, schemas, helpers
supabase/     SQL migrations (0001 … 0005)
assets/       Icons, splash and brand logos (assets/brand)
```

## Getting started

Full first-time instructions are in **[`SETUP.md`](SETUP.md)**. Quick version:

```bash
npm install
cp .env.example .env     # then fill in your Supabase values
npx expo start
```

## Scripts

| Command                           | What it does               |
| --------------------------------- | -------------------------- |
| `npm start`                       | Start the Expo dev server  |
| `npm run android` / `npm run ios` | Build & run the native app |
| `npm run web`                     | Run in the browser         |
| `npm run lint`                    | ESLint via Expo            |
| `npm run typecheck`               | TypeScript check           |
| `npm run format`                  | Format with Prettier       |

## Brand

Primary colour `#0F8BC0`. Logo files are in [`assets/brand/`](assets/brand): `medicircle-logo.svg` (full), `medicircle-mark.svg`, `medicircle-icon.svg`.

## License

See [LICENSE](LICENSE).
