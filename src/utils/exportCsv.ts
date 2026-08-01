import { EventItem, Registration, AttendanceRecord, User, Badge, ServiceLogEntry } from '../types';

/**
 * Trigger browser download of CSV data
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export detailed event roster report (Event Metadata + Participating Volunteers List)
 */
export function exportEventRosterCsv(
  event: EventItem,
  registrations: Registration[],
  leaderName?: string
) {
  const filename = `${event.title.replace(/[^a-zA-Z0-0]/g, '_')}_Event_Participants.csv`;

  const headers = [
    'Event ID',
    'Event Title',
    'Category',
    'Date',
    'Time',
    'Venue',
    'Organization',
    'Organizer Name',
    'Appointed Leader',
    'Capacity (Registered/Required)',
    'Volunteer ID',
    'Volunteer Name',
    'Volunteer Email',
    'Volunteer Phone',
    'Role',
    'Registration Date',
    'Volunteer Total Impact Hours',
    'Volunteer Impact Points'
  ];

  const rows = registrations.map((r) => [
    event.id,
    event.title,
    event.category,
    event.date,
    event.time,
    event.venue,
    event.organizationName || 'ImpactPulse Partner',
    event.organizerName,
    leaderName || 'Not Appointed',
    `${event.membersRegistered}/${event.membersRequired}`,
    r.volunteerId,
    r.volunteerName,
    r.volunteerEmail,
    r.volunteerPhone || 'N/A',
    r.isLeader ? 'Team Leader' : 'Volunteer',
    r.registeredAt,
    r.volunteerTotalHours ?? 'N/A',
    r.volunteerTotalPoints ?? 'N/A',
  ]);

  // If no registrations, output event metadata row
  if (rows.length === 0) {
    rows.push([
      event.id,
      event.title,
      event.category,
      event.date,
      event.time,
      event.venue,
      event.organizationName || 'ImpactPulse Partner',
      event.organizerName,
      leaderName || 'Not Appointed',
      `${event.membersRegistered}/${event.membersRequired}`,
      'N/A',
      'No registered volunteers yet',
      'N/A',
      'N/A',
      'N/A',
      'N/A',
      'N/A',
      'N/A'
    ]);
  }

  downloadCsv(filename, headers, rows);
}

/**
 * Export attendance records spreadsheet for an event
 */
export function exportAttendanceRosterCsv(
  eventTitle: string,
  attendanceRecords: AttendanceRecord[]
) {
  const filename = `${eventTitle.replace(/[^a-zA-Z0-0]/g, '_')}_Attendance_Roster.csv`;

  const headers = [
    'Volunteer Name',
    'Volunteer Email',
    'Attendance Status',
    'Verification Timestamp',
    'Feedback / Notes'
  ];

  const rows = attendanceRecords.map((rec) => [
    rec.volunteerName,
    rec.volunteerEmail,
    rec.status.toUpperCase(),
    rec.markedAt || 'Pending Mark',
    rec.feedbackComment || 'None'
  ]);

  downloadCsv(filename, headers, rows);
}

/**
 * Export summary sheet of all events in dashboard/list
 */
