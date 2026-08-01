import React, { useState } from 'react';
import { UserCheck, Save, CheckCircle2 } from 'lucide-react';
import { User, EVENT_CATEGORIES } from '../../types';
import { api } from '../../services/api';

interface VolunteerProfileProps {
  currentUser: User;
  onUpdateUser: (updated: User) => void;
}

export const VolunteerProfile: React.FC<VolunteerProfileProps> = ({ currentUser, onUpdateUser }) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [interests, setInterests] = useState<string[]>(currentUser.interests || []);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateUserProfile(currentUser.id, {
        name,
        email,
        phone,
        interests,
      });
      onUpdateUser(res.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Volunteer Member Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage profile details and contact phone number.</p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 432-1098"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Areas of Interest (Select categories for personalized &apos;for you&apos; recommendations)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_CATEGORIES.map((cat) => {
              const isSelected = interests.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setInterests((prev) =>
                      isSelected ? prev.filter((i) => i !== cat) : [...prev, cat]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? '✓ ' : ''}{cat}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </form>
    </div>
  );
};
