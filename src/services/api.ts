import {
  User,
  EventItem,
  Registration,
  AttendanceRecord,
  LeadershipApplication,
  Badge,
  NotificationItem,
  TeamMessage,
  PlatformStats,
  Role,
  BurnoutAlert,
  BurnoutReply,
  ServiceLogEntry,
  PeerKudo,
} from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
  } catch (netErr: any) {
    throw new Error(`Connection error: ${netErr.message || 'Failed to reach server'}`);
  }

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): ${res.statusText || text || 'Request failed'}`);
    }
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Server returned invalid response format');
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, role: Role) =>
    request<{ message: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'password', role }),
    }),

  register: (userData: Partial<User>) =>
    request<{ message: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Users
  getUsers: (role?: Role, status?: string) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    return request<User[]>(`/api/users?${params.toString()}`);
  },

  updateUserStatus: (id: string, status: 'approved' | 'declined') =>
    request<{ message: string; user: User }>(`/api/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  updateUserProfile: (id: string, profile: Partial<User>) =>
    request<{ message: string; user: User }>(`/api/users/${id}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  // Events
  getEvents: (status?: string, organizerId?: string, category?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (organizerId) params.append('organizerId', organizerId);
    if (category) params.append('category', category);
    return request<EventItem[]>(`/api/events?${params.toString()}`);
  },

  createEvent: (eventData: Partial<EventItem>) =>
    request<{ message: string; event: EventItem }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  updateEventStatus: (id: string, status: 'ongoing' | 'completed' | 'declined') =>
    request<{ message: string; event: EventItem }>(`/api/events/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Registrations
  getRegistrations: (volunteerId?: string, eventId?: string) => {
    const params = new URLSearchParams();
    if (volunteerId) params.append('volunteerId', volunteerId);
    if (eventId) params.append('eventId', eventId);
    return request<Registration[]>(`/api/registrations?${params.toString()}`);
  },

  registerForEvent: (eventId: string, volunteerId: string) =>
    request<{ message: string; registration: Registration }>('/api/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId, volunteerId }),
    }),

  cancelRegistration: (id: string) =>
    request<{ message: string }>(`/api/registrations/${id}`, {
      method: 'DELETE',
    }),

  // Attendance
  getAttendance: (eventId?: string, volunteerId?: string) => {
    const params = new URLSearchParams();
    if (eventId) params.append('eventId', eventId);
    if (volunteerId) params.append('volunteerId', volunteerId);
    return request<AttendanceRecord[]>(`/api/attendance?${params.toString()}`);
  },

  markAttendance: (eventId: string, volunteerId: string, status: 'present' | 'absent') =>
    request<{ message: string; attendance: AttendanceRecord }>('/api/attendance', {
      method: 'POST',
      body: JSON.stringify({ eventId, volunteerId, status }),
    }),

  submitFeedback: (attendanceId: string, comment: string, sentiment: 'positive' | 'neutral' | 'negative') =>
    request<{ message: string; attendance: AttendanceRecord }>(`/api/attendance/${attendanceId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ comment, sentiment }),
    }),

  // Burnout Early-Warning System (Organizer only)
  getBurnoutAlerts: (organizerId?: string) => {
    const params = new URLSearchParams();
    if (organizerId) params.append('organizerId', organizerId);
    return request<BurnoutAlert[]>(`/api/organizer/burnout-alerts?${params.toString()}`);
  },

  sendCheckInMessage: (volunteerId: string, message: string, organizerId?: string) =>
    request<{ message: string }>('/api/organizer/checkin-message', {
      method: 'POST',
      body: JSON.stringify({ volunteerId, message, organizerId }),
    }),

  replyBurnoutCheckIn: (data: { notificationId?: string; volunteerId: string; replyMessage: string }) =>
    request<{ message: string; reply: BurnoutReply }>('/api/volunteer/reply-burnout-checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBurnoutReplies: (organizerId?: string) => {
    const params = new URLSearchParams();
    if (organizerId) params.append('organizerId', organizerId);
    return request<BurnoutReply[]>(`/api/organizer/burnout-replies?${params.toString()}`);
  },

  // Leadership
  getLeadershipApplications: (eventId?: string, volunteerId?: string) => {
    const params = new URLSearchParams();
    if (eventId) params.append('eventId', eventId);
    if (volunteerId) params.append('volunteerId', volunteerId);
    return request<LeadershipApplication[]>(`/api/leadership?${params.toString()}`);
  },

  applyForLeadership: (eventId: string, volunteerId: string, reason: string) =>
    request<{ message: string; application: LeadershipApplication }>('/api/leadership', {
      method: 'POST',
      body: JSON.stringify({ eventId, volunteerId, reason }),
    }),

  updateLeadershipStatus: (id: string, status: 'approved' | 'rejected', organizerOverride?: boolean) =>
    request<{ message: string; application: LeadershipApplication }>(`/api/leadership/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, organizerOverride }),
    }),

  // Badges
  getBadges: (volunteerId?: string) => {
    const params = new URLSearchParams();
    if (volunteerId) params.append('volunteerId', volunteerId);
    return request<Badge[]>(`/api/badges?${params.toString()}`);
  },

  // Notifications
  getNotifications: (userId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    return request<NotificationItem[]>(`/api/notifications?${params.toString()}`);
  },

  markNotificationRead: (id: string) =>
    request<{ message: string }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: (userId?: string) =>
    request<{ message: string }>('/api/notifications/read-all', {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    }),

  sendQuickNotification: (payload: {
    senderId: string;
    senderName: string;
    senderRole: Role;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'alert' | 'success';
  }) =>
    request<{ message: string; recipientCount: number }>('/api/notifications/quick-broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Team Messages
  getTeamMessages: (eventId: string) =>
    request<TeamMessage[]>(`/api/team-messages/${eventId}`),

  sendTeamMessage: (eventId: string, senderName: string, senderRole: string, message: string) =>
    request<TeamMessage>('/api/team-messages', {
      method: 'POST',
      body: JSON.stringify({ eventId, senderName, senderRole, message }),
    }),

  // Service Hours & Expense Logs
  getServiceLogs: (volunteerId?: string) => {
    const params = new URLSearchParams();
    if (volunteerId) params.append('volunteerId', volunteerId);
    return request<ServiceLogEntry[]>(`/api/service-logs?${params.toString()}`);
  },

  logServiceHours: (data: Partial<ServiceLogEntry>) =>
    request<{ message: string; log: ServiceLogEntry }>('/api/service-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Peer Kudos & Community
  getPeerKudos: (volunteerId?: string) => {
    const params = new URLSearchParams();
    if (volunteerId) params.append('volunteerId', volunteerId);
    return request<PeerKudo[]>(`/api/peer-kudos?${params.toString()}`);
  },

  sendPeerKudos: (data: { senderId: string; senderName: string; recipientId: string; recipientName: string; kudoType: string; message: string }) =>
    request<{ message: string; kudo: PeerKudo }>('/api/peer-kudos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Stats
  getAdminStats: () => request<PlatformStats>('/api/stats/admin'),

  // AI Features
  generateImpactReport: (stats?: any, scope?: string) =>
    request<{ report: string }>('/api/ai/impact-report', {
      method: 'POST',
      body: JSON.stringify({ stats, scope }),
    }),

  getAIRecommendations: (volunteerName: string, availableEvents?: any[]) =>
    request<{ recommendationText: string; recommendedEventIds: string[] }>('/api/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({ volunteerName, availableEvents }),
    }),
};
