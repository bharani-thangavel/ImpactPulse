import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Users,
  Send,
  Calendar,
  MapPin,
  Clock,
  CheckSquare,
  ShieldCheck,
  Building2,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { User, EventItem, Registration, TeamMessage } from '../../types';
import { api } from '../../services/api';

interface TeamHubProps {
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

export const TeamHub: React.FC<TeamHubProps> = ({ currentUser, onNavigateTab }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, EventItem>>({});
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadRegistrations();
  }, [currentUser.id]);

  useEffect(() => {
    if (selectedEventId) {
      loadMessages(selectedEventId);
    }
  }, [selectedEventId]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const [regs, evs] = await Promise.all([
        api.getRegistrations(currentUser.id),
        api.getEvents(),
      ]);
      setRegistrations(regs);

      const map: Record<string, EventItem> = {};
      evs.forEach((e) => {
        map[e.id] = e;
      });
      setEventsMap(map);

      if (regs.length > 0) {
        setSelectedEventId(regs[0].eventId);
      }
    } catch (err) {
      console.error('Failed to load team hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (eventId: string) => {
    try {
      const msgs = await api.getTeamMessages(eventId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to fetch team messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !newMessage.trim()) return;

    setSending(true);
    try {
      const reg = registrations.find((r) => r.eventId === selectedEventId);
      const roleLabel = reg?.isLeader ? 'Volunteer Team Leader' : 'Volunteer Member';
      const msg = await api.sendTeamMessage(
        selectedEventId,
        currentUser.name,
        roleLabel,
        newMessage.trim()
      );
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send team message:', err);
    } finally {
      setSending(false);
    }
  };

  const activeEvent = selectedEventId ? eventsMap[selectedEventId] : null;
  const currentReg = registrations.find((r) => r.eventId === selectedEventId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Event Team Hub & Communication
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Coordinate logistics, ask organizers questions, and connect with fellow registered team members.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          Loading team communication channels...
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <BookmarkCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Active Event Registrations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              You are currently not registered for any upcoming volunteering activities. Register for an activity to unlock team discussion channels.
            </p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('discover')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Discover Volunteering Activities
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Event Channels Selector */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              My Team Channels ({registrations.length})
            </h3>

            <div className="space-y-2">
              {registrations.map((reg) => {
                const ev = eventsMap[reg.eventId];
                const isSelected = reg.eventId === selectedEventId;
                if (!ev) return null;

                return (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedEventId(reg.eventId)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {ev.title}
                      </h4>
                      {reg.isLeader && (
                        <span className="shrink-0 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-extrabold rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          LEADER
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{ev.date} at {ev.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Team Logistics Checklist */}
            {activeEvent && (
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Team Readiness Checklist</span>
                </div>
                <ul className="text-[11px] space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500" />
                    <span>Bring digital ID & event pass</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500" />
                    <span>Arrive 15 mins prior to start ({activeEvent.time})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500" />
                    <span>Post carpooling / travel questions in chat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500" />
                    <span>Review organizer instructions</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Right 2 Columns: Live Message Feed */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[500px] shadow-xs">
            
            {activeEvent ? (
              <>
                {/* Chat Header */}
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{activeEvent.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {activeEvent.organizerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {activeEvent.membersRegistered}/{activeEvent.membersRequired} Team Members
                      </span>
                    </div>
                  </div>

                  {currentReg?.isLeader && (
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 font-extrabold text-xs rounded-xl border border-amber-200 dark:border-amber-800">
                      Team Leader Channel
                    </span>
                  )}
                </div>

                {/* Messages Container */}
                <div className="flex-1 my-4 space-y-3 overflow-y-auto max-h-[360px] pr-2">
                  {messages.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No team messages yet. Start the conversation with your fellow volunteers!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderName === currentUser.name;
                      const isOrganizer = msg.senderRole.toLowerCase().includes('organizer');
                      const isLeader = msg.senderRole.toLowerCase().includes('leader');

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {msg.senderName}
                            </span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase ${
                              isOrganizer
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : isLeader
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {msg.senderRole}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {msg.createdAt}
                            </span>
                          </div>

                          <div className={`p-3 rounded-2xl text-xs max-w-md break-words ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a team message or question..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                Select an active event channel from the left menu to view messages.
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
