
import React, { useState, useEffect } from 'react';
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
  Download,
  Info,
  CheckCircle2,
  X,
  Send,
  Zap,
  Phone
} from 'lucide-react';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { TimelineStepper, StepStatus } from './components/TimelineStepper';
import { ExpertBooking } from './ExpertBookingsListScreen';

interface ExpertBookingDetailScreenProps {
  booking: ExpertBooking;
  onBack: () => void;
  onStartAudit: (bookingId: string) => void;
}

import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

const MessagingModal: React.FC<{ isOpen: boolean; onClose: () => void; customerName: string }> = ({ isOpen, onClose, customerName }) => {
  const [msg, setMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!msg.trim()) return;
    setIsSending(true);
    try {
      await apiClient.post("/api/messages", { text: msg });
      showToast.success("Message sent to customer");
      setMsg('');
    } catch (error: any) {
      showToast.error(error.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-md bg-white rounded-[3rem] zen-shadow p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-display tracking-tight">Chat with {customerName}</h3>
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mt-1">Audit Coordination</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-300">
            <X size={20} />
          </button>
        </div>
        <div className="h-64 bg-slate-50 rounded-[2rem] border border-slate-100 p-6 mb-6 overflow-y-auto flex flex-col justify-end">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 max-w-[80%] self-start text-sm text-slate-600 font-medium">
            Hi, please let me know when you reach the North gate.
          </div>
          <div className="text-[9px] text-slate-400 font-bold uppercase ml-4 mt-1 mb-4">Customer • 2h ago</div>
        </div>
        <div className="relative">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type your message..."
            className="w-full pl-6 pr-16 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500 transition-all resize-none"
            rows={1}
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={isSending}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20 disabled:opacity-50"
          >
            {isSending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const ExpertBookingDetailScreen: React.FC<ExpertBookingDetailScreenProps> = ({
  booking,
  onBack,
  onStartAudit
}) => {
  const [status, setStatus] = useState<StepStatus>(booking.status as StepStatus);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isStarting, setIsStarting] = useState(false);
  const [fullBooking, setFullBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate window checking
  const isAuditActive = true;

  useEffect(() => {
    const fetchFullBooking = async () => {
      try {
        const data = await apiClient.get(`/bookings/${booking.id}`);
        setFullBooking(data);
        setStatus(data.booking_status as StepStatus);
      } catch (error) {
        showToast.error("Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFullBooking();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [booking.id]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      // In real app, we'd have a specific status update API
      await apiClient.post(`/bookings/${booking.id}/status`, { status: 'IN_PROGRESS' });
      showToast.success("Audit session initialized");
      setStatus('IN_PROGRESS');
      onStartAudit(booking.id);
    } catch (error: any) {
      showToast.error(error.message || "Failed to start audit");
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display tracking-tighter">Booking #{booking.id}</h1>
            <Badge variant={status === 'IN_PROGRESS' ? 'teal' : 'blue'}>{status.replace('_', ' ')}</Badge>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Service Category: <span className="text-teal-600 font-black">{booking.category}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setIsMsgModalOpen(true)}
            className="px-8 py-4 border-teal-100 text-teal-600 hover:bg-teal-50 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            <MessageSquare size={18} className="mr-2" /> Message Customer
          </Button>
          <Button
            variant="ghost"
            className="px-6 py-4 border-slate-100 text-slate-400 hover:text-teal-600 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            <Phone size={18} />
          </Button>
        </div>
      </header>

      {/* Audit Progress */}
      <section className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-14 zen-shadow mb-10 overflow-hidden">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-xl font-black text-slate-900 font-display tracking-tight uppercase tracking-[0.2em]">Live Pipeline</h2>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Clock size={14} className="text-teal-500" /> Auto-sync enabled
          </div>
        </div>
        <TimelineStepper currentStatus={status} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Booking Info Card */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 zen-shadow">
            <h3 className="text-xl font-black text-slate-900 font-display mb-8 tracking-tight">Booking Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer</p>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 font-bold text-slate-800">
                  {booking.customerName}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site / Facility</p>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 font-bold text-slate-800 flex items-center gap-2">
                  <MapPin size={14} className="text-teal-500" /> {booking.siteName}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule</p>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 font-bold text-slate-800 flex items-center gap-2">
                  <Calendar size={14} className="text-teal-500" /> {booking.date}
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-teal-50/30 rounded-[2rem] border border-teal-100/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Clock size={20} className="text-teal-600" />
                <div>
                  <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest">Time Window</p>
                  <p className="text-lg font-black text-teal-900 tracking-tight">{booking.timeSlot}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local Time</p>
                <p className="text-sm font-mono font-bold text-slate-600">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>

          {/* Access Instructions */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 zen-shadow">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 font-display tracking-tight">Access Instructions</h3>
              <button className="flex items-center gap-2 text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline">
                <Download size={14} /> Request Scope Attachment
              </button>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100/50 relative overflow-hidden group">
              <Info size={48} className="absolute -bottom-4 -right-4 text-slate-200 group-hover:text-teal-500/10 transition-colors duration-700" />
              <p className="text-slate-600 leading-relaxed font-medium italic relative z-10">
                "{fullBooking?.service_requests?.scope_notes || 'No detailed access instructions provided.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-10">
          <section className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -top-10 -left-10 w-64 h-64 bg-teal-500 rounded-full blur-[80px]"
            />
            <div className="relative z-10 space-y-10 text-center">
              <div className="space-y-2">
                <h4 className="text-2xl font-black font-display tracking-tight">Start Audit</h4>
                <p className="text-sm text-slate-400 font-medium">Capture evidence and generate report during site visit.</p>
              </div>

              <div className="space-y-4">
                <Button
                  disabled={!isAuditActive || status === 'IN_PROGRESS' || isStarting}
                  onClick={handleStart}
                  loading={isStarting}
                  className="w-full py-6 rounded-[2rem] bg-teal-500 text-slate-900 font-black text-lg shadow-2xl shadow-teal-500/20 disabled:opacity-20 disabled:grayscale transition-all duration-500"
                >
                  {status === 'IN_PROGRESS' ? 'Audit in Progress...' : 'Start Site Audit'}
                  {status !== 'IN_PROGRESS' && !isStarting && <ArrowRight size={22} className="ml-3" />}
                </Button>

                {!isAuditActive && (
                  <p className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <AlertCircle size={14} /> Available once booking is active
                  </p>
                )}
              </div>

              <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-4 text-left p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-teal-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest">Emergency Support</p>
                    <p className="text-xs font-bold text-white">+91 1800-ZEN-SAFE</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Tip */}
          <div className="p-8 bg-teal-50 rounded-[2.5rem] border border-teal-100 flex items-start gap-4">
            <Zap className="text-teal-600 shrink-0 mt-1" size={20} />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 leading-tight tracking-tight">Expert Hint</p>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">Uploading 10+ high-quality thermal scans typically leads to faster report approval.</p>
            </div>
          </div>
        </div>
      </div>

      <MessagingModal
        isOpen={isMsgModalOpen}
        onClose={() => setIsMsgModalOpen(false)}
        customerName={booking.customerName}
      />
    </div>
  );
};
