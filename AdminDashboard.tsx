
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { KpiCard } from './components/KpiCard';
import { ActivityItem } from './components/ActivityItem';
import { UsersManagement } from './UsersManagement';
import { OrganizationsManagement } from './OrganizationsManagement';
import { SitesManagement } from './SitesManagement';
import { ExpertsVerification } from './ExpertsVerification';
import { RequestsManagement } from './RequestsManagement';
import { ReportsManagement } from './ReportsManagement';
import { AdminBookingsManagement } from './AdminBookingsManagement';
import { AdminLogsScreen } from './AdminLogsScreen';
import { AdminUserDetailScreen } from './AdminUserDetailScreen';
import { AdminOrgDetailScreen } from './AdminOrgDetailScreen';
import {
  Users,
  ShieldCheck,
  Building,
  MapPin,
  GitPullRequest,
  Calendar,
  AlertCircle,
  IndianRupee,
  Bell,
  Search,
  Menu
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.get('/admin/stats');
        setStatsData(data);
      } catch (error) {
        showToast.error("Failed to load admin stats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Users', value: statsData?.totalUsers?.toLocaleString() || '0', icon: <Users size={20} />, trend: 'Platform' },
    { title: 'Experts', value: statsData?.totalExperts?.toLocaleString() || '0', icon: <ShieldCheck size={20} />, trend: 'Active' },
    { title: 'Organizations', value: statsData?.totalOrgs?.toLocaleString() || '0', icon: <Building size={20} />, trend: 'Live' },
    { title: 'Sites Managed', value: statsData?.totalSites?.toLocaleString() || '0', icon: <MapPin size={20} />, trend: 'Total' },
    { title: 'Service Requests', value: statsData?.totalRequests?.toLocaleString() || '0', icon: <GitPullRequest size={20} />, trend: 'All Time' },
    { title: 'Total Bookings', value: statsData?.totalBookings?.toLocaleString() || '0', icon: <Calendar size={20} />, trend: 'Scheduled' },
    { title: 'Reports Pending', value: statsData?.pendingReports?.toLocaleString() || '0', icon: <AlertCircle size={20} />, trend: 'Review Req' },
    { title: 'Platform Revenue', value: `₹${(statsData?.revenue / 100000).toFixed(1)}L`, icon: <IndianRupee size={20} />, trend: 'Settled' },
  ];

  const activities = [
    { description: 'Req #104 bidding open (6 bids)', time: '2 mins ago', action: 'View' },
    { description: 'Booking #77 scheduled for tomorrow', time: '15 mins ago', action: 'View' },
    { description: 'Report submitted for Booking #61', time: '1 hour ago', action: 'Review' },
    { description: 'Expert "Vikram Singh" verified successfully', time: '2 hours ago', action: 'View Profile' },
    { description: 'New site registered: Emerald Heights SOC', time: '4 hours ago', action: 'Manage' },
  ];

  const handleViewAllLogs = () => {
    setActiveSection('logs');
  };

  const handleActivityAction = (desc: string) => {
    if (desc.includes('Req #')) setActiveSection('requests');
    else if (desc.includes('Booking #')) setActiveSection('bookings');
    else if (desc.includes('Report')) setActiveSection('reports');
    else if (desc.includes('Expert')) setActiveSection('experts');
    else if (desc.includes('site')) setActiveSection('sites');
    else showToast.success(`Details for "${desc}" opened`);
  };

  const renderContent = () => {
    const handleBack = () => setActiveSection('dashboard');

    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-display">Dashboard</h1>
                <p className="text-slate-500 font-medium">Monitoring infra2zen technical operations.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search platform..."
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-64 text-sm transition-all"
                  />
                </div>
                <button
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-teal-600 hover:border-teal-100 transition-all zen-shadow relative"
                  onClick={async () => {
                    try {
                      await apiClient.get("/api/notifications");
                      showToast.success("Recent notifications loaded from server");
                    } catch (error) {
                      showToast.error("Failed to load notifications");
                    }
                  }}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold zen-shadow">
                  AD
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, idx) => (
                <KpiCard
                  key={idx}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  trend={stat.trend}
                />
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 zen-shadow overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                <button
                  className="text-sm font-bold text-teal-600 hover:underline underline-offset-4"
                  onClick={handleViewAllLogs}
                >
                  View All Logs
                </button>
              </div>
              <div className="px-6 pb-2 divide-y divide-slate-50">
                {activities.map((item, idx) => (
                  <ActivityItem
                    key={idx}
                    description={item.description}
                    time={item.time}
                    actionLabel={item.action}
                    onAction={() => handleActivityAction(item.description)}
                  />
                ))}
              </div>
            </div>
          </>
        );
      case 'users':
        if (selectedUserId) {
          return <AdminUserDetailScreen userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
        }
        return <UsersManagement onBack={handleBack} onView={setSelectedUserId} />;
      case 'experts':
        return <ExpertsVerification onBack={handleBack} />;
      case 'organizations':
        if (selectedOrgId) {
          return <AdminOrgDetailScreen orgId={selectedOrgId} onBack={() => setSelectedOrgId(null)} />;
        }
        return <OrganizationsManagement onBack={handleBack} onView={setSelectedOrgId} />;
      case 'sites':
        return <SitesManagement onBack={handleBack} />;
      case 'requests':
        return <RequestsManagement onBack={handleBack} />;
      case 'bookings':
        return <AdminBookingsManagement onBack={handleBack} />;
      case 'reports':
        return <ReportsManagement onBack={handleBack} />;
      case 'logs':
        return <AdminLogsScreen onBack={handleBack} />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Section Under Development</h2>
            <p className="text-slate-500 max-w-sm mt-2">The {activeSection} management module is being configured for technical audits.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-teal-600 text-white rounded-full shadow-2xl"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar Navigation - Always visible on desktop, toggleable on mobile */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative inset-0 lg:inset-y-0 z-40 lg:z-0 lg:w-64 lg:shrink-0`}>
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(s) => {
            setActiveSection(s);
            setIsSidebarOpen(false);
          }}
          onLogout={onLogout}
        />
      </div>

      <main className="flex-grow p-4 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        {renderContent()}

        {/* Footer Info */}
        <footer className="mt-12 text-center text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
          Infrastructure Monitoring System v1.4.2 &bull; Verified Connection
        </footer>
      </main>
    </div>
  );
};
