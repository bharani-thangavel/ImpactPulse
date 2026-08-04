import React, { useState } from 'react';
import { X, Shield, Users, UserCheck, AlertCircle, Sparkles, ArrowRight, Eye, EyeOff, Clock } from 'lucide-react';
import { Role, User, EVENT_CATEGORIES } from '../types';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole: Role;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole,
  onAuthSuccess,
}) => {
  if (!isOpen) return null;

  const [activeRole, setActiveRole] = useState<Role>(initialRole);
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: initialRole === 'admin' ? 'admin@gmail.com' : initialRole === 'organizer' ? 'organizer@greenearth.org' : 'volunteer@impactpulse.org',
    password: initialRole === 'admin' ? 'admin' : 'password',
    organizationName: '',
    contactDetails: '',
    phone: '',
    interests: [] as string[],
  });

  React.useEffect(() => {
    if (isOpen) {
      setActiveRole(initialRole);
      setIsRegister(false);
      setError(null);
      setInfoMessage(null);
      if (initialRole === 'admin') {
        setFormData((prev) => ({ ...prev, email: 'admin@gmail.com', password: 'admin' }));
      } else if (initialRole === 'organizer') {
        setFormData((prev) => ({ ...prev, email: 'organizer@greenearth.org', password: 'password' }));
      } else {
        setFormData((prev) => ({ ...prev, email: 'volunteer@impactpulse.org', password: 'password' }));
      }
    }
  }, [isOpen, initialRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearAlerts = () => {
    setError(null);
    setInfoMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          name: formData.name,
          email: formData.email,
          role: activeRole,
          organizationName: formData.organizationName,
          contactDetails: formData.contactDetails,
          phone: formData.phone,
          interests: activeRole === 'volunteer' ? formData.interests : [],
        });

        if (res.user.status === 'pending') {
          setInfoMessage('Registration submitted! Your Organizer account is PENDING admin approval. You will gain access once approved by an Admin.');
          setLoading(false);
          return;
        }

        onAuthSuccess(res.user);
        onClose();
      } else {
        // Login
        const res = await api.login(formData.email, activeRole, formData.password);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed';
      if (msg.toLowerCase().includes('pending')) {
        setInfoMessage(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 relative my-8 animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Role Selector */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ImpactPulse Identity Access
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isRegister ? `Register as ${activeRole.toUpperCase()}` : `${activeRole.toUpperCase()} Login`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select your portal role to authenticate</p>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setIsRegister(false);
                clearAlerts();
                setFormData((prev) => ({ ...prev, email: 'admin@gmail.com', password: 'admin' }));
              }}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeRole === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('organizer');
                clearAlerts();
                setFormData((prev) => ({ ...prev, email: 'organizer@greenearth.org', password: 'password' }));
              }}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeRole === 'organizer'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Organizer
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('volunteer');
                clearAlerts();
                setFormData((prev) => ({ ...prev, email: 'volunteer@impactpulse.org', password: 'password' }));
              }}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeRole === 'volunteer'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Volunteer
            </button>
          </div>
        </div>

        {/* Admin Credentials Hint */}
        {activeRole === 'admin' && (
          <div className="p-3 mb-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-2.5 font-medium shadow-2xs">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Restricted Access: Log in using <strong>admin@gmail.com</strong> (Password: <strong>admin</strong>)</span>
          </div>
        )}

        {/* Yellow Approval / Info Alert */}
        {infoMessage && (
          <div className="p-3.5 mb-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 font-bold shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Registration Extra Fields */}
          {isRegister && (
            <>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {activeRole === 'organizer' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      name="organizationName"
                      required
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder="e.g. Green Earth Foundation"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Details / Phone *</label>
                    <input
                      type="text"
                      name="contactDetails"
                      required
                      value={formData.contactDetails}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              {activeRole === 'volunteer' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 432-1098"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
                      Areas of Interest * (Select categories for personalized &apos;for you&apos; recommendations)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {EVENT_CATEGORIES.map((cat) => {
                        const isSelected = formData.interests.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                interests: isSelected
                                  ? prev.interests.filter((i) => i !== cat)
                                  : [...prev.interests, cat],
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email & Password */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. user@impact.org"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isRegister ? 'Submit Registration' : 'Log In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="text-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {activeRole === 'admin' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              System Administrator registration is restricted to the single authorized account (<strong>admin@gmail.com</strong>).
            </p>
          ) : (
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                clearAlerts();
              }}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline"
            >
              {isRegister
                ? 'Already registered? Switch to Login'
                : `Need an ${activeRole} account? Register here`}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
