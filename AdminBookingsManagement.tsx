
import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Zap,
  Droplets,
  Sun,
  Wind,
  ClipboardCheck,
  Clock,
  User,
  ArrowRight,
  ChevronRight,
  MoreVertical,
  Calendar,
  Building2,
  FilterX,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Dropdown } from './components/Dropdown';
import { BookingDetailModal } from './components/BookingDetailModal';

interface BookingRecord {
  id: string;
  reqId: string;
  customer: string;
  site: string;
  expert: string;
  schedule: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'REPORT_SUBMITTED' | 'CANCELLED';
  city: string;
  category: 'ELECTRICAL' | 'SOLAR' | 'PLUMBING' | 'IAQ' | 'SNAGGING';
}

interface AdminBookingsManagementProps {
  onBack?: () => void;
}

import { simulateAction, showToast } from './utils/demo';

import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';

export const AdminBookingsManagement: React.FC<AdminBookingsManagementProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expertFilter, setExpertFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiClient.get('/bookings');
        setBookings(data.map((b: any) => ({
          id: b.booking_id.toString(),
          reqId: b.request_id.toString(),
          customer: b.organizations?.org_name || 'N/A',
          site: b.org_sites?.site_name || 'N/A',
          expert: b.expert_profiles?.app_users_expert_profiles_user_idToapp_users?.full_name || 'Expert',
          schedule: b.last_update_dt ? new Date(b.last_update_dt).toLocaleString() : 'N/A',
          status: b.booking_status,
          city: b.org_sites?.city || '-',
          category: b.service_category
        })));
      } catch (error) {
        showToast.error("Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleAction = async (action: string, callback?: () => void) => {
    setIsSubmitting(true);
    try {
      if (action.includes("Download") || action.includes("View")) {
        // Generic "action" talking to backend
        await apiClient.get('/api/notifications');
      } else {
        await apiClient.post('/api/support/ticket', { action });
      }
      if (callback) callback();
    } catch (error: any) {
      showToast.error(error.message || "Action failed — try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.id.includes(searchQuery) ||
      b.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.reqId.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesCity = cityFilter === 'All' || b.city === cityFilter;
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter;
    const matchesExpert = expertFilter === 'All' || b.expert === expertFilter;

    return matchesSearch && matchesStatus && matchesCity && matchesCategory && matchesExpert;
  });

  const getStatusVariant = (status: BookingRecord['status']): 'teal' | 'blue' | 'slate' | 'red' => {
    switch (status) {
      case 'SCHEDULED': return 'blue';
      case 'IN_PROGRESS': return 'teal';
      case 'REPORT_SUBMITTED': return 'teal';
      case 'COMPLETED': return 'slate';
      case 'CANCELLED': return 'red';
      default: return 'slate';
    }
  };

  const getCategoryIcon = (cat: BookingRecord['category']) => {
    switch (cat) {
      case 'ELECTRICAL': return <Zap size={14} />;
      case 'SOLAR': return <Sun size={14} />;
      case 'PLUMBING': return <Droplets size={14} />;
      case 'IAQ': return <Wind size={14} />;
      case 'SNAGGING': return <ClipboardCheck size={14} />;
    }
  };

  const resetFilters = () => {
    setStatusFilter('All');
    setCityFilter('All');
    setCategoryFilter('All');
    setExpertFilter('All');
    setSearchQuery('');
  };

  const uniqueCities = Array.from(new Set(bookings.map(b => b.city)));
  const uniqueExperts = Array.from(new Set(bookings.map(b => b.expert)));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-teal-600 rounded-[1.25rem] transition-all border border-slate-100 zen-shadow group"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Bookings</h1>
            <p className="text-lg text-slate-500 font-medium italic">"Oversee technical audit lifecycles across the platform network."</p>
          </div>
        </div>
        <div className="bg-white px-8 py-4 rounded-[2rem] border border-slate-100 flex items-center gap-10 zen-shadow">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active</p>
            <p className="text-2xl font-black text-teal-600">{bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length}</p>
          </div>
          <div className="w-px h-10 bg-slate-100" />
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-2xl font-black text-slate-900">{bookings.length}</p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 zen-shadow space-y-8">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative flex-grow w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search Booking ID, ReqID or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Dropdown
              className="min-w-[140px] bg-white border-2 border-slate-50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REPORT_SUBMITTED">Report Submitted</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Dropdown>

            <Dropdown
              className="min-w-[140px] bg-white border-2 border-slate-50"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="All">All Cities</option>
              {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
            </Dropdown>

            <Dropdown
              className="min-w-[160px] bg-white border-2 border-slate-50"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="SOLAR">Solar</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="IAQ">IAQ</option>
              <option value="SNAGGING">Snagging</option>
            </Dropdown>

            <Dropdown
              className="min-w-[140px] bg-white border-2 border-slate-50"
              value={expertFilter}
              onChange={(e) => setExpertFilter(e.target.value)}
            >
              <option value="All">All Experts</option>
              {uniqueExperts.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </Dropdown>

            <button
              onClick={resetFilters}
              className="p-3.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all border border-slate-100 hover:border-red-100"
              title="Reset Filters"
            >
              <FilterX size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table Container */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 zen-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">BookID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">ReqID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Customer / Site</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Expert</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Schedule</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-400 group-hover:text-teal-600 transition-colors uppercase tracking-widest">#{b.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-teal-600 uppercase tracking-widest">#{b.reqId}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Building2 size={12} className="text-slate-300" />
                        <span className="font-bold text-slate-900 group-hover:text-teal-800 transition-colors leading-tight">{b.customer}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <MapPin size={10} className="text-teal-500" />
                        {b.site} • {b.city}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-teal-600 group-hover:shadow-sm transition-all">
                        <User size={16} />
                      </div>
                      <span className="font-bold text-slate-700">{b.expert}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <Calendar size={14} className="text-teal-500" />
                        {b.schedule.split(' ')[0]} {b.schedule.split(' ')[1]}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock size={10} />
                        {b.schedule.split(' ').slice(2).join(' ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={getStatusVariant(b.status)}>
                      {b.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button
                      variant="outline"
                      className="px-6 py-2 border-teal-100 text-teal-600 hover:bg-teal-50 rounded-xl font-black uppercase tracking-widest text-[10px]"
                      onClick={() => handleAction(`View Booking: ${b.id}`, () => setSelectedBooking(b))}
                      loading={isSubmitting}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-32 text-center">
                    <div className="inline-flex flex-col items-center">
                      <Calendar size={48} className="text-slate-100 mb-4" />
                      <p className="text-slate-400 font-medium">No bookings found matching your search.</p>
                      <button onClick={resetFilters} className="text-teal-600 font-black uppercase tracking-widest text-xs mt-4 hover:underline">Clear all filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between bg-white gap-6">
          <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">
            Showing {filteredBookings.length} of {bookings.length} Platform Bookings
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-2.5 text-[10px] font-black text-slate-300 border border-slate-100 rounded-xl cursor-not-allowed uppercase tracking-widest">
              Previous
            </button>
            <button className="px-8 py-2.5 text-[10px] font-black text-teal-600 border border-teal-100 rounded-xl bg-teal-50/50 uppercase tracking-widest hover:bg-teal-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
        />
      )}

      {/* Footer Info */}
      <div className="pt-10 flex items-center justify-center gap-3 text-slate-300">
        <div className="h-px w-10 bg-slate-100" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Audit Log Active</p>
        <div className="h-px w-10 bg-slate-100" />
      </div>
    </div>
  );
};
