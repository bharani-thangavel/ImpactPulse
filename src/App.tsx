import React, { useEffect, useState } from 'react';
import { Role, User } from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './pages/AuthModal';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ApprovalQueue } from './pages/admin/ApprovalQueue';
import { EventArchive } from './pages/admin/EventArchive';
import { OrganizersList } from './pages/admin/OrganizersList';
import { OrganizerApprovals } from './pages/admin/OrganizerApprovals';
import { VolunteersList } from './pages/admin/VolunteersList';
import { LeadershipOverview } from './pages/admin/LeadershipOverview';
import { ImpactSummary as AdminImpactSummary } from './pages/admin/ImpactSummary';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminSettings } from './pages/admin/AdminSettings';

// Organizer Pages
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { CreateEvent } from './pages/organizer/CreateEvent';
import { MyEvents } from './pages/organizer/MyEvents';
import { OrganizerHistory } from './pages/organizer/OrganizerHistory';
import { AttendanceTracking } from './pages/organizer/AttendanceTracking';
import { LeaderSelection } from './pages/organizer/LeaderSelection';
import { BurnoutEarlyWarning } from './pages/organizer/BurnoutEarlyWarning';
import { OrganizerImpact } from './pages/organizer/OrganizerImpact';
import { OrganizerNotifications } from './pages/organizer/OrganizerNotifications';
import { OrganizerProfile } from './pages/organizer/OrganizerProfile';

// Volunteer Pages
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';
import { EventDiscovery } from './pages/volunteer/EventDiscovery';
import { MyRegistrations } from './pages/volunteer/MyRegistrations';
import { TeamHub } from './pages/volunteer/TeamHub';
import { VolunteerNetwork } from './pages/volunteer/VolunteerNetwork';
import { ServiceHoursLog } from './pages/volunteer/ServiceHoursLog';
import { LeadershipApplications } from './pages/volunteer/LeadershipApplications';
import { VolunteerBadges } from './pages/volunteer/VolunteerBadges';
import { VolunteerImpact } from './pages/volunteer/VolunteerImpact';
import { VolunteerNotifications } from './pages/volunteer/VolunteerNotifications';
import { VolunteerProfile } from './pages/volunteer/VolunteerProfile';

