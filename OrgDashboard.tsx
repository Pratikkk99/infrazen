
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  GitPullRequest,
  Calendar,
  FileText,
  CreditCard,
  LogOut,
  Plus,
  Bell,
  Search,
  ChevronRight,
  ArrowRight,
  MoreVertical,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { OrgProfileScreen } from './OrgProfileScreen';
import { SiteProfileScreen } from './SiteProfileScreen';
import { SitesListScreen } from './SitesListScreen';
import { OrgRequestsListScreen } from './OrgRequestsListScreen';
import { CreateRequestScreen } from './CreateRequestScreen';
import { RequestDetailScreen } from './RequestDetailScreen';
import { BookingTrackingScreen } from './BookingTrackingScreen';
import { OrgBookingsListScreen, Booking } from './OrgBookingsListScreen';
import { BookingReportViewScreen } from './BookingReportViewScreen';
import { OrgMembersScreen } from './OrgMembersScreen';
import { OrgPaymentsScreen } from './OrgPaymentsScreen';
import { AddSiteModal } from './AddSiteModal';

interface OrgDashboardProps {
  onLogout: () => void;
}

const KPIStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[2rem] border border-slate-100 zen-shadow group transition-all duration-300 hover:border-teal-100/50"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors duration-300">
        {icon}
      </div>
      <div className="h-1.5 w-1.5 rounded-full bg-teal-500/20 group-hover:bg-teal-500 transition-colors" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
}> = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${active
      ? 'bg-teal-50 text-teal-700 shadow-sm'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
  >
    <div className="flex items-center gap-3">
      <span className={active ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}>
        {icon}
      </span>
      <span className="tracking-tight">{label}</span>
    </div>
    {badge !== undefined && (
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${active ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {badge}
      </span>
    )}
  </button>
);

import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';

export const OrgDashboard: React.FC<OrgDashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [siteView, setSiteView] = useState<'list' | 'form'>('list');
  const [requestView, setRequestView] = useState<'list' | 'create' | 'detail'>('list');
  const [bookingView, setBookingView] = useState<'list' | 'tracking' | 'report'>('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [bookingStatus, setBookingStatus] = useState<any>('SCHEDULED');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  const [orgs, setOrgs] = useState<any[]>([]);
  const [currentOrg, setCurrentOrg] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data = await apiClient.get('/org/my-organizations');
        setOrgs(data);
        if (data.length > 0) {
          setCurrentOrg(data[0]);
        }
      } catch (error) {
        showToast.error("Failed to load organizations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (currentOrg) {
      const fetchOrgData = async () => {
        try {
          const [sitesData, reqsData, statsData] = await Promise.all([
            apiClient.get(`/org/${currentOrg.org_id}/sites`),
            apiClient.get(`/org/${currentOrg.org_id}/requests`),
            apiClient.get(`/org/${currentOrg.org_id}/stats`)
          ]);

          setSites(sitesData.map((s: any) => ({
            id: s.site_id.toString(),
            name: s.site_name,
            type: s.site_type,
            city: s.city || '-',
            area: s.area_sqft ? `${s.area_sqft} sqft` : '--',
            floors: s.floor_count?.toString() || '--'
          })));

          setRequests(reqsData.map((r: any) => ({
            id: r.request_id.toString(),
            title: `${r.service_category} Audit - ${r.org_sites?.site_name || 'Generic'}`,
            status: r.request_status,
            bids: r.bid_count || 0,
            city: r.org_sites?.city || '-',
            category: r.service_category,
            closesIn: r.bidding_close_dt ? new Date(r.bidding_close_dt).toLocaleDateString() : 'N/A'
          })));

          setStats(statsData);
        } catch (error) {
          showToast.error("Failed to load organization data");
        }
      };
      fetchOrgData();
    }
  }, [currentOrg]);

  // Fetch sites when user navigates to sites section
  useEffect(() => {
    const fetchSites = async () => {
      if (currentOrg && activeSection === 'sites') {
        console.log('Fetching sites for org:', currentOrg.org_id);
        try {
          const data = await apiClient.get(`/org/${currentOrg.org_id}/sites`);
          console.log('Sites fetched:', data);
          setSites(data.map((s: any) => ({
            id: s.site_id.toString(),
            name: s.site_name,
            type: s.site_type,
            city: s.city || '-',
            area: s.area_sqft ? `${s.area_sqft} sqft` : '--',
            floors: s.floor_count?.toString() || '--'
          })));
        } catch (error) {
          console.error("Failed to load sites:", error);
          showToast.error("Failed to load sites");
        }
      }
    };
    fetchSites();
  }, [activeSection, currentOrg]);

  const handleAction = async (action: string, callback: () => void) => {
    try {
      await apiClient.post('/api/support/ticket', { action });
      callback();
    } catch (error: any) {
      showToast.error(error.message || "Request failed — please try again");
    }
  };

  const handleNotifications = async () => {
    try {
      await apiClient.get('/api/notifications');
      showToast.success("Recent activity loaded from server");
    } catch (error: any) {
      showToast.error(error.message || "Failed to load notifications");
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'organization', label: 'Organization', icon: <Building2 size={20} /> },
    { id: 'sites', label: 'Sites', icon: <MapPin size={20} />, badge: sites.length },
    { id: 'members', label: 'Members', icon: <Users size={20} /> },
    { id: 'requests', label: 'Requests', icon: <GitPullRequest size={20} />, badge: requests.length },
    { id: 'bookings', label: 'Bookings', icon: <Calendar size={20} />, badge: 2 },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
  ];

  const recentRequests = requests.slice(0, 3);

  const handleAwarded = (bookingId: string, status: any) => {
    setSelectedBookingId(bookingId);
    setBookingStatus(status);
    setActiveSection('bookings');
    setBookingView('tracking');
  };

  const handleTrackBooking = (booking: Booking) => {
    setSelectedBookingId(booking.id);
    setSelectedRequestId(booking.reqId);
    if (booking.status === 'COMPLETED') {
      setBookingView('report');
    } else {
      setBookingStatus(booking.status);
      setBookingView('tracking');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'organization':
        return <OrgProfileScreen />;

      case 'members':
        return <OrgMembersScreen />;

      case 'sites':
        return (
          <>
            <SitesListScreen
              sites={sites}
              onAddSite={() => setIsAddSiteModalOpen(true)}
              onEditSite={(site) => console.log('Edit', site)}
              onViewSite={(site) => console.log('View', site)}
            />
            {currentOrg && (
              <AddSiteModal
                isOpen={isAddSiteModalOpen}
                onClose={() => setIsAddSiteModalOpen(false)}
                orgId={currentOrg.org_id.toString()}
                onSuccess={async () => {
                  if (currentOrg) {
                    try {
                      const data = await apiClient.get(`/org/${currentOrg.org_id}/sites`);
                      setSites(data.map((s: any) => ({
                        id: s.site_id.toString(),
                        name: s.site_name,
                        type: s.site_type,
                        city: s.city || '-',
                        area: s.area_sqft ? `${s.area_sqft} sqft` : '--',
                        floors: s.floor_count?.toString() || '--'
                      })));
                    } catch (error) {
                      showToast.error("Failed to load sites");
                    }
                  }
                }}
              />
            )}
          </>
        );

      case 'requests':
        if (requestView === 'list') {
          return (
            <OrgRequestsListScreen
              requests={requests}
              onCreateRequest={() => setRequestView('create')}
              onViewRequest={(req) => {
                setSelectedRequestId(req.id);
                setRequestView('detail');
              }}
            />
          );
        } else if (requestView === 'create') {
          return (
            <div className="space-y-6">
              <button
                onClick={() => setRequestView('list')}
                className="flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors font-bold text-xs uppercase tracking-widest group mb-6"
              >
                <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Requests List
              </button>
              <CreateRequestScreen
                onSuccess={() => {
                  setRequestView('list');
                  // Trigger data refresh would be good here too
                }}
                onBack={() => setRequestView('list')}
              />
            </div>
          );
        } else {
          return (
            <RequestDetailScreen
              requestId={selectedRequestId}
              onBack={() => setRequestView('list')}
              onAwarded={handleAwarded}
            />
          );
        }

      case 'bookings':
        if (bookingView === 'tracking') {
          return (
            <div className="space-y-6">
              <button
                onClick={() => setBookingView('list')}
                className="flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors font-bold text-xs uppercase tracking-widest group mb-6"
              >
                <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Bookings List
              </button>
              <BookingTrackingScreen
                bookingId={selectedBookingId}
                onBack={() => setBookingView('list')}
                initialStatus={bookingStatus}
              />
            </div>
          );
        }
        if (bookingView === 'report') {
          return (
            <BookingReportViewScreen
              bookingId={selectedBookingId}
              requestId={selectedRequestId || '104'}
              onBack={() => setBookingView('list')}
            />
          );
        }
        return <OrgBookingsListScreen onTrackBooking={handleTrackBooking} />;

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Archived Reports</h1>
              <Badge variant="slate">08 TOTAL</Badge>
            </div>
            <div className="bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Real reports would be mapped here */}
                <div className="p-8 border border-slate-100 rounded-3xl hover:border-teal-100 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors rounded-2xl">
                      <FileText size={24} />
                    </div>
                    <Badge variant="teal">Verified</Badge>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-1">Electrical Audit - Phase 1</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Submitted 12 Dec 2023</p>
                  <Button variant="outline" className="w-full rounded-2xl" onClick={() => {
                    setSelectedBookingId('77');
                    setSelectedRequestId('104');
                    setActiveSection('bookings');
                    setBookingView('report');
                  }}>View Full Report</Button>
                </div>

                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                  <p className="text-slate-400 text-sm font-medium">Historical reports are being migrated...</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payments':
        return <OrgPaymentsScreen orgId={currentOrg?.org_id} />;

      case 'dashboard':
      default:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Dashboard</h1>
                <p className="text-lg text-slate-500 font-medium">Track your audit requests, bids, bookings, and reports.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative hidden md:block group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    className="pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 w-80 text-sm font-medium transition-all zen-shadow"
                  />
                </div>
                <button
                  className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-teal-600 hover:border-teal-100 transition-all zen-shadow relative group"
                  onClick={handleNotifications}
                >
                  <Bell size={22} className="group-hover:rotate-12 transition-transform" />
                  <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-teal-500 rounded-full border-2 border-white ring-2 ring-teal-500/10"></span>
                </button>
                <Button
                  variant="primary"
                  className="px-8 py-4 rounded-2xl font-display shadow-2xl shadow-teal-500/20"
                  onClick={() => {
                    setActiveSection('requests');
                    setRequestView('create');
                  }}
                >
                  <Plus size={20} className="mr-2" /> New Request
                </Button>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <KPIStatCard title="Open Requests" value={stats?.openRequests?.toString().padStart(2, '0') || '00'} icon={<GitPullRequest size={22} />} />
              <KPIStatCard title="Bids Received" value="--" icon={<Users size={22} />} />
              <KPIStatCard title="Active Bookings" value={stats?.activeBookings?.toString().padStart(2, '0') || '00'} icon={<Calendar size={22} />} />
              <KPIStatCard title="Sites" value={stats?.totalSites?.toString().padStart(2, '0') || '00'} icon={<MapPin size={22} />} />
              <KPIStatCard title="Members" value={stats?.totalMembers?.toString().padStart(2, '0') || '00'} icon={<Users size={22} />} />
            </div>

            {/* Main Grid Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              {/* Recent Requests Section */}
              <div className="xl:col-span-2 bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">Recent Requests</h2>
                  <button
                    onClick={() => {
                      setActiveSection('requests');
                      setRequestView('list');
                    }}
                    className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest flex items-center gap-2 group"
                  >
                    View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {recentRequests.map((req, idx) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-10 group hover:bg-slate-50/50 transition-all"
                    >
                      <div className="flex items-center gap-8">
                        <div className="hidden sm:flex w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-teal-600 group-hover:border-teal-100/50 transition-all duration-500">
                          <GitPullRequest size={24} />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-teal-600 uppercase tracking-widest">Req #{req.id}</span>
                            <Badge variant={req.bids > 0 ? 'teal' : 'slate'}>{req.bids} bids</Badge>
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 group-hover:text-teal-800 transition-colors">{req.title}</h4>
                          <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Closes in {req.closesIn}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="px-8 py-3.5 border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-600 rounded-2xl font-bold"
                        onClick={() => handleAction(`View Request: ${req.title}`, () => {
                          setActiveSection('requests');
                          setSelectedRequestId(req.id);
                          setRequestView('detail');
                        })}
                      >
                        View
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Stats / Info Sidebar */}
              <div className="space-y-10">
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-teal-500 rounded-full blur-[80px]"
                  />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-6 font-display">System Status</h3>
                    <div className="space-y-5">
                      {[
                        { label: 'Security Protocols', status: 'Optimal', color: 'bg-teal-400' },
                        { label: 'Network Latency', status: '24ms', color: 'bg-teal-400' },
                        { label: 'Cloud Gateway', status: 'Verified', color: 'bg-teal-400' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-sm text-slate-400 font-medium">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-sm font-bold">{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Active Organization</p>
                      <p className="text-lg font-bold text-teal-400">{currentOrg?.org_name || 'System'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 zen-shadow">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900 font-display">Next Booking</h3>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <Calendar size={20} />
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-6">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tomorrow, 10:30 AM</p>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">STP Annual Maintenance</h4>
                    <p className="text-sm text-slate-500 font-medium">Expert: Amit P</p>
                  </div>
                  <Button variant="ghost" className="w-full text-slate-400 hover:text-teal-600 font-bold text-sm tracking-widest uppercase" onClick={() => handleAction("View Booking Details", () => {
                    setActiveSection('bookings');
                    setSelectedBookingId('77');
                    setBookingStatus('SCHEDULED');
                    setBookingView('tracking');
                  })}>
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-50">
        <Logo />
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-slate-50 rounded-2xl text-slate-600"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation - Always visible on desktop, toggleable on mobile */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative inset-0 lg:inset-y-0 z-[100] lg:z-0 lg:w-64 lg:shrink-0`}>
        {/* Mobile Overlay */}
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside className="relative w-64 bg-white border-r border-slate-100 flex flex-col h-screen overflow-y-auto no-scrollbar">
          <div className="p-6 mb-4 hidden lg:block" onClick={() => {
            setActiveSection('dashboard');
            setIsSidebarOpen(false);
          }} style={{ cursor: 'pointer' }}>
            <Logo />
          </div>

          <nav className="flex-grow px-4 space-y-1 pt-4 lg:pt-0">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                active={activeSection === item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSiteView('list');
                  setRequestView('list');
                  setBookingView('list');
                  setIsSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 space-y-4">
            <div className="px-2 py-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                  {currentOrg?.org_name?.substring(0, 2).toUpperCase() || '??'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentOrg?.org_name || 'Loading...'}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">Administrator</p>
                </div>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 w-[75%]" />
              </div>
            </div>
            <SidebarItem
              icon={<LogOut size={18} />}
              label="Logout"
              onClick={onLogout}
            />
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow p-8 lg:p-20 overflow-y-auto max-w-[1600px] mx-auto w-full">
        {renderContent()}

        <footer className="mt-32 pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} infra2zen Platform
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-black text-slate-300 hover:text-teal-600 transition-colors uppercase tracking-widest">Support</a>
            <a href="#" className="text-xs font-black text-slate-300 hover:text-teal-600 transition-colors uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-xs font-black text-slate-300 hover:text-teal-600 transition-colors uppercase tracking-widest">Settings</a>
          </div>
        </footer>
      </main>
    </div>
  );
};
