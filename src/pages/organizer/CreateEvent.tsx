import React, { useState } from 'react';
import { PlusCircle, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, HeartPulse, GraduationCap, Leaf, LifeBuoy, Heart, Users, Megaphone, Utensils } from 'lucide-react';
import { api } from '../../services/api';
import { User, EventCategory, EVENT_CATEGORIES } from '../../types';

interface CreateEventProps {
  currentUser: User;
  onSuccess: () => void;
}

export const CreateEvent: React.FC<CreateEventProps> = ({ currentUser, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Environment Cleanup' as EventCategory,
    venue: '',
    date: '',
    time: '09:00 AM',
    duration: 3,
    membersRequired: 20,
    points: 40,
    contactDetails: currentUser.email,
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Medical Camp':
        return <HeartPulse className="w-4 h-4" />;
      case 'Education':
        return <GraduationCap className="w-4 h-4" />;
      case 'Environment Cleanup':
        return <Leaf className="w-4 h-4" />;
      case 'Disaster Relief':
        return <LifeBuoy className="w-4 h-4" />;
      case 'Animal Welfare':
        return <Heart className="w-4 h-4" />;
      case 'Club Events':
        return <Users className="w-4 h-4" />;
      case 'Awareness Programs':
        return <Megaphone className="w-4 h-4" />;
      case 'Food Relief':
        return <Utensils className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createEvent({
        ...formData,
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        organizationName: currentUser.organizationName || currentUser.name,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Create New Volunteering Event
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit activity details to the Admin Approval Queue for platform verification.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>1</span>
          <span>Basic Information</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-800" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>2</span>
          <span>Schedule & Location</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-800" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>3</span>
          <span>Requirements</span>
        </div>
      </div>

      {/* Multi-step Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-5 text-xs">
        
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. City Park Conservation & Recycling Drive"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Event Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {EVENT_CATEGORIES.map((cat) => {
                  const isSelected = formData.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                    >
                      <span className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}>
                        {getCategoryIcon(cat)}
                      </span>
                      <span className="text-xs truncate">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Description *</label>
              <textarea
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe objectives, volunteer responsibilities, and guidelines..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!formData.title || !formData.description) return alert('Please fill required fields.');
                setStep(2);
              }}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-colors mt-2 cursor-pointer"
            >
              Next: Schedule & Location
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Schedule & Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Venue / Location *</label>
              <input
                type="text"
                name="venue"
                required
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Central Park Pavilion, Gate 4"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Date *</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time *</label>
                <input
                  type="text"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="e.g. 09:00 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Hours) *</label>
              <input
                type="number"
                name="duration"
                min={1}
                max={24}
                required
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.venue || !formData.date) return alert('Please enter venue and date.');
                  setStep(3);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                Next: Capacity & Points
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Requirements */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Volunteers Needed *</label>
                <input
                  type="number"
                  name="membersRequired"
                  min={1}
                  required
                  value={formData.membersRequired}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Points Rewarded *</label>
                <input
                  type="number"
                  name="points"
                  min={10}
                  required
                  value={formData.points}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Organizer Contact Info *</label>
              <input
                type="text"
                name="contactDetails"
                required
                value={formData.contactDetails}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
              Note: Submitted events will be marked <span className="font-bold">status = pending</span> until reviewed and approved by an Admin.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {loading ? 'Submitting...' : 'Submit Event for Admin Approval'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};