export function exportEventsSummaryCsv(events: EventItem[], titlePrefix = 'Events_Report') {
  const filename = `${titlePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;

  const headers = [
    'Event ID',
    'Title',
    'Category',
    'Date',
    'Time',
    'Venue',
    'Organizer',
    'Organization',
    'Registered Volunteers',
    'Capacity Required',
    'Status',
    'Impact Points'
  ];

  const rows = events.map((ev) => [
    ev.id,
    ev.title,
    ev.category,
    ev.date,
    ev.time,
    ev.venue,
    ev.organizerName,
    ev.organizationName || 'N/A',
    ev.membersRegistered,
    ev.membersRequired,
    ev.status.toUpperCase(),
    ev.points
  ]);

  downloadCsv(filename, headers, rows);
}

/**
 * Export verified organizers list
 */
export function exportOrganizersDirectoryCsv(organizers: User[], events: EventItem[]) {
  const filename = `Verified_Organizers_Directory_${new Date().toISOString().slice(0, 10)}.csv`;

  const headers = [
    'Organizer ID',
    'Organizer Name',
    'Organization Name',
    'Email Address',
    'Phone Contact',
    'Approval Status',
    'Total Events Conducted'
  ];

  const rows = organizers.map((org) => {
    const orgEventsCount = events.filter((e) => e.organizerId === org.id).length;
    return [
      org.id,
      org.name,
      org.organizationName || 'Independent',
      org.email,
      org.contactDetails || 'N/A',
      (org.status || 'approved').toUpperCase(),
      orgEventsCount
    ];
  });

  downloadCsv(filename, headers, rows);
}

/**
 * Export volunteers roster sheet
 */
export function exportVolunteersRosterCsv(volunteers: User[]) {
  const filename = `Volunteers_Directory_${new Date().toISOString().slice(0, 10)}.csv`;

  const headers = [
    'Volunteer ID',
    'Volunteer Name',
    'Email Address',
    'Phone Number',
    'Total Volunteer Hours',
    'Impact Points',
    'Interests / Cause Areas'
  ];

  const rows = volunteers.map((vol) => [
    vol.id,
    vol.name,
    vol.email,
    vol.phone || 'N/A',
    vol.totalHours || 0,
    vol.totalPoints || 0,
    vol.interests ? vol.interests.join('; ') : 'General Volunteer'
  ]);

  downloadCsv(filename, headers, rows);
}

/**
 * Export volunteer unlocked badges & achievements sheet (.CSV)
 */
export function exportBadgesCsv(user: User, badges: Badge[]) {
  const filename = `${user.name.replace(/[^a-zA-Z0-9]/g, '_')}_Unlocked_Badges_Gallery.csv`;

  const headers = [
    'Volunteer Name',
    'Badge Name',
    'Category / Type',
    'Description',
    'Status',
    'Date Earned'
  ];

  const rows = badges.map((b) => [
    user.name,
    b.badgeName,
    b.category || 'Achievement',
    b.description,
    b.isUnlocked ? 'UNLOCKED' : 'LOCKED',
    b.earnedDate || 'In Progress'
  ]);

  downloadCsv(filename, headers, rows);
}
export function exportVolunteerTranscriptCsv(
  user: User,
  attendanceRecords: AttendanceRecord[],
  eventsMap: Record<string, EventItem>
) {
  const filename = `${user.name.replace(/[^a-zA-Z0-9]/g, '_')}_Official_Volunteering_Transcript.csv`;

  const headers = [
    'Volunteer Name',
    'Email Address',
    'Event Title',
    'Event Date',
    'Venue',
    'Hours Granted',
    'Impact Points Earned',
    'Attendance Verification Status',
    'Verification Timestamp'
  ];

  const rows = attendanceRecords.map((att) => {
    const ev = eventsMap[att.eventId];
    return [
      user.name,
      user.email,
      ev?.title || 'Community Volunteering Drive',
      ev?.date || 'Verified Session',
      ev?.venue || 'Campus Venue',
      ev?.duration || 4,
      ev?.points || 50,
      att.status.toUpperCase(),
      att.markedAt || 'Verified'
    ];
  });

  if (rows.length === 0) {
    rows.push([
      user.name,
      user.email,
      'No completed events yet',
      'N/A',
      'N/A',
      user.totalHours || 0,
      user.totalPoints || 0,
      'ACTIVE_MEMBER',
      'N/A'
    ]);
  }

  downloadCsv(filename, headers, rows);
}

/**
 * Export volunteer logged off-site service & expense records (.CSV)
 */
export function exportServiceLogsCsv(user: User, logs: ServiceLogEntry[]) {
  const filename = `${user.name.replace(/[^a-zA-Z0-9]/g, '_')}_Service_Hours_and_Expenses.csv`;

  const headers = [
    'Volunteer Name',
    'Activity Title',
    'Category',
    'Date Performed',
    'Logged Hours',
    'Expense Amount ($)',
    'Expense Description',
    'Verification Status',
    'Activity Notes'
  ];

  const rows = logs.map((l) => [
    user.name,
    l.activityTitle,
    l.category,
    l.date,
    l.hoursLogged,
    l.expenseAmount ? `$${l.expenseAmount.toFixed(2)}` : '$0.00',
    l.expenseDescription || 'N/A',
    l.status.toUpperCase(),
    l.notes || ''
  ]);

  downloadCsv(filename, headers, rows);
}


