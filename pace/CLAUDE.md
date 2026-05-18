# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
cd pace
npm install          # first time setup
npm run dev          # start dev server at localhost:5173
npm run build        # production build
```

## Architecture

**Pace** is a React + Vite web app styled as a mobile phone UI (390px frame). Stack: React 18, React Router v6, Zustand (persisted to localStorage), Framer Motion, Tailwind CSS v3, OpenAI SDK, Recharts.

### Routing
- `/onboarding` — multi-step profile creation (shown when no user in store)
- `/today` — day tracker (default after onboarding)
- `/plans` — AI-generated group activity plans
- `/plans/:planId/chat` — group chat for accepted plans
- `/profile` — user profile + rhythm view
- `/admin` — municipality dashboard (full desktop layout, no phone frame)

The phone frame wrapper lives in `src/components/layout/PhoneFrame.jsx` and wraps all routes except `/admin`. `App.jsx` handles the conditional guard: no user → redirect to onboarding.

### State (Zustand, `src/store/useStore.js`)
All state persists to localStorage via `zustand/middleware persist`. Key slices:
- `user` — profile object set on onboarding completion
- `logs` — daily logs keyed by date string `"YYYY-MM-DD"`, each containing tracker fields + AI insight
- `plans` — array of plan objects with `status: 'pending' | 'accepted' | 'declined'`
- `chats` — keyed by planId, array of message objects

### AI (`src/lib/openai.js`)
- Uses `VITE_OPENAI_API_KEY` from `.env`. Gracefully falls back to hardcoded responses if key is missing or invalid.
- `analyzeDayLog(log, user)` — called after 3+ tracker fields filled; returns insight, suggestion, activityBalance (0–100 per dimension), socialFulfillment score, tags.
- `generatePlans(wouldveLiked, user, demoUsers)` — returns 2–3 group plan proposals matching user's "Would've Liked" items with demo users.
- Model: `gpt-4o-mini`. System prompt enforces non-diagnostic language — never use "lonely", "isolated", "depressed".

### Demo data (`src/data/demoUsers.js`)
8 pre-seeded demo users for plan matching. `demoAggregateStats` powers the admin dashboard charts with realistic-looking population data.

### Design system
Tailwind custom colors are all prefixed `pace-` (e.g. `bg-pace-bg`, `text-pace-green`). Defined in `tailwind.config.js`. All tracker modals use `src/components/tracker/TrackModal.jsx` with a bottom-sheet animation via Framer Motion. The bottom nav uses `NavLink` active state to apply green pill background.

### Key UI patterns
- Bottom-sheet modals slide up with `y: "100%"` → `y: 0` spring animation
- Page transitions use `AnimatePresence` with horizontal slide
- Cards: `rounded-2xl shadow-card` (custom shadow from tailwind config)
- `scrollbar-hide` utility class hides scrollbars for native mobile feel
- Phone frame: `max-w-[390px]`, `height: min(844px, 100vh - 32px)`, `rounded-[44px]`
