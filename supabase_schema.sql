-- SQL Migration Script for Supabase
-- ImpactPulse2.0 Database Schema

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'organizer', 'volunteer')),
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'declined')),
    organization_name TEXT,
    contact_details TEXT,
    phone TEXT,
    interests TEXT[],
    total_hours NUMERIC DEFAULT 0,
    total_points NUMERIC DEFAULT 0,
    member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    organizer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    organizer_name TEXT NOT NULL,
    organization_name TEXT,
    category TEXT NOT NULL,
    venue TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration NUMERIC DEFAULT 0,
    points NUMERIC DEFAULT 0,
    members_required INT DEFAULT 0,
    members_registered INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ongoing', 'completed', 'declined')),
    contact_details TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    volunteer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    volunteer_name TEXT NOT NULL,
    volunteer_email TEXT NOT NULL,
    volunteer_phone TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    volunteer_total_hours NUMERIC DEFAULT 0,
    volunteer_total_points NUMERIC DEFAULT 0,
    is_leader BOOLEAN DEFAULT FALSE,
    UNIQUE(event_id, volunteer_id)
);

-- 4. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    volunteer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    volunteer_name TEXT NOT NULL,
    volunteer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('present', 'absent', 'pending')),
    marked_at TIMESTAMP WITH TIME ZONE,
    feedback_comment TEXT,
    feedback_sentiment TEXT CHECK (feedback_sentiment IN ('positive', 'neutral', 'negative')),
    feedback_submitted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(event_id, volunteer_id)
);

-- 5. LEADERSHIP APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS leadership_applications (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    volunteer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    volunteer_name TEXT NOT NULL,
    volunteer_email TEXT NOT NULL,
    volunteer_phone TEXT,
    volunteer_total_hours NUMERIC DEFAULT 0,
    volunteer_total_points NUMERIC DEFAULT 0,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    badge_score NUMERIC DEFAULT 0,
    category_fit_score NUMERIC DEFAULT 0,
    total_rank_score NUMERIC DEFAULT 0,
    relevant_badges TEXT[],
    category_history_count INT DEFAULT 0,
    organizer_override BOOLEAN DEFAULT FALSE
);

-- 6. BADGES TABLE
CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    volunteer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_unlocked BOOLEAN DEFAULT TRUE
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT,
    is_burnout_checkin BOOLEAN DEFAULT FALSE,
    organizer_id TEXT,
    organizer_name TEXT,
    reply_message TEXT,
    replied_at TIMESTAMP WITH TIME ZONE
);

-- 8. BURNOUT REPLIES TABLE
CREATE TABLE IF NOT EXISTS burnout_replies (
    id TEXT PRIMARY KEY,
    notification_id TEXT REFERENCES notifications(id) ON DELETE CASCADE,
    volunteer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    volunteer_name TEXT NOT NULL,
    volunteer_email TEXT NOT NULL,
    organizer_id TEXT,
    original_message TEXT,
    reply_message TEXT NOT NULL,
    replied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TEAM MESSAGES TABLE
CREATE TABLE IF NOT EXISTS team_messages (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. SERVICE LOGS TABLE
CREATE TABLE IF NOT EXISTS service_logs (
    id TEXT PRIMARY KEY,
    volunteer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    volunteer_name TEXT NOT NULL,
    activity_title TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    hours_logged NUMERIC NOT NULL,
    expense_amount NUMERIC DEFAULT 0,
    expense_description TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. PEER KUDOS TABLE
CREATE TABLE IF NOT EXISTS peer_kudos (
    id TEXT PRIMARY KEY,
    sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    recipient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    kudo_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. VIEWS FOR SPECIFIC ROLES (VOLUNTEERS, ORGANIZERS, ADMINS)
CREATE OR REPLACE VIEW volunteers AS
SELECT id, name, email, status, phone, interests, total_hours, total_points, member_since, created_at
FROM users
WHERE role = 'volunteer';

CREATE OR REPLACE VIEW organizers AS
SELECT id, name, email, status, organization_name, contact_details, phone, member_since, created_at
FROM users
WHERE role = 'organizer';

CREATE OR REPLACE VIEW admins AS
SELECT id, name, email, status, phone, member_since, created_at
FROM users
WHERE role = 'admin';

-- Disable Row Level Security (RLS) for server API access or enable public read/write policy if desired
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE leadership_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE peer_kudos DISABLE ROW LEVEL SECURITY;
