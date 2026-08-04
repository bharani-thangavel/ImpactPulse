# ImpactPulse 2.0 – Unified Community Volunteering & Impact Platform

ImpactPulse 2.0 is a full-stack, multi-role community volunteering and impact management platform. It empowers volunteers, organizers, and platform administrators with streamlined event coordination, verified service hour tracking, gamified achievements, peer recognition, wellness monitoring, and AI-powered event optimization.

---

## 🚀 Live Deployment Link

- **Live Application URL**: https://impactpulse-final.ai.studio

---

## ✨ Key Features & User Roles

### 1. 🙋‍♂️ Volunteer Portal
- **Event Discovery & Filtering**: Search and filter upcoming community events by location, category, duration, and rewards.
- **One-Click Event Registration**: Instant sign-up with real-time slot tracking and calendar integrations.
- **Verified Service Hours**: Log community service hours with expense receipts and descriptions for organizer approval.
- **Gamification & Rewards**: Earn points, unlock achievement badges (e.g. *Eco Guardian*, *First Steps*), and climb leaderboard ranks.
- **Peer Kudos & Social Impact**: Send appreciation messages and recognitions to fellow volunteers.
- **AI Burnout Assistant**: Complete periodic wellness checks and receive automated AI guidance powered by Gemini.

### 2. 🏢 Organizer Portal
- **Event Lifecycle Management**: Draft, schedule, update, or cancel community drives and volunteer events.
- **Volunteer Rosters**: Review registrations, assign team leaders, and send group updates.
- **Hours & Expense Verification**: Audit and approve volunteer service logs and reimbursement claims.
- **Impact Analytics**: Track total volunteer hours, active volunteers, and organization-wide metrics.

### 3. 🛡️ Admin Portal
- **User Verification & Approvals**: Review and approve pending organizer and volunteer registrations.
- **System Metrics & Monitoring**: Platform-wide activity dashboard monitoring user growth, event output, and database sync status.
- **Broadcast System**: Send platform-wide announcements and alerts to all registered users.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion (Framer Motion)
- **Backend API**: Express.js (Node.js runtime / serverless API handlers)
- **Database**: Supabase PostgreSQL with real-time client & row-level access patterns (`supabase_schema.sql`)
- **AI Engine**: Google Gemini API (`@google/genai`) for event enrichment, match suggestions, and wellness support
- **Deployment & Serverless Routing**: Configured for Cloud Run container hosting & Vercel serverless deployment (`vercel.json`)

---

## 🗄️ Database Schema & Structure

The complete database structure and initial seed data are provided in `supabase_schema.sql`.

### Core Tables
- `users`: Profiles for Volunteers, Organizers, and System Admins.
- `events`: Community service events, locations, reward points, and capacity.
- `registrations`: Volunteer sign-ups and attendance statuses.
- `badges`: Earned volunteer achievements and milestone unlocks.
- `service_logs`: Detailed volunteer service hours, expense claims, and verification statuses.
- `peer_kudos`: Peer appreciation logs and social recognition.
- `notifications`: User alert feed and system broadcast messages.
- `burnout_logs`: Wellness check records and AI response logs.
- `team_messages`: Event-specific messaging threads.

---

## ⚙️ Environment Variables

Copy `.env.example` to create your local `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key
```

---

## 📦 Local Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/srisatish-dev/ImpactPulse2.0.git
   cd ImpactPulse2.0
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Database**:
   - Create a project on [Supabase](https://supabase.com/).
   - Open the SQL Editor in Supabase and execute the script inside `supabase_schema.sql`.

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:3000`.

---

## 🚀 Build & Production Deployment

### Production Build
```bash
npm run build
npm start
```

### Vercel Serverless Deployment
1. Import the repository into **Vercel**.
2. Add the environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) in **Project Settings > Environment Variables**.
3. Deploy directly. `vercel.json` and `/api/index.ts` automatically route backend endpoints cleanly.

---

## 📄 License

Distributed under the MIT License.
