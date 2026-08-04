# Impact Pulse

A volunteer impact-management platform that goes beyond scheduling and hour-tracking — it actively protects volunteer retention instead of just gamifying participation.

**Live Demo:** https://impactpulse-final.ai.studio

---

## The Problem

Most volunteer/social-service portals handle the basics — sign-ups, scheduling, hour tracking — but stop there. Two gaps stood out to us:

1. **Matching is shallow.** Volunteers pick from a flat list of open shifts instead of being matched by skill, interest, or reliability, which leads to mismatched roles and drop-off.
2. **Retention tools only push people to do more.** Streaks, leaderboards, and badges reward increasing activity — none of them catch a volunteer quietly over-committing and disengaging *before* they ghost entirely.

Impact Pulse is built to close both gaps.

## Features

**Core**
- Role-based access for Admins, Organizers, and Volunteers
- Event creation, approval workflow, and attendance tracking
- Volunteer profiles, points, and badge progression
- Beneficiary case linkage with outcome tracking, for funder-facing impact reporting

**Novel additions**
- **Skill-based matching engine** — recommends opportunities to volunteers (and volunteers to organizers) based on weighted skill overlap, category interest, attendance reliability, and recent activity — not just open-shift availability
- **Burnout early-warning system** — the inverse of typical gamification: instead of pushing volunteers toward more activity, it tracks participation cadence, notification response latency, and post-event feedback sentiment per volunteer to flag *early disengagement risk* to organizers, prompting a check-in rather than another task assignment. Flags are visible only to organizers, never scored against the volunteer.
- **Leadership candidate ranking** — when multiple volunteers apply to lead an event, applicants are automatically ranked by badge/achievement tier and category-fit with the event, with both factors shown transparently so organizers can still override the suggested order.

## Tech Stack

- **Frontend:** Vite + TypeScript
- **Backend:** Node.js (`server.ts`)
- **Database / Auth:** [Supabase](https://supabase.com) (Postgres, Row Level Security, Auth)
- **Built with:** Google AI Studio

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS recommended)
- A [Supabase](https://supabase.com) project (free tier is enough)

### Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd impact-pulse

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Fill in `.env` with your Supabase project credentials (found in Supabase → Project Settings → API):

```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

```bash
# Run locally
npm run dev
```

The app will be available at `http://localhost:5173` (Vite's default port).

> **Note:** Google Sign-In (if enabled) requires a live/deployed domain and will not work on `localhost` — use email/password auth for local testing.

## Project Structure

```
impact-pulse/
├── src/            # Frontend application code
├── server.ts       # Backend server
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.example
```



## License

[Add your chosen license here, e.g. MIT]
