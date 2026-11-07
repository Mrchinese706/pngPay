<<<<<<< HEAD
# PNGPay

PNGPay is a simulated digital wallet mobile app for Papua New Guinea, built as a university project. It has a Pacific-inspired visual identity and lets users manage saved payees, record simulated transfers, and organise private pools and savings goals. **No real money is transferred at any point.** All balances and transaction records are simulated inside our own Supabase database and have no connection to any real bank, financial institution, or payment network.

Each user has a simulated wallet balance that starts at PGK 0.00. Adding funds creates a simulated credit; sending a transfer records a debit and is rejected if the wallet does not have enough funds. These records have no real-world monetary value.

---

## Student Details

- **Name:** ENOCH LING-JINGUO
- **Student Number:** 24202208

---

## Tech Stack

- React Native + Expo (Managed Workflow, SDK 53)
- Expo Router (file-based navigation)
- TypeScript (strict mode)
- Supabase (Postgres + Auth, Row Level Security)
- react-hook-form + zod (form validation)
- Open-Meteo API (weather, free, no key)
- Frankfurter.app API (exchange rates, free, no key)

---

## Setup and Run (from a clean clone)

### Prerequisites
- Node.js 18+
- Expo Go app installed on your Android device
- A free Supabase account at https://supabase.com

### Steps

1. Clone the repository and install dependencies:
   ```bash
   git clone <your-repo-url>
   cd pngpay
   npm install
   ```

2. Copy the environment variable template and fill in your Supabase values:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and replace the dummy values with your real Supabase project URL and anon key (found in Supabase Dashboard → Project Settings → API).

3. Run the [payees and transfers migration](./supabase/migrations/20261107000001_payees_and_transfers.sql) in the Supabase SQL Editor.
4. Run the [simulated wallet migration](./supabase/migrations/20261107000002_simulated_wallet.sql) in the Supabase SQL Editor.
5. Run the [Wantok Pool and Bilum Seif migration](./supabase/migrations/20261107000000_pools_and_savings.sql) in the Supabase SQL Editor.

6. Start the development server:
   ```bash
   npx expo start
   ```

7. Scan the QR code with Expo Go on your Android device.

---

## Database Schema

The [payees and transfers migration](./supabase/migrations/20261107000001_payees_and_transfers.sql) creates the base payment tables, indexes, and row-level security policies. Run it in the Supabase SQL Editor before using the Payments or Payees pages.

After it, run the [simulated wallet migration](./supabase/migrations/20261107000002_simulated_wallet.sql). It creates a zero-balance wallet for each existing user, creates wallets automatically for new sign-ups, and records simulated credits and transfer debits in a private wallet ledger. Top-ups and transfers update the wallet and ledger atomically; transfers cannot make a balance negative. Existing transfer records are retained but are not deducted from the new wallet balance.

### Wantok Pool and Bilum Seif migration

After running the base and simulated-wallet migrations above, run [`supabase/migrations/20261107000000_pools_and_savings.sql`](./supabase/migrations/20261107000000_pools_and_savings.sql) once in the Supabase SQL Editor. It creates private, user-owned pool and savings-goal records, append-only simulated contributions, and row-level security policies. The app shows an actionable error if these tables are not installed.

These features organise simulated records only. Pools are private to the signed-in account; they do not invite other users or move real money. Contributions and savings progress are not bank balances.

Transfer details act as receipts: each receipt is loaded by its transaction ID from Supabase before display. The QR code opens that receipt route in PNGPay, which fetches the transaction record; a QR code or screenshot alone is not proof of payment.

---

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

These are inlined at build time by Expo. The `EXPO_PUBLIC_` prefix makes them safe to include in client code — they are the publishable keys, not the secret service-role key. Never add the service-role key to this app.

---

## External APIs and Services

| Service | Purpose | Key required |
|---|---|---|
| Supabase | Auth + database | Anon key (public) |
| Open-Meteo (api.open-meteo.com) | Current weather + 5-day forecast | No |
| Frankfurter.app | PGK → AUD/USD exchange rates | No |

---

## Building an APK / AAB

### One-time setup
```bash
npm install -g eas-cli
eas login
eas init
```

Fill in the `env` blocks in `eas.json` with your real Supabase values before building. The `EXPO_PUBLIC_` variables are inlined at build time — if they are blank, the APK will show a blank screen.

### Preview APK (for testing on a device)
```bash
eas build --platform android --profile preview
```

### Production AAB (for Google Play)
```bash
eas build --platform android --profile production
```

### Local build (no EAS cloud, requires Docker)
```bash
eas build --platform android --profile preview --local
```

> **Never commit your keystore, `credentials.json`, or any `*.jks` file to version control.** These are listed in `.gitignore`.

---

## Screenshots

| Home | Payees | Transfer | Profile |
|---|---|---|---|
| _(add screenshot)_ | _(add screenshot)_ | _(add screenshot)_ | _(add screenshot)_ |

---

## Known Limitations

- **Simulated wallet only.** No real money is transferred. This app has no connection to any bank or payment network.
- **Transfers are an immutable ledger.** Once a transfer is recorded it cannot be edited or deleted. This is intentional: a financial ledger must be append-only to maintain an accurate audit trail.
- **Wantok Pool and Bilum Seif are private simulations.** Group participation is not shared between accounts, and savings entries do not represent money held in an account.
- **No push notifications.** Expo Go does not support background push notifications without a development build.
- **Weather requires location permission.** If denied, weather is not shown. There is no manual city search.
- **Exchange rates are approximate.** Frankfurter.app rates are updated daily and are for display purposes only.

---

## AI Assistance

Amazon Q Developer and Claude were used to scaffold the project structure, generate boilerplate code, and suggest implementations for individual components and services. All generated code was reviewed, understood, and tested by the student. The student can explain every line of code in this project.
=======
# pngPay
PNG Mobile Wallet 
>>>>>>> f6cf1387a39891ddade4eb069c99e019742c6eee
