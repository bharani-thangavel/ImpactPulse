import React from 'react';
import {
  Shield,
  Users,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Role, User } from '../types';
import { api } from '../services/api';

interface LandingPageProps {
  onSelectRole?: (role: Role) => void;
  onOpenAuth?: (role: Role) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  onOpenAuth,
}) => {
  const handleRoleClick = (role: Role) => {
    if (onSelectRole) {
      onSelectRole(role);
    } else if (onOpenAuth) {
      onOpenAuth(role);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Empowering Trusted Volunteering Ecosystems
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Connecting Purpose to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300">Measurable Impact</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ImpactPulse is the enterprise SaaS platform for verified event coordination, automated attendance tracking, gamified rewards, and AI-driven impact analytics.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleRoleClick('volunteer')}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started as Volunteer
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRoleClick('organizer')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              Register Organization
            </button>
            <button
              onClick={() => handleRoleClick('admin')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm border border-indigo-500/40 flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              System Admin Portal
            </button>
          </div>
        </div>

        {/* Live Platform Impact Statistics */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">1,450+</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">Volunteers</p>
          </div>
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">12,800+</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">Hours Tracked</p>
          </div>
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">320+</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">Events Conducted</p>
          </div>
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">98.4%</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">Verification Rate</p>
          </div>
        </div>
      </section>

      {/* Role Selection Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Choose Your Role to Enter Portal</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Multi-tiered access designed specifically for Admins, Event Organizers, and Community Volunteers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ADMIN CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 text-[11px] font-bold mb-3 uppercase tracking-wider">
                System Governance
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">ADMIN PORTAL</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                "Manage and monitor the entire volunteering ecosystem"
              </p>

              <ul className="mt-5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Verify organizer registrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Approve/reject pending event submissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Generate Claude AI impact reports</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleRoleClick('admin')}
              className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
            >
              Access Admin Portal
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ORGANIZER CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl dark:hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60 text-[11px] font-bold mb-3 uppercase tracking-wider">
                Event Coordination
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">ORGANIZER PORTAL</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                "Create and manage volunteering events"
              </p>

              <ul className="mt-5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Submit multi-step event forms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Track attendance & assign leadership</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Measure organization impact metrics</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleRoleClick('organizer')}
              className="mt-8 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Access Organizer Portal
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* VOLUNTEER CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl dark:hover:border-teal-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="inline-block px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/60 text-[11px] font-bold mb-3 uppercase tracking-wider">
                Community Action
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">VOLUNTEER PORTAL</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                "Discover activities and contribute"
              </p>

              <ul className="mt-5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Browse & register for local activities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Earn points & unlock gamified badges</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Apply for Team Leader roles & AI suggestions</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleRoleClick('volunteer')}
              className="mt-8 w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-teal-600/20"
            >
              Access Volunteer Portal
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* About & Lifecycle Section */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 py-16 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Complete Lifecycle Management</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">End-to-end verification pipeline from registration to AI report generation</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs font-semibold">
            {[
              "1. Organizer Register",
              "2. Admin Verification",
              "3. Create Event",
              "4. Event Approval",
              "5. Volunteer Register",
              "6. Attendance Track",
              "7. Badges & Points",
              "8. AI Analytics",
            ].map((step, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1">Step {idx + 1}</span>
                <span className="text-slate-700 dark:text-slate-300">{step.split(". ")[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-8 text-center text-xs border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 ImpactPulse SaaS Platform. Built for verified social change and community development.</p>
      </footer>
    </div>
  );
};