import { api } from './services/api';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<Role>('volunteer');

  useEffect(() => {
    if (currentUser) {
      loadUnreadNotifs();
    }
  }, [currentUser, activeTab]);

  const loadUnreadNotifs = async () => {
    if (!currentUser) return;
    try {
      const notifs = await api.getNotifications(currentUser.id);
      setUnreadNotifsCount(notifs.filter((n) => !n.readStatus).length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAuth = (role: Role) => {
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleRoleSwitch = (role: Role) => {
    setCurrentUser(null);
    handleOpenAuth(role);
  };

  // If not logged in, render Landing Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Navbar
          currentUser={null}
          unreadCount={0}
          onRoleSwitch={handleOpenAuth}
          onLogout={handleLogout}
        />

        <LandingPage
          onSelectRole={handleOpenAuth}
        />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialRole={authModalRole}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // Render Portal per Role
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      <Navbar
        currentUser={currentUser}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => setActiveTab('notifications')}
        onRoleSwitch={handleRoleSwitch}
        onLogout={handleLogout}
      />

      <div className="flex flex-1">
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          onTabChange={(tab) => {
            const aliasMap: Record<string, string> = {
              'homepage': 'dashboard',
              'browse-activities': 'discover',
              'my-bookings': 'my-registrations',
              'apply-leadership': 'leadership-apps',
              'leader-controls': 'leadership-apps',
              'badges-points': 'badges',
              'organizers': 'organizers-list',
              'volunteers': 'volunteers-list',
            };
            if (tab === 'history' && currentUser.role === 'volunteer') {
              setActiveTab('impact-analytics');
            } else {
              setActiveTab(aliasMap[tab] || tab);
            }
          }}
          unreadNotifCount={unreadNotifsCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {/* ADMIN PORTAL VIEWS */}
          {currentUser.role === 'admin' && (
            <>
              {(activeTab === 'dashboard' || !['approval-queue', 'event-archive', 'organizers-list', 'organizer-approvals', 'volunteers-list', 'leadership-overview', 'impact-summary', 'notifications', 'settings'].includes(activeTab)) && (
                <AdminDashboard onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'approval-queue' && <ApprovalQueue />}
              {activeTab === 'event-archive' && <EventArchive />}
              {activeTab === 'organizers-list' && <OrganizersList />}
              {activeTab === 'organizer-approvals' && <OrganizerApprovals />}
              {activeTab === 'volunteers-list' && <VolunteersList />}
              {activeTab === 'leadership-overview' && <LeadershipOverview />}
              {activeTab === 'impact-summary' && <AdminImpactSummary />}
              {activeTab === 'notifications' && (
                <AdminNotifications currentUser={currentUser} onRefreshNotifs={loadUnreadNotifs} />
              )}
              {activeTab === 'settings' && (
                <AdminSettings currentUser={currentUser} onUpdateUser={setCurrentUser} />
              )}
            </>
          )}

          {/* ORGANIZER PORTAL VIEWS */}
          {currentUser.role === 'organizer' && (
            <>
              {(activeTab === 'dashboard' || !['create-event', 'my-events', 'history', 'attendance', 'leader-selection', 'burnout-alerts', 'impact-summary', 'notifications', 'profile'].includes(activeTab)) && (
                <OrganizerDashboard currentUser={currentUser} onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'create-event' && (
                <CreateEvent currentUser={currentUser} onSuccess={() => setActiveTab('my-events')} />
              )}
              {activeTab === 'my-events' && (
                <MyEvents
                  currentUser={currentUser}
                  onCreateNew={() => setActiveTab('create-event')}
                  onNavigateTab={setActiveTab}
                />
              )}
              {activeTab === 'history' && <OrganizerHistory currentUser={currentUser} />}
              {activeTab === 'attendance' && <AttendanceTracking currentUser={currentUser} />}
              {activeTab === 'leader-selection' && (
                <LeaderSelection currentUser={currentUser} onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'burnout-alerts' && <BurnoutEarlyWarning currentUser={currentUser} />}
              {activeTab === 'impact-summary' && <OrganizerImpact currentUser={currentUser} />}
              {activeTab === 'notifications' && (
                <OrganizerNotifications currentUser={currentUser} onRefreshNotifs={loadUnreadNotifs} />
              )}
              {activeTab === 'profile' && (
                <OrganizerProfile currentUser={currentUser} onUpdateUser={setCurrentUser} />
              )}
            </>
          )}

          {/* VOLUNTEER PORTAL VIEWS */}
          {currentUser.role === 'volunteer' && (
            <>
              {(activeTab === 'dashboard' || !['discover', 'my-registrations', 'team-hub', 'volunteer-network', 'hours-log', 'leadership-apps', 'badges', 'impact-analytics', 'notifications', 'profile'].includes(activeTab)) && (
                <VolunteerDashboard currentUser={currentUser} onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'discover' && <EventDiscovery currentUser={currentUser} onUpdateUser={setCurrentUser} />}
              {activeTab === 'my-registrations' && (
                <MyRegistrations currentUser={currentUser} onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'team-hub' && (
                <TeamHub currentUser={currentUser} onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'volunteer-network' && (
                <VolunteerNetwork currentUser={currentUser} />
              )}
              {activeTab === 'hours-log' && (
                <ServiceHoursLog currentUser={currentUser} />
              )}
              {activeTab === 'leadership-apps' && <LeadershipApplications currentUser={currentUser} />}
              {activeTab === 'badges' && <VolunteerBadges currentUser={currentUser} />}
              {activeTab === 'impact-analytics' && <VolunteerImpact currentUser={currentUser} />}
              {activeTab === 'notifications' && (
                <VolunteerNotifications currentUser={currentUser} onRefreshNotifs={loadUnreadNotifs} />
              )}
              {activeTab === 'profile' && (
                <VolunteerProfile currentUser={currentUser} onUpdateUser={setCurrentUser} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
