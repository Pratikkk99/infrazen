
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Zap,
  Calendar,
  FileText,
  IndianRupee,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Send,
  AlertCircle,
  Archive,
  Info,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Input } from './components/Input';
import { Dropdown } from './components/Dropdown';
import { OpenRequest } from './ExpertRequestsListScreen';
import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

interface ExpertRequestDetailScreenProps {
  request: OpenRequest;
  onBack: () => void;
}

export const ExpertRequestDetailScreen: React.FC<ExpertRequestDetailScreenProps> = ({ request, onBack }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [proposedStart, setProposedStart] = useState('');
  const [proposedEnd, setProposedEnd] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fullRequest, setFullRequest] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFullDetail = async () => {
      try {
        const data = await apiClient.get(`/requests/${request.id}`);
        setFullRequest(data);
      } catch (error) {
        showToast.error("Failed to load request details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFullDetail();
  }, [request.id]);

  const preferredWindow = {
    start: fullRequest?.preferred_start_dt ? new Date(fullRequest.preferred_start_dt) : new Date(),
    end: fullRequest?.preferred_end_dt ? new Date(fullRequest.preferred_end_dt) : new Date(Date.now() + 86400000)
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!bidAmount || isNaN(Number(bidAmount))) {
      newErrors.bidAmount = 'Valid numeric amount is required';
    }

    if (!proposedStart || !proposedEnd) {
      newErrors.slots = 'Both start and end times are required';
    } else {
      const pStart = new Date(proposedStart);
      const pEnd = new Date(proposedEnd);

      if (pStart < preferredWindow.start || pEnd > preferredWindow.end) {
        newErrors.slots = `Slot must be within the preferred window (${preferredWindow.start.toLocaleString()} - ${preferredWindow.end.toLocaleString()})`;
      }
      if (pStart >= pEnd) {
        newErrors.slots = 'End time must be after start time';
      }
    }

    if (!deliverables.trim()) {
      newErrors.deliverables = 'Please specify at least one deliverable';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast.error("Please fix the errors in the form");
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/expert/bid', {
        requestId: parseInt(request.id),
        amount: parseFloat(bidAmount),
        notes,
        deliverables,
        proposedStart: proposedStart,
        proposedEnd: proposedEnd
      });

      showToast.success("Bid submitted successfully");
      setShowSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error: any) {
      showToast.error(error.message || "Failed to submit bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const platformFee = bidAmount ? (Number(bidAmount) * 0.1).toFixed(2) : '0.00';
  const expertTakeaway = bidAmount ? (Number(bidAmount) * 0.9).toFixed(2) : '0.00';

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-teal-50 rounded-[2.5rem] flex items-center justify-center text-teal-600 mx-auto shadow-2xl shadow-teal-500/10 border-4 border-white">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Bid Submitted Successfully</h2>
          <p className="text-lg text-slate-500 font-medium">Your proposal of {currency} {bidAmount} has been sent to the organization.</p>
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Redirecting to marketplace queue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Page Header */}
      <div className="space-y-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors font-bold text-xs uppercase tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Marketplace
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter font-display">Request #{request.id}</h1>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Category: <span className="text-slate-900">{request.category}</span>
              </span>
              <div className="h-1 w-1 rounded-full bg-slate-200" />
              <Badge variant="teal">BIDDING_OPEN</Badge>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-100 zen-shadow ${request.isUrgent ? 'animate-pulse border-red-100' : ''}`}>
            <Clock size={20} className={request.isUrgent ? 'text-red-500' : 'text-teal-500'} />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Closes In</p>
              <p className={`text-xl font-mono font-black ${request.isUrgent ? 'text-red-500' : 'text-slate-700'}`}>{request.closesIn}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Request Details Section */}
        <div className="lg:col-span-7 space-y-10">
          <section className="bg-white rounded-[3.5rem] border border-slate-100 p-10 md:p-14 zen-shadow space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} className="text-teal-500" /> Site Target
                </p>
                <div>
                  <p className="text-xl font-black text-slate-900 tracking-tight">{request.target}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">INDUSTRIAL_PLANT • {request.city}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-teal-500" /> Preferred Window
                </p>
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {fullRequest?.preferred_start_dt ? new Date(fullRequest.preferred_start_dt).toLocaleString() : 'Not Specified'}
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {fullRequest?.preferred_end_dt ? ' → ' + new Date(fullRequest.preferred_end_dt).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scope Notes</p>
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100/50 relative overflow-hidden group">
                <FileText size={56} className="absolute -bottom-4 -right-4 text-slate-200/50 group-hover:text-teal-500/10 transition-colors duration-700" />
                <p className="text-slate-600 leading-relaxed font-medium italic relative z-10">
                  "{fullRequest?.scope_notes || 'No detailed scope notes provided.'}"
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Organization</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Budget</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{request.budget}</p>
              </div>
            </div>
          </section>

          {/* Quick Tips */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-10 -left-10 w-64 h-64 bg-teal-500 rounded-full blur-[80px]" />
            <div className="relative z-10 flex gap-8 items-start">
              <div className="w-16 h-16 rounded-[1.5rem] bg-teal-500 flex items-center justify-center text-slate-900 shrink-0">
                <Info size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold font-display tracking-tight">Expert Tip</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Detailed deliverables like "Thermal Mapping" and "Rectification Roadmap" increase winning probability by 65% for industrial audits.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bid Form Section */}
        <div className="lg:col-span-5">
          <section className="bg-white rounded-[3.5rem] border border-slate-100 p-8 md:p-10 zen-shadow sticky top-24">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-slate-900 font-display tracking-tight">Submit Bid</h3>
              <button className="text-[10px] font-black text-slate-300 hover:text-teal-600 transition-colors uppercase tracking-widest flex items-center gap-1">
                <Archive size={14} /> Save Draft
              </button>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-8">
              {/* Bid Amount */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bid Amount</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      placeholder="e.g. 14000"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className={`w-full pl-12 pr-6 py-4 bg-slate-50/50 border-2 rounded-2xl text-lg font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-500/5 transition-all ${errors.bidAmount ? 'border-red-200' : 'border-slate-100 focus:border-teal-500'
                        }`}
                    />
                    {currency === 'INR' ? (
                      <IndianRupee size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    ) : (
                      <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    )}
                  </div>
                  <div className="w-28">
                    <Dropdown
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="bg-white border-2 border-slate-100 h-[60px]"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                    </Dropdown>
                  </div>
                </div>
                {errors.bidAmount && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider">{errors.bidAmount}</p>}

                {bidAmount && !errors.bidAmount && (
                  <div className="flex justify-between items-center px-4 py-3 bg-teal-50/30 rounded-xl border border-teal-100 animate-in fade-in slide-in-from-top-1">
                    <div>
                      <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest">You receive (Est.)</p>
                      <p className="text-sm font-black text-teal-800">{currency} {expertTakeaway}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Platform Fee (10%)</p>
                      <p className="text-sm font-bold text-slate-500">{currency} {platformFee}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Proposed Slot */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Slot</label>
                  <span className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">Within Pref. Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Start Time</p>
                    <input
                      type="datetime-local"
                      value={proposedStart}
                      onChange={(e) => setProposedStart(e.target.value)}
                      className={`w-full px-4 py-3.5 bg-slate-50/50 border-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none transition-all ${errors.slots ? 'border-red-100' : 'border-slate-100 focus:border-teal-500 focus:bg-white'
                        }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">End Time</p>
                    <input
                      type="datetime-local"
                      value={proposedEnd}
                      onChange={(e) => setProposedEnd(e.target.value)}
                      className={`w-full px-4 py-3.5 bg-slate-50/50 border-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none transition-all ${errors.slots ? 'border-red-100' : 'border-slate-100 focus:border-teal-500 focus:bg-white'
                        }`}
                    />
                  </div>
                </div>
                {errors.slots && (
                  <div className="flex items-start gap-2 text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider leading-relaxed">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{errors.slots}</span>
                  </div>
                )}
              </div>

              {/* Deliverables */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deliverables</label>
                <textarea
                  rows={3}
                  placeholder="PDF report + infrared photos + safety checklist + consultation call..."
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  className={`w-full px-5 py-4 bg-slate-50/50 border-2 rounded-[1.5rem] text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/5 transition-all resize-none leading-relaxed ${errors.deliverables ? 'border-red-200' : 'border-slate-100 focus:border-teal-500 focus:bg-white'
                    }`}
                />
                {errors.deliverables && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider">{errors.deliverables}</p>}

                <div className="flex flex-wrap gap-2 pt-1">
                  {['Full PDF Report', 'Thermal Scans', 'Checklist', 'Consultation'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setDeliverables(prev => prev ? `${prev}, ${tag}` : tag)}
                      className="text-[9px] font-black text-slate-400 border border-slate-100 px-2 py-1 rounded-md hover:border-teal-200 hover:text-teal-600 transition-all uppercase"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional clarifications or assumptions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-[1.5rem] text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full py-5 rounded-[1.75rem] text-xl font-display font-black shadow-2xl shadow-teal-500/20 transition-all duration-500 bg-teal-600 hover:bg-teal-700"
                >
                  Submit Bid
                  {!isSubmitting && <Send size={22} className="ml-3" />}
                </Button>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-6">
                  Bids are binding for 72 hours
                </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};
