
import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  User,
  Zap,
  Droplets,
  Sun,
  Wind,
  ClipboardCheck,
  Clock,
  ArrowRight,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Dropdown } from './components/Dropdown';

export interface ExpertBooking {
  id: string;
  reqId: string;
  customerName: string;
  siteName: string;
  category: string;
  status: string;
  date: string;
  timeSlot: string;
}

import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';
interface ExpertBookingsListScreenProps {
  onViewBooking: (booking: ExpertBooking) => void;
}

export const ExpertBookingsListScreen: React.FC<ExpertBookingsListScreenProps> = ({ onViewBooking }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: string, callback?: () => void) => {
    setIsSubmitting(true);
    try {
      await simulateAction(action);
      if (callback) callback();
    } catch (error) {
      showToast.error("Action failed — try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [bookings, setBookings] = useState<ExpertBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiClient.get('/bookings');
        setBookings(data.map((b: any) => ({
          id: b.booking_id.toString(),
          reqId: b.request_id.toString(),
          customerName: b.organizations?.org_name || 'Organization',
          siteName: b.org_sites?.site_name || 'Site',
          category: b.service_category,
          status: b.booking_status,
          date: b.scheduled_start_dt ? new Date(b.scheduled_start_dt).toLocaleDateString() : 'TBD',
          timeSlot: b.scheduled_start_dt ? new Date(b.scheduled_start_dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'
        })));
      } catch (error) {
        showToast.error("Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getCategoryIcon = (category: ExpertBooking['category']) => {
    switch (category) {
      case 'ELECTRICAL': return <Zap size={14} />;
      case 'PLUMBING': return <Droplets size={14} />;
      case 'SOLAR': return <Sun size={14} />;
      case 'IAQ': return <Wind size={14} />;
      case 'SNAGGING': return <ClipboardCheck size={14} />;
    }
  };

  const getStatusVariant = (status: ExpertBooking['status']): 'teal' | 'blue' | 'slate' | 'red' => {
    switch (status) {
      case 'SCHEDULED': return 'blue';
      case 'IN_PROGRESS': return 'teal';
      case 'AWAITING_REPORT': return 'red';
      case 'COMPLETED': return 'slate';
      default: return 'slate';
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.id.includes(searchQuery) || b.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">My Bookings</h1>
        <p className="text-lg text-slate-500 font-medium">Manage your assigned audits and tracking progress.</p>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 zen-shadow flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-grow w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 text-sm font-medium transition-all"
          />
        </div>
        <Dropdown
          className="min-w-[180px] bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="AWAITING_REPORT">Awaiting Report</option>
          <option value="COMPLETED">Completed</option>
        </Dropdown>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBookings.map((booking) => (
          <motion.div
            key={booking.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-[3rem] border border-slate-100 p-8 zen-shadow group transition-all hover:border-teal-100/50 flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <Badge variant={getStatusVariant(booking.status)}>{booking.status.replace('_', ' ')}</Badge>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Book #{booking.id}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{booking.customerName}</p>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{booking.siteName}</h3>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Calendar size={14} className="text-teal-500" />
                  {booking.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Clock size={14} className="text-teal-500" />
                  {booking.timeSlot}
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {getCategoryIcon(booking.category)}
                {booking.category}
              </div>
            </div>

            <div className="mt-auto">
              <Button
                variant="outline"
                className="w-full py-3.5 border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-600 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                onClick={() => handleAction(`View Booking: ${booking.id}`, () => onViewBooking(booking))}
                loading={isSubmitting}
              >
                View Details <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
