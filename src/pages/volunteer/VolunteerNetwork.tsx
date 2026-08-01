import React, { useEffect, useState } from 'react';
import {
  Users,
  Award,
  Sparkles,
  Search,
  Filter,
  Send,
  Heart,
  ShieldCheck,
  Clock,
  Star,
  CheckCircle2,
  X
} from 'lucide-react';
import { User, PeerKudo } from '../../types';
import { api } from '../../services/api';

interface VolunteerNetworkProps {
  currentUser: User;
}

export const VolunteerNetwork: React.FC<VolunteerNetworkProps> = ({ currentUser }) => {
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [kudosFeed, setKudosFeed] = useState<PeerKudo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string>('All');
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [kudoType, setKudoType] = useState('Super Reliable Teamwork');
  const [kudoMessage, setKudoMessage] = useState('');
  const [sendingKudo, setSendingKudo] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const interestCategories = [
    'All',
    'Environment',
    'Education',
    'Healthcare',
    'Animal Welfare',
    'Community Relief',
    'Youth Empowerment'
  ];

  const kudoTypes = [
    'Super Reliable Teamwork ⭐',
    'Inspirational Leader 👑',
    'Community Hero 🦸',
    'Positive Energy & Enthusiasm ☀️',
    'Outstanding Problem Solver 💡'
  ];

  useEffect(() => {
    loadNetworkData();
  }, []);

  const loadNetworkData = async () => {
    setLoading(true);
    try {
      const [vols, kudos] = await Promise.all([
        api.getUsers('volunteer', 'approved'),
        api.getPeerKudos()
      ]);
      setVolunteers(vols);
      setKudosFeed(kudos);
    } catch (err) {
      console.error('Failed to load volunteer network data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendKudoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || !kudoMessage.trim()) return;

    setSendingKudo(true);
    try {
      const res = await api.sendPeerKudos({
        senderId: currentUser.id,
        senderName: currentUser.name,
        recipientId: selectedRecipient.id,
        recipientName: selectedRecipient.name,
        kudoType,
        message: kudoMessage.trim()
      });

      setKudosFeed((prev) => [res.kudo, ...prev]);
      setToastMessage(`Peer Kudos successfully sent to ${selectedRecipient.name}!`);
      setSelectedRecipient(null);
      setKudoMessage('');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to send peer kudos:', err);
      alert(err.message || 'Failed to send kudos');
    } finally {
      setSendingKudo(false);
    }
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesSearch =
      vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vol.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesInterest =
      selectedInterest === 'All' ||
      (vol.interests && vol.interests.some((i) => i.toLowerCase().includes(selectedInterest.toLowerCase())));

    return matchesSearch && matchesInterest;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Volunteer Peer Network & Kudos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect with fellow volunteers, discover shared cause interests, and send peer recognition.
          </p>
        </div>

        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 w-fit">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{volunteers.length} Active Community Volunteers</span>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volunteers by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {interestCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedInterest(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedInterest === cat
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Volunteers Directory + Community Kudos Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Volunteer Directory Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Community Volunteers ({filteredVolunteers.length})
          </h3>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading network directory...</div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
              No volunteers match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredVolunteers.map((vol) => {
                const isSelf = vol.id === currentUser.id;

                return (
                  <div
                    key={vol.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                            {vol.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {vol.name}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded-md font-semibold">
                                  You
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{vol.email}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          Since {vol.memberSince || '2026'}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-center text-[11px]">
                        <div className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                          <span className="block text-slate-400 text-[10px]">Service Hours</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{vol.totalHours || 0} hrs</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                          <span className="block text-slate-400 text-[10px]">Impact Points</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{vol.totalPoints || 0} pts</span>
                        </div>
                      </div>

                      {/* Cause Interests Tags */}
                      {vol.interests && vol.interests.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {vol.interests.map((int, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold rounded-md"
                            >
                              {int}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isSelf && (
                      <button
                        onClick={() => setSelectedRecipient(vol)}
                        className="mt-3 w-full py-2 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>Send Peer Kudos</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Community Kudos Feed */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Recent Peer Recognition
          </h3>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs max-h-[600px] overflow-y-auto">
            {kudosFeed.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No kudos sent yet. Be the first to recognize a fellow volunteer!
              </div>
            ) : (
              kudosFeed.map((kudo) => (
                <div
                  key={kudo.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                      {kudo.senderName} ➔ {kudo.recipientName}
                    </span>
                    <span className="text-[10px] text-slate-400">{kudo.createdAt}</span>
                  </div>

                  <div className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] rounded-md">
                    {kudo.kudoType}
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 italic text-[11px]">
                    "{kudo.message}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Send Peer Kudos Modal */}
      {selectedRecipient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Send Kudos to {selectedRecipient.name}
              </h3>
              <button
                onClick={() => setSelectedRecipient(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendKudoSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recognition Badge / Type
                </label>
                <select
                  value={kudoType}
                  onChange={(e) => setKudoType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {kudoTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Appreciation Message
                </label>
                <textarea
                  rows={3}
                  value={kudoMessage}
                  onChange={(e) => setKudoMessage(e.target.value)}
                  placeholder={`Write a thoughtful note of thanks or encouragement to ${selectedRecipient.name}...`}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecipient(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingKudo || !kudoMessage.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingKudo ? 'Sending...' : 'Send Kudos'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
