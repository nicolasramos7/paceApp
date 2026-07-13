# Pace

Pace is an AI-powered app that helps tackle loneliness in municipalities. It gives people a light, private way to track their daily rhythm and turns that data into real, low-pressure group activities with other people nearby, while giving local governments anonymised, non-personal insights into the wellbeing of their residents.

> Built in a hackathon by a team of 3 (myself + 2 teammates). The goal: use AI to help fight loneliness at a community level, without labeling or diagnosing anyone, and to give municipalities useful, privacy-respecting data to act on.

---

## The Problem

Loneliness is hard to measure and hard to talk about. People rarely say "I feel isolated," but they do notice things like skipping meals alone, staying in more than they'd like, or wishing they'd gone for a walk with someone. Pace is built around that insight: track small daily signals, gently surface patterns, and turn them into real invitations to do something with other people, while giving municipalities the aggregate picture they need to support their communities, without ever seeing individual personal data.

---

## Features

### Daily rhythm tracker
- Log simple daily signals: sleep, movement, meals, activity/energy, and social contact.
- A "Would've liked to..." field captures activities a person wanted to do but didn't get to (e.g. take a walk, grab a coffee, go to a local event).
- A daily summary view shows the day at a glance, with history browsable by day.

### AI-generated insights
- After enough tracker fields are filled in, AI analyzes the day and returns a short, human insight, a gentle suggestion, and an "activity balance" score across different dimensions of wellbeing.
- The AI is explicitly instructed to **never use clinical or diagnostic language** ("lonely," "isolated," "depressed," "alone" are all off-limits). Everything is framed positively, in terms of "social wellness," "life rhythm," and "connection opportunities."

### AI-matched group plans
- Based on what a person "would've liked" to do, the AI generates 2-3 casual **group activity proposals** (3-5 people), matching them with other users who share similar interests or wishes.
- Plans include a title, description, suggested time, a real nearby location, and suggested participants — always framed as low-pressure and inviting, and always group-based rather than 1-on-1.
- Users can accept or decline a plan; accepted plans open into a **group chat** to coordinate.

### Onboarding & profile
- A guided, multi-step onboarding collects the essentials (name, age, gender, country, ZIP code) plus optional details (occupation, language, pets) and interests.
- A profile page shows a personal "rhythm" view built from tracked history.

### Municipality dashboard
- A separate, desktop-oriented dashboard lets a municipality view **anonymised, aggregated wellness data** for its area (never individual personal data).
- Includes population-level stats such as social fulfillment scores, average time spent outside, the most-desired activities residents wish they had access to, weekly trends, breakdowns by age group, and a heatmap of unmet activity demand by neighborhood/area.
- Designed so local governments can spot where residents want more social or community activities and act on it, without any privacy trade-off for users.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| State | Zustand (persisted to localStorage) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| AI | Google Gemini (`gemini-2.5-flash-lite`) |
| Testing | Vitest |

The app is styled as a mobile phone UI (a 390px phone frame wraps every screen except the municipality dashboard, which uses a full desktop layout).

---

## Getting Started

```bash
cd pace
npm install
```

Create a `.env` file (see `.env.example`) and add your Gemini API key:
```
VITE_GEMINI_API_KEY=your_key_here
```
If no key is provided, the app gracefully falls back to hardcoded demo responses so it still works for a demo.

Start the dev server:
```bash
npm run dev
```
The app runs at `http://localhost:5173`.

Other useful commands:
```bash
npm run build     # production build
npm run preview   # preview the production build
npm run test      # run tests with Vitest
```

---

## App Structure

- `/onboarding` – multi-step profile creation
- `/today` – daily rhythm tracker (default screen after onboarding)
- `/plans` – AI-generated group activity plans
- `/plans/:planId/chat` – group chat for an accepted plan
- `/profile` – personal profile and rhythm view
- `/admin` – municipality dashboard with anonymised, aggregated resident data

Demo data for 8 pre-seeded users is included so plan matching and the municipality dashboard can be explored without needing a full user base.

---

## Hackathon Context

Pace was built during a hackathon by a team of 3, with the goal of using AI to help tackle loneliness in municipalities: giving individuals a gentle, judgment-free way to notice patterns and connect with others, while giving local governments non-personal, aggregated data to better support their communities.

**Team members:**
- Jaume Ferrer
- Davide Merlotti
- Nico Ramos
