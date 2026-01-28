## Run Challenge Web App

Full-stack run challenge platform scaffolded with Next.js (App Router), Tailwind CSS, and an in-memory backend that acts as the **single source of truth** for all entities:

- **Users** (admin / athlete)
- **Challenges**
- **ChallengeParticipants**
- **Runs**
- **Leaderboards**

All frontend pages call REST APIs; there is **no hardcoded or mock business data** in the UI.

### Stack

- Next.js 15 (App Router, TypeScript)
- React 18
- Tailwind CSS
- In-memory data store in `lib/db.ts`

### Main Features Implemented

- **Authentication**
  - Email-only demo auth (no password) via:
    - `POST /api/auth/signup`
    - `POST /api/auth/login`
    - `POST /api/auth/logout`
  - Session stored in an HTTP-only cookie and resolved via `lib/session.ts`
  - `AuthGate` component for protecting pages and enforcing roles (Admin / Athlete)

- **Athlete App**
  - `Home` (`/`): Dashboard powered by `/api/dashboard`
  - `Challenges` (`/challenges`): Tabs (active/upcoming/completed) powered by `/api/challenges`
  - `Challenge detail` (`/challenges/[id]`): Powered by `/api/challenges/[id]` and join via `POST /api/challenges/[id]/join`
  - `Leaderboard` (`/leaderboard`): Select challenge and view rankings via `/api/leaderboard`
  - `Profile` (`/profile`): View/update profile and stats via `/api/profile`

- **Admin**
  - `Admin` (`/admin`): Create challenges (POST `/api/challenges`) and view existing ones

### Running the App

```bash
pnpm install   # or: npm install / yarn install
pnpm dev       # or: npm run dev / yarn dev
```

Then open `http://localhost:3000`.

### Seeding Data

The in-memory store (`lib/db.ts`) intentionally starts **empty** so there is a single dynamic source of truth:

1. Visit `/login`
2. **Sign up** as:
   - Athlete (role: athlete)
   - Admin (role: admin)
3. As **admin**, go to `/admin` and create one or more challenges.
4. As **athlete**, go to `/challenges`, open a challenge, and join it.
5. (Optional) Call `POST /api/runs` to simulate Strava-synced runs:

```bash
curl -X POST http://localhost:3000/api/runs \
  -H "Content-Type: application/json" \
  --cookie "rc_session_user_id=<athleteUserIdFromCookie>" \
  -d '{
    "challengeId": "<challengeId>",
    "distance": 5.2,
    "duration": 1500
  }'
```

Each run updates the leaderboard for that challenge.

### Replacing In-Memory DB with PostgreSQL

To move from the in-memory store to PostgreSQL:

1. **Create tables** that correspond to the shapes defined in `lib/db.ts`:
   - `users`
   - `challenges`
   - `challenge_participants`
   - `runs`
   - `leaderboards` (or compute on the fly with indexed queries)

2. **Swap `InMemoryDB` with a real data access layer**, e.g. using Prisma or a custom repository:
   - Replace each method in `lib/db.ts` (`createUser`, `listChallenges`, `addRun`, `getLeaderboard`, etc.) with SQL/ORM calls.
   - Keep the same method signatures so the rest of the app keeps working.

3. **Add indexing and constraints**:
   - Index `runs(user_id, challenge_id, run_date)`
   - Index `leaderboards(challenge_id, rank)`
   - Enforce foreign keys for `user_id` / `challenge_id` fields.

### Strava Integration (Next Step)

The app is ready to plug in Strava:

- **OAuth**:
  - Add endpoints for Strava OAuth redirect and callback.
  - On successful auth, store `strava_user_id` on the user in place of the current optional field in `lib/db.ts`.

- **Webhooks**:
  - Implement a secure webhook endpoint (e.g. `/api/strava/webhook`) that:
    - Validates Strava signatures.
    - Fetches full activity details from Strava API.
    - Calls the same logic used in `POST /api/runs` to persist runs and recalculate leaderboards.

- **Background jobs**:
  - For production, move long-running Strava sync and leaderboard recalculation into background jobs or a worker queue.

All business logic should stay centralized in the DB/service layer so the frontend continues to rely on a **single, dynamic source of truth**.

