
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Star,
  Settings2,
  Trash2,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { TimelineStepper, StepStatus } from './components/TimelineStepper';
import { ConfirmationModal } from './components/ConfirmationModal';
import { RescheduleModal } from './components/RescheduleModal';

interface BookingTrackingScreenProps {
  bookingId: string;
  onBack: () => void;
  initialStatus?: StepStatus;
}

import { simulateAction, showToast } from './utils/demo';

import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';

export const BookingTrackingScreen: React.FC<BookingTrackingScreenProps> = ({
  bookingId,
  onBack,
  initialStatus = 'SCHEDULED'
}) => {
  const [status, setStatus] = useState<StepStatus>(initialStatus);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await apiClient.get(`/bookings/${bookingId}`);
        setBooking(data);
        setStatus(data.booking_status);
      } catch (error) {
        showToast.error("Failed to load tracking data");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const expert = booking?.expert_profiles?.app_users_expert_profiles_user_idToapp_users || {
    name: 'Expert',
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/150?img=11',
    specialty: 'Auditor'
  };

  const handleAction = async (action: string, callback: () => void) => {
    setIsProcessing(true);
    try {
      await apiClient.post('/api/support/ticket', { action, bookingId });
      callback();
    } catch (error: any) {
      showToast.error(error.message || "Request failed — please try again");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    setIsProcessing(true);
    try {
      await apiClient.post(`/bookings/${bookingId}/status`, { status: 'CANCELLED' });
      showToast.success("Booking cancelled successfully");
      setShowCancelModal(false);
      onBack();
    } catch (error) {
      showToast.error("Cancellation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReschedule = async (date: string, time: string) => {
    setIsProcessing(true);
    try {
      await apiClient.post(`/api/bookings/${bookingId}/reschedule`, { newStart: date + 'T' + time, newEnd: date + 'T' + time }); // Mock end time
      showToast.success(`Rescheduled for ${date} at ${time}`);
      setShowRescheduleModal(false);
      // Refresh logic would be good here
    } catch (error: any) {
      showToast.error(error.message || "Reschedule request failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-teal-600">Loading tracking data...</div>;
  if (!booking) return <div className="p-20 text-center text-red-500">Booking not found.</div>;

  return (
    <div className="max-w-6xl mx-auto pb-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors font-bold text-xs uppercase tracking-widest group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Bookings
          </button>
          <div className="flex flex-wrap items-center gap-5">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display tracking-tighter">Booking #{bookingId}</h1>
            <Badge variant={status === 'REPORT_SUBMITTED' ? 'teal' : 'blue'}>{status.replace('_', ' ')}</Badge>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Linked Req <span className="text-teal-600">#{booking.request_id}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {status === 'REPORT_SUBMITTED' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Button
                className="px-10 py-5 rounded-2xl bg-slate-900 text-white font-black shadow-2xl shadow-slate-900/20 text-base font-display"
                onClick={() => handleAction("View Audit Report", () => { })}
                loading={isProcessing}
              >
                <Eye size={20} className="mr-2" /> View Report
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Timeline Stepper */}
      <section className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-14 zen-shadow mb-10 overflow-hidden">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-xl font-black text-slate-900 font-display tracking-tight uppercase tracking-[0.2em]">Audit Pipeline</h2>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Clock size={14} className="text-teal-500" /> Real-time status sync
          </div>
        </div>
        <TimelineStepper currentStatus={status} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Expert Card */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 zen-shadow group transition-all hover:border-teal-100/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img src={expert.avatar} alt={expert.name} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-2xl transition-transform group-hover:scale-105 duration-500" />
                  <div className="absolute -top-2 -right-2 bg-teal-500 text-white p-2 rounded-2xl border-4 border-white shadow-xl">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="text-2xl font-black text-slate-900 font-display">{expert.name}</h3>
                    <Badge variant="teal">VERIFIED</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-amber-500 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100/50">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-black ml-1.5">{expert.rating}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{expert.specialty}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="px-8 py-4 border-teal-100 text-teal-600 hover:bg-teal-50 rounded-2xl font-black uppercase tracking-widest text-xs"
                onClick={() => handleAction("Message Expert", () => { })}
                loading={isProcessing}
              >
                <MessageSquare size={18} className="mr-2" /> Message
              </Button>
            </div>
          </div>

          {/* Details Box */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 zen-shadow">
            <h3 className="text-xl font-black text-slate-900 font-display mb-8 tracking-tight">Audit Context</h3>
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Calendar size={12} className="text-teal-500" /> Scheduled Window
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    {booking.scheduled_start_dt ? new Date(booking.scheduled_start_dt).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin size={12} className="text-teal-500" /> Audit Site
                  </p>
                  <p className="text-lg font-bold text-slate-800">{booking.org_sites?.site_name || 'Site'}</p>
                </div>
              </div>

              <div className="p-8 bg-slate-50/80 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                <FileText size={40} className="absolute top-6 right-6 text-slate-200" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Scope & Access Instructions</h4>
                <p className="text-slate-600 leading-relaxed font-medium italic">
                  "{booking.scope_notes || 'No instructions provided.'}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Action Sidebar */}
          <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 12, repeat: Infinity }}
              className="absolute -top-20 -left-20 w-64 h-64 bg-teal-500 rounded-full blur-[80px]"
            />
            <div className="relative z-10 space-y-8">
              <h3 className="text-xl font-bold font-display tracking-tight">Quick Actions</h3>

              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowRescheduleModal(true)}
                  className="w-full py-5 rounded-2xl border-2 border-white/5 bg-white/5 hover:bg-white/10 hover:border-teal-500/50 text-white font-black text-xs uppercase tracking-widest transition-all"
                >
                  <Settings2 size={18} className="mr-2 text-teal-400" /> Reschedule Request
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-5 rounded-2xl border-2 border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/50 text-slate-400 hover:text-red-400 font-black text-xs uppercase tracking-widest transition-all"
                >
                  <Trash2 size={18} className="mr-2" /> Cancel Booking
                </Button>
              </div>

              <div className="pt-8 border-t border-white/10">
                <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-4">Support</p>
                <div
                  className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 group/support cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => handleAction("Contact Support", () => { })}
                >
                  <div className="p-2 bg-teal-600 rounded-xl text-white group-hover/support:scale-110 transition-transform">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-teal-400 uppercase tracking-widest">Concierge Active</p>
                    <p className="text-sm font-bold text-white">Contact Platform Support</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Status Alert */}
          {status === 'SCHEDULED' && (
            <div className="bg-teal-50 border border-teal-100 p-8 rounded-[3.5rem] flex flex-col items-center text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-teal-600 shadow-xl shadow-teal-500/10">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <p className="text-xs font-black text-teal-600 uppercase tracking-widest mb-1">Expert Ready</p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Expert Amit P has confirmed the slot and is preparing for the site visit.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelBooking}
        isSubmitting={isProcessing}
        type="reject"
        title="Cancel Booking"
        message="Are you sure you want to cancel this audit? Cancellations within 48 hours of the scheduled time may incur platform fees."
      />

      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleReschedule}
      />
    </div>
  );
};
