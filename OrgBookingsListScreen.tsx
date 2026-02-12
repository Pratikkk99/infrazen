
import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Filter,
  MapPin,
  Zap,
  Droplets,
  Sun,
  Wind,
  ClipboardCheck,
  User,
  ArrowRight,
  MoreVertical,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Dropdown } from './components/Dropdown';

export interface Booking {
  id: string;
  reqId: string;
  siteName: string;
  category: 'ELECTRICAL' | 'PLUMBING' | 'SOLAR' | 'IAQ' | 'SNAGGING';
  expertName: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'AWAITING_PAYMENT';
  date: string;
}

interface OrgBookingsListScreenProps {
  onTrackBooking: (booking: Booking) => void;
}

import { simulateAction, showToast } from './utils/demo';

import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';

export const OrgBookingsListScreen: React.FC<OrgBookingsListScreenProps> = ({ onTrackBooking }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const myOrgs = await apiClient.get('/org/my-organizations');
        if (myOrgs.length > 0) {
          const bookingsData = await apiClient.get(`/api/org/${myOrgs[0].org_id}/bookings`);
          setBookings(bookingsData.map((b: any) => ({
            id: b.booking_id.toString(),
            reqId: b.request_id.toString(),
            siteName: b.org_sites?.site_name || 'Generic Site',
            category: b.service_category,
            expertName: b.expert_profiles?.app_users_expert_profiles_user_idToapp_users?.name || 'Expert',
            status: b.booking_status,
            date: b.scheduled_start_dt ? new Date(b.scheduled_start_dt).toLocaleDateString() : 'TBD'
          })));
        }
      } catch (error) {
        showToast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleAction = async (action: string, callback?: () => void) => {
    setIsSubmitting(true);
    try {
      if (callback) callback();
    } catch (error) {
      showToast.error("Action failed — try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: Booking['category']) => {
    switch (category) {
      case 'ELECTRICAL': return <Zap size={14} />;
      case 'PLUMBING': return <Droplets size={14} />;
      case 'SOLAR': return <Sun size={14} />;
      case 'IAQ': return <Wind size={14} />;
      case 'SNAGGING': return <ClipboardCheck size={14} />;
    }
  };

  const getStatusVariant = (status: Booking['status']): 'teal' | 'blue' | 'slate' | 'red' => {
    switch (status) {
      case 'SCHEDULED': return 'blue';
      case 'IN_PROGRESS': return 'teal';
      case 'COMPLETED': return 'slate';
      case 'AWAITING_PAYMENT': return 'red';
      default: return 'slate';
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.id.includes(searchQuery) || b.siteName.toLowerCase().includes(searchQuery.toLowerCase()) || b.expertName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesSite = siteFilter === 'All' || b.siteName === siteFilter;
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesSite && matchesCategory;
  });

  const uniqueSites = Array.from(new Set(bookings.map(b => b.siteName)));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Bookings</h1>
          <p className="text-lg text-slate-500 font-medium">Track all scheduled and active audit inspections.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-4 zen-shadow">
          <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Active</p>
            <p className="text-lg font-bold text-slate-900">{bookings.filter(b => b.status !== 'COMPLETED').length}</p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 zen-shadow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Search Bookings</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="ID, Site or Expert..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <Dropdown
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
              <option value="COMPLETED">Completed</option>
            </Dropdown>
          </div>

          <div className="md:col-span-3">
            <Dropdown
              label="Site"
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
            >
              <option value="All">All Sites</option>
              {uniqueSites.map(site => (
                <option key={site} value={site}>{site}</option>
              ))}
            </Dropdown>
          </div>

          <div className="md:col-span-2">
            <Dropdown
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="SOLAR">Solar</option>
              <option value="IAQ">IAQ</option>
              <option value="SNAGGING">Snagging</option>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Bookings Table Container */}
      <div className="bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">BookID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ReqID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Site</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Expert</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">#{booking.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-teal-600 uppercase tracking-widest">#{booking.reqId}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-300" />
                      <span className="font-bold text-slate-900">{booking.siteName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {getCategoryIcon(booking.category)}
                      {booking.category}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-slate-700">{booking.expertName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={getStatusVariant(booking.status)}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-6 py-2 border-teal-100 text-teal-600 hover:bg-teal-50 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                      onClick={() => handleAction(`Track Booking: ${booking.id}`, () => onTrackBooking(booking))}
                      loading={isSubmitting}
                    >
                      Track
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-50">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BOOK #{booking.id}</p>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">REQ #{booking.reqId}</p>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{booking.siteName}</h3>
                </div>
                <Badge variant={getStatusVariant(booking.status)}>
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    {getCategoryIcon(booking.category)}
                    {booking.category}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expert</p>
                  <p className="text-sm font-bold text-slate-700">{booking.expertName}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheduled Date</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Clock size={14} className="text-teal-500" /> {booking.date}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full py-3.5 border-teal-100 text-teal-600 font-bold uppercase tracking-widest text-xs"
                onClick={() => handleAction(`Track Progress: ${booking.id}`, () => onTrackBooking(booking))}
                loading={isSubmitting}
              >
                Track Progress
              </Button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="py-32 text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <ClipboardCheck size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              You haven't awarded any audit requests yet. Award a bid to an expert to see your scheduled bookings here.
            </p>
            <Button variant="primary">
              View Open Requests
            </Button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing {filteredBookings.length} bookings
        </p>
        <div className="flex gap-4">
          <button className="text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest">Previous</button>
          <button className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest">Next</button>
        </div>
      </div>
    </div>
  );
};
