export type Role = 'admin' | 'organizer' | 'volunteer';

export type UserStatus = 'pending' | 'approved' | 'declined';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  
  // Organizer specific fields
  organizationName?: string;
  contactDetails?: string;

  // Volunteer specific fields
  phone?: string;
  interests?: string[]; // areas of interest selected during signup/profile
  totalHours?: number;
  totalPoints?: number;
  memberSince?: string;
}

export type EventStatus = 'pending' | 'ongoing' | 'completed' | 'declined';

export const EVENT_CATEGORIES = [
  'Medical Camp',
  'Education',
  'Environment Cleanup',
  'Disaster Relief',
  'Animal Welfare',
  'Club Events',
  'Awareness Programs',
  'Food Relief',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number] | string;

export interface EventItem {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizerName: string;
  organizationName: string;
  category: EventCategory;
  venue: string;
  date: string;
  time: string;
  duration: number; // in hours
  points: number;
  membersRequired: number;
  membersRegistered: number;
  status: EventStatus;
  contactDetails?: string;
  image?: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  registeredAt: string;
  volunteerPhone?: string;
  volunteerTotalHours?: number;
  volunteerTotalPoints?: number;
  isLeader?: boolean;
  leaderApplication?: LeadershipApplication;
}

export type AttendanceStatus = 'present' | 'absent' | 'pending';

export interface AttendanceRecord {
  id: string;
  eventId: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  status: AttendanceStatus;
  markedAt?: string;
  // Optional Post-Event Feedback Minimal Field
  feedbackComment?: string;
  feedbackSentiment?: 'positive' | 'neutral' | 'negative';
  feedbackSubmittedAt?: string;
}

export type LeadershipStatus = 'pending' | 'approved' | 'rejected';

export interface LeadershipApplication {
  id: string;
  eventId: string;
  eventTitle: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone?: string;
  volunteerTotalHours?: number;
  volunteerTotalPoints?: number;
  reason: string;
  status: LeadershipStatus;
  appliedAt: string;
  // Auto-ranking metrics
  badgeScore?: number;
  categoryFitScore?: number;
  totalRankScore?: number;
  relevantBadges?: string[];
  categoryHistoryCount?: number;
  organizerOverride?: boolean;
}

export interface BurnoutSignal {
  id: string;
  type: 'cadence_drop' | 'latency_increase' | 'negative_sentiment';
  label: string;
  detail: string;
  weight: number;
}

export interface BurnoutAlert {
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  riskScore: number;
  riskLevel: 'normal' | 'moderate' | 'high';
  signals: BurnoutSignal[];
  lastActiveDate: string;
  suggestedCheckInMessage: string;
}

export interface Badge {
  id: string;
  volunteerId: string;
  badgeName: string;
  description: string;
  category: string;
  iconName: string;
  earnedDate: string;
  isUnlocked: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  readStatus: boolean;
  createdAt: string;
  category?: 'burnout_checkin' | 'burnout_reply' | string;
  isBurnoutCheckIn?: boolean;
  organizerId?: string;
  organizerName?: string;
  replyMessage?: string;
  repliedAt?: string;
}

export interface BurnoutReply {
  id: string;
  notificationId: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  organizerId?: string;
  originalMessage: string;
  replyMessage: string;
  repliedAt: string;
}

export interface TeamMessage {
  id: string;
  eventId: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface PlatformStats {
  pendingEvents: number;
  activeOrganizers: number;
  registeredVolunteers: number;
  pendingOrganizerRequests: number;
  completedEventsThisMonth: number;
  totalHoursGenerated: number;
  avgAttendanceRate: number;
}

export interface ServiceLogEntry {
  id: string;
  volunteerId: string;
  volunteerName: string;
  activityTitle: string;
  category: string;
  date: string;
  hoursLogged: number;
  expenseAmount?: number;
  expenseDescription?: string;
  notes?: string;
  status: 'pending' | 'verified' | 'declined';
  createdAt: string;
}

export interface PeerKudo {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  kudoType: string;
  message: string;
  createdAt: string;
}
