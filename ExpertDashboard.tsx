
import React, { useState } from 'react';
import {
  LayoutDashboard,
  GitPullRequest,
  FileText,
  Calendar,
  User,
  ShieldCheck,
  IndianRupee,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  ArrowRight,
  MapPin,
  Clock,
  Zap,
  Droplets,
  Sun,
  Menu,
  X,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { ExpertProfileScreen } from './ExpertProfileScreen';
import { ExpertVerificationScreen } from './ExpertVerificationScreen';
import { ExpertEarningsScreen } from './ExpertEarningsScreen';
import { ExpertRequestsListScreen, OpenRequest } from './ExpertRequestsListScreen';
import { ExpertRequestDetailScreen } from './ExpertRequestDetailScreen';
import { ExpertBidsScreen, MyBid } from './ExpertBidsScreen';
import { ExpertBookingsListScreen, ExpertBooking } from './ExpertBookingsListScreen';
import { ExpertBookingDetailScreen } from './ExpertBookingDetailScreen';
import { AuditExecutionScreen } from './AuditExecutionScreen';
import { ExpertReportSubmissionScreen } from './ExpertReportSubmissionScreen';

interface ExpertDashboardProps {
  onLogout: () => void;
}

const ExpertKPIStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; subtext?: string }> = ({ title, value, icon, subtext }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 zen-shadow group transition-all duration-300 hover:border-teal-100 relative overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex items-start justify-between mb-6">
      <div className="p-4 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      {subtext && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subtext}</span>}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-4xl font-black text-slate-900 tracking-tight font-display">{value}</h3>
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
    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group ${active
      ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100/50'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
      }`}
  >
    <div className="flex items-center gap-3.5">
      <span className={`${active ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
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

export const ExpertDashboard: React.FC<ExpertDashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [requestView, setRequestView] = useState<'list' | 'detail'>('list');
  const [selectedRequest, setSelectedRequest] = useState<OpenRequest | null>(null);

  const [bookingView, setBookingView] = useState<'list' | 'detail' | 'execution' | 'report'>('list');
  const [selectedBooking, setSelectedBooking] = useState<ExpertBooking | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [marketShort, setMarketShort] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        const [statsData, marketData] = await Promise.all([
          apiClient.get('/expert/stats'),
          apiClient.get('/market/requests')
        ]);
        setStats(statsData);
        setMarketShort(marketData.slice(0, 3));
      } catch (error) {
        showToast.error("Failed to load dashboard data");
      }
    };
    fetchExpertData();
  }, []);

  const handleAction = async (action: string, callback: () => void) => {
    try {
      await apiClient.post('/api/support/ticket', { action });
      callback();
    } catch (error: any) {
      showToast.error(error.message || "Action failed — please try again");
    }
  };

  const handleNotifications = async () => {
    try {
      await apiClient.get('/api/notifications');
      showToast.success("New marketplace alerts loaded from server");
    } catch (error: any) {
      showToast.error(error.message || "Failed to load notifications");
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'requests', label: 'Requests', icon: <GitPullRequest size={20} />, badge: stats?.requestsOpen },
    { id: 'bids', label: 'My Bids', icon: <FileText size={20} />, badge: stats?.activeBids },
    { id: 'bookings', label: 'Bookings', icon: <Calendar size={20} />, badge: stats?.upcomingBookings },
    { id: 'verification', label: 'Verification', icon: <ShieldCheck size={20} /> },
    { id: 'earnings', label: 'Earnings', icon: <IndianRupee size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  const handleReviseBid = (bid: MyBid) => {
    setSelectedRequest({
      id: bid.reqId,
      target: bid.siteName,
      city: 'Pune',
      category: bid.category,
      closesIn: 'Closing Soon',
      isUrgent: false,
      budget: '₹--',
      distance: '-- km'
    });
    setRequestView('detail');
    setActiveSection('requests');
  };

  const handleViewBookingFromBids = (bid: MyBid) => {
    setSelectedBooking({
      id: '77',
      reqId: bid.reqId,
      customerName: 'Customer X',
      siteName: bid.siteName,
      category: bid.category,
      status: 'SCHEDULED',
      date: '15 Jan, 2024',
      timeSlot: '11:00 AM – 4:00 PM'
    });
    setBookingView('detail');
    setActiveSection('bookings');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ExpertProfileScreen />;
      case 'verification':
        return <ExpertVerificationScreen />;
      case 'bids':
        return <ExpertBidsScreen onRevise={handleReviseBid} onViewBooking={handleViewBookingFromBids} />;
      case 'earnings':
        return <ExpertEarningsScreen />;
      case 'bookings':
        if (bookingView === 'report' && selectedBooking) {
          return (
            <ExpertReportSubmissionScreen
              bookingId={selectedBooking.id}
              onBack={() => setBookingView('execution')}
              onSubmitSuccess={() => {
                setBookingView('list');
              }}
            />
          );
        }
        if (bookingView === 'execution' && selectedBooking) {
          return (
            <AuditExecutionScreen
              bookingId={selectedBooking.id}
              onBack={() => setBookingView('detail')}
              onComplete={() => setBookingView('report')}
            />
          );
        }
        if (bookingView === 'detail' && selectedBooking) {
          return (
            <ExpertBookingDetailScreen
              booking={selectedBooking}
              onBack={() => setBookingView('list')}
              onStartAudit={(id) => {
                setBookingView('execution');
              }}
            />
          );
        }
        return (
          <ExpertBookingsListScreen
            onViewBooking={(booking) => {
              setSelectedBooking(booking);
              setBookingView('detail');
            }}
          />
        );
      case 'requests':
        if (requestView === 'detail' && selectedRequest) {
          return (
            <ExpertRequestDetailScreen
              request={selectedRequest}
              onBack={() => setRequestView('list')}
            />
          );
        }
        return (
          <ExpertRequestsListScreen
            onViewDetail={(req) => {
              setSelectedRequest(req);
              setRequestView('detail');
            }}
          />
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Dashboard</h1>
                <p className="text-lg text-slate-500 font-medium">Track open requests, your bids, upcoming audits, and earnings.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search marketplace..."
                    className="pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 w-80 text-sm font-medium transition-all zen-shadow"
                  />
                </div>
                <button
                  className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-teal-600 transition-all zen-shadow relative"
                  onClick={handleNotifications}
                >
                  <Bell size={22} />
                  <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              <ExpertKPIStatCard title="Requests Open" value={stats?.requestsOpen?.toString() || '0'} icon={<GitPullRequest size={24} />} subtext="In your area" />
              <ExpertKPIStatCard title="My Active Bids" value={stats?.activeBids?.toString() || '0'} icon={<FileText size={24} />} subtext="2 Shortlisted" />
              <ExpertKPIStatCard title="Upcoming Audits" value={stats?.upcomingBookings?.toString() || '0'} icon={<Calendar size={24} />} subtext="Next: Tomorrow" />
              <ExpertKPIStatCard title="This Month" value={`₹${stats?.earnings?.toLocaleString() || '0'}`} icon={<IndianRupee size={24} />} subtext="Earnings" />
            </div>

            {/* Main Marketplace Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 space-y-8">
                <div className="bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden">
                  <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">Requests Near You</h2>
                    <button
                      onClick={() => handleAction("Open Marketplace", () => setActiveSection('requests'))}
                      className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest flex items-center gap-2 group"
                    >
                      Marketplace <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {marketShort.map((req, idx) => (
                      <motion.div
                        key={req.request_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-10 group hover:bg-slate-50/50 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-8">
                          <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500">
                            <Zap size={14} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-black text-teal-600 uppercase tracking-[0.2em]">Req #{req.request_id}</span>
                              <Badge variant="slate">{req.service_category}</Badge>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">{req.org_sites?.site_name || 'Generic Site'}</h4>
                            <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                              <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-300" /> {req.org_sites?.city || '-'}</span>
                              <span className="flex items-center gap-1.5"><Clock size={12} className="text-teal-500" /> Closes: {req.bidding_close_dt ? new Date(req.bidding_close_dt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="px-8 py-3.5 border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-600 rounded-2xl font-bold transition-all"
                          onClick={() => handleAction(`View Request: ${req.request_id}`, () => {
                            setSelectedRequest({
                              id: req.request_id.toString(),
                              target: req.org_sites?.site_name || 'Generic Site',
                              city: req.org_sites?.city || '-',
                              category: req.service_category,
                              closesIn: req.bidding_close_dt ? new Date(req.bidding_close_dt).toLocaleDateString() : 'N/A',
                              isUrgent: false,
                              budget: req.budget_hint ? `₹${parseFloat(req.budget_hint).toLocaleString()}` : '--',
                              distance: '5 km'
                            });
                            setRequestView('detail');
                            setActiveSection('requests');
                          })}
                        >
                          View Request
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                {/* Profile Completion / Verification Status */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-10 -left-10 w-64 h-64 bg-teal-500 rounded-full blur-[80px]"
                  />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold font-display">Expert Status</h3>
                      <ShieldCheck className="text-teal-400" size={32} />
                    </div>
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Level</span>
                        <span className="text-lg font-black text-teal-400">MASTER</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-teal-500" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                        "Your documents are verified. You are eligible for high-value industrial audits."
                      </p>
                    </div>
                    <Button
                      className="w-full py-4 rounded-2xl bg-teal-500 text-slate-900 font-black text-sm uppercase tracking-widest"
                      onClick={() => handleAction("View Profile", () => setActiveSection('profile'))}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>

                {/* Performance Box */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 zen-shadow">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900 font-display">Performance</h3>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                      <Star size={20} fill="currentColor" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-black text-slate-900">4.8</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Rating</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-teal-600">98%</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">On-time Submission</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex justify-between">
                      <span className="text-xs font-bold text-slate-500">Latest Review</span>
                      <span
                        className="text-xs font-black text-teal-600 uppercase tracking-widest cursor-pointer hover:underline"
                        onClick={() => handleAction("Load Reviews", () => { })}
                      >
                        Read All
                      </span>
                    </div>
                  </div>
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
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-slate-50 rounded-2xl text-slate-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation - Always visible on desktop, toggleable on mobile */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative inset-0 lg:inset-y-0 z-[100] lg:z-0 lg:w-80 lg:shrink-0`}>
        {/* Mobile Overlay */}
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside className="relative w-80 bg-slate-50/80 backdrop-blur-3xl border-r border-slate-100 flex flex-col h-screen overflow-y-auto no-scrollbar">
          <div className="p-10 mb-6 hidden lg:block" onClick={() => {
            setActiveSection('dashboard');
            setIsSidebarOpen(false);
          }} style={{ cursor: 'pointer' }}>
            <Logo />
          </div>

          <nav className="flex-grow px-6 space-y-2 pt-4 lg:pt-0">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                active={activeSection === item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setRequestView('list');
                  setBookingView('list');
                  setIsSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="p-8 space-y-4">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 zen-shadow mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-xl font-display">
                  {user?.name?.substring(0, 2).toUpperCase() || 'AP'}
                </div>
                <div className="overflow-hidden" onClick={() => {
                  setActiveSection('profile');
                  setIsSidebarOpen(false);
                }} style={{ cursor: 'pointer' }}>
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Expert User'}</p>
                  <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest truncate flex items-center gap-1">
                    <ShieldCheck size={10} /> Verified Expert
                  </p>
                </div>
              </div>
            </div>
            <SidebarItem icon={<LogOut size={20} />} label="Logout" onClick={onLogout} />
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-grow p-8 lg:p-20 overflow-y-auto max-w-[1600px] mx-auto w-full">
        {renderContent()}
        <footer className="mt-32 pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} infra2zen Expert Portal
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-black text-slate-300 hover:text-teal-600 transition-colors uppercase tracking-widest">Expert Help</a>
            <a href="#" className="text-xs font-black text-slate-300 hover:text-teal-600 transition-colors uppercase tracking-widest">Earnings Policy</a>
          </div>
        </footer>
      </main>
    </div>
  );
};
