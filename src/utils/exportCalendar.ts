import { EventItem } from '../types';

/**
 * Generates and triggers download of a standard .ics Calendar file
 * compatible with Google Calendar, Apple Calendar, Outlook, and mobile devices.
 */
export function exportEventToIcs(event: EventItem) {
  const filename = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_Schedule.ics`;

  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  // Handle event date format YYYY-MM-DD
  let dateFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  if (event.date && event.date.includes('-')) {
    dateFormatted = event.date.replace(/-/g, '');
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ImpactPulse Volunteering SaaS//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:impactpulse-${event.id}@volunteer.app`,
    `DTSTAMP:${now}`,
    `DTSTART:${dateFormatted}T090000Z`,
    `DTEND:${dateFormatted}T130000Z`,
    `SUMMARY:Volunteering: ${event.title}`,
    `DESCRIPTION:${(event.description || 'Community Volunteering Drive').replace(/\n/g, ' ')} (Organizer: ${event.organizerName})`,
    `LOCATION:${event.venue || 'Campus Venue'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
