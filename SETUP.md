# First-time project setup

Follow these steps once after cloning. Takes ~15 minutes (plus native build time).

## 1. Prerequisites

| Tool                      | Version             | Notes                                    |
| ------------------------- | ------------------- | ---------------------------------------- |
| Node.js                   | 20+ (26 tested)     | `node -v`                                |
| npm                       | 10+                 | ships with Node                          |
| Git                       | any recent          |                                          |
| Supabase account          | —                   | https://supabase.com                     |
| Android Studio            | latest              | for `npm run android` (SDK + emulator)   |
| Xcode                     | latest (macOS only) | for `npm run ios`                        |
| Supabase CLI _(optional)_ | latest              | `npm i -g supabase` — to push migrations |

> This project uses **Expo SDK 57**. Always check the matching docs: https://docs.expo.dev/versions/v57.0.0/

## 2. Install dependencies

```bash
git clone <repo-url> medicircle
cd medicircle
npm install
```

`npm install` also runs `husky` (the `prepare` script) to set up git hooks — staged files are linted and formatted on commit.

## 3. Create a Supabase project

1. Create a new project at https://supabase.com/dashboard.
2. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.

## 4. Configure environment variables

```bash
cp .env.example .env
```

| Variable                        | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | Supabase Project URL                                                |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key                                          |
| `EXPO_PUBLIC_WEB_URL`           | Public web address clinic QR codes point to (walk-in check-in page) |

Never commit `.env` or use the `service_role` key in the app.

## 5. Apply database migrations

SQL lives in `supabase/migrations/` and must be applied **in order** (`0001` → `0005`).

**Option A — Supabase CLI**

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B — Dashboard**

Open **SQL Editor** and run each file in `supabase/migrations/` in numeric order.

Then, in **Authentication → URL Configuration**, add the redirect URL `medicircle://` (used by password-reset links). For quicker local testing you may disable "Confirm email" under **Authentication → Providers → Email**.

## 6. Run the app

Camera (QR scan) and other native modules need a **development build**; Expo Go is not enough.

```bash
npm run android      # build & run on Android emulator/device
npm run ios          # build & run on iOS simulator (macOS)
npm start            # start Metro for an already-installed dev build
npm run web          # browser preview
```

The first native build takes several minutes. After that, `npm start` is enough for JS changes.

### Cloud builds (optional, EAS)

```bash
npm i -g eas-cli
eas login
eas build --profile development --platform android   # or ios
```

Profiles are defined in `eas.json` (`development`, `preview`, `production`).

## 7. Verify

```bash
npm run typecheck
npm run lint
```

Both should pass with no errors. Then open the app, sign up as a **patient** or **doctor**, and confirm you land on the role's tab bar.

## Troubleshooting

- **Env changes not picked up** — restart with `npx expo start -c` (clears cache).
- **Styles missing / NativeWind errors** — clear cache as above; check `global.css` and `metro.config.js` are unchanged.
- **Android build fails** — confirm `ANDROID_HOME` is set and an SDK/emulator is installed in Android Studio.
- **iOS pods issue** — `cd ios && pod install` (after the first `npm run ios` generates `ios/`).
- **Auth errors / "Invalid API key"** — re-check the URL and anon key in `.env` and restart Metro.
- **Queries return empty / permission denied** — make sure all five migrations ran (RLS policies are defined there).
