
import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Zap,
  Calendar,
  FileText,
  Star,
  CheckCircle2,
  User,
  MessageSquare,
  Activity,
  Filter,
  ChevronDown,
  ExternalLink,
  Copy,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  History,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { Dropdown } from './components/Dropdown';
import { AwardBookingModal } from './components/AwardBookingModal';
import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';

interface Bid {
  id: string;
  expertName: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  amount: string;
  amountRaw: number;
  schedule: string;
  deliverables: string[];
  avatar?: string;
  notes: string;
}

interface RequestInfo {
  request_id: number;
  request_status: string;
  service_category: string;
  scope_notes: string;
  bidding_close_dt: string;
  org_sites?: {
    site_name: string;
    city: string;
  };
}

interface RequestDetailScreenProps {
  requestId: string;
  onBack: () => void;
  onAwarded?: (bookingId: string, status: any) => void;
}

export const RequestDetailScreen: React.FC<RequestDetailScreenProps> = ({ requestId, onBack, onAwarded }) => {
  const [activeTab, setActiveTab] = useState<'bids' | 'messages' | 'activity'>('bids');
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [isAwarding, setIsAwarding] = useState(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterSort, setFilterSort] = useState('price-low');
  const [filterMinRating, setFilterMinRating] = useState('0');

  const [request, setRequest] = useState<RequestInfo | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqData, bidsData] = await Promise.all([
          apiClient.get(`/requests/${requestId}`),
          apiClient.get(`/requests/${requestId}/bids`)
        ]);

        setRequest(reqData);
        setBids(bidsData.map((b: any) => ({
          id: b.bid_id.toString(),
          expertName: b.expert_profiles?.app_users_expert_profiles_user_idToapp_users?.full_name || 'Expert',
          rating: 4.5, // Mocked for now
          reviewsCount: 10, // Mocked
          isVerified: b.expert_profiles?.verification_status === 'APPROVED',
          amount: `₹${parseFloat(b.bid_amount).toLocaleString()}`,
          amountRaw: parseFloat(b.bid_amount),
          schedule: b.proposed_start_dt ? new Date(b.proposed_start_dt).toLocaleDateString() : 'Flexible',
          deliverables: b.deliverables ? b.deliverables.split(',') : ['Standard Audit'],
          notes: b.notes || '',
          avatar: `https://i.pravatar.cc/150?u=${b.expert_id}`
        })));
      } catch (error) {
        showToast.error("Failed to load request details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [requestId]);

  const filteredBids = bids
    .filter(bid => !filterVerifiedOnly || bid.isVerified)
    .filter(bid => bid.rating >= parseFloat(filterMinRating))
    .filter(bid => !filterVerifiedOnly || bid.isVerified)
    .filter(bid => bid.rating >= parseFloat(filterMinRating))
    .sort((a, b) => {
      if (filterSort === 'price-low') return a.amountRaw - b.amountRaw;
      if (filterSort === 'price-high') return b.amountRaw - a.amountRaw;
      return 0;
    });


  const handleConfirmAward = async (paymentOption: 'now' | 'later') => {
    if (!selectedBidId) return;
    setIsAwarding(true);
    try {
      const data = await apiClient.post(`/requests/${requestId}/award`, {
        bidId: parseInt(selectedBidId)
      });

      showToast.success(`Booking created successfully!`);
      setShowAwardModal(false);

      if (onAwarded) {
        onAwarded(data.booking_id.toString(), data.booking_status);
      } else {
        onBack();
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to award booking");
    } finally {
      setIsAwarding(false);
    }
  };

  const selectedExpert = bids.find(b => b.id === selectedBidId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors font-bold text-xs uppercase tracking-widest group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Requests
          </button>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Request #{requestId}</h1>
            <Badge variant="teal">{request?.request_status || 'LOADING'}</Badge>
          </div>
        </div>

        <div className="bg-white border border-teal-100 px-6 py-4 rounded-[2rem] zen-shadow flex items-center gap-6">
          <div className="flex flex-col items-center">
            <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600 mb-1">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Closes In</p>
            <p className="text-2xl font-mono font-black text-teal-600 tracking-tighter">05:12:33</p>
          </div>
        </div>
      </header>

      {/* Summary Section */}
      <section className="bg-white rounded-[3rem] border border-slate-100 p-10 zen-shadow mb-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Site</p>
              <div className="flex items-center gap-3 text-slate-900 font-bold bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <MapPin size={18} className="text-teal-500" />
                {request?.org_sites?.site_name || 'Generic Site'}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</p>
              <div className="flex items-center gap-3 text-slate-900 font-bold bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <Zap size={18} className="text-teal-500" />
                {request?.service_category || 'N/A'}
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Window</p>
              <div className="flex items-center gap-3 text-slate-900 font-bold bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <Calendar size={18} className="text-teal-500" />
                15 Jan – 16 Jan
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Scope Notes</p>
          <div className="flex-grow bg-slate-50 border border-slate-100 p-8 rounded-[2rem] relative">
            <FileText size={48} className="absolute bottom-6 right-6 text-slate-200/50" />
            <p className="text-base text-slate-600 leading-relaxed font-medium italic">
              "{request?.scope_notes || 'No scope notes provided.'}"
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-100 mb-10 overflow-x-auto no-scrollbar">
        {[
          { id: 'bids', label: `Bids (${filteredBids.length})`, icon: <FileText size={18} /> },
          { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
          { id: 'activity', label: 'Activity', icon: <Activity size={18} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 px-10 py-5 text-sm font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Rendering */}
      <AnimatePresence mode="wait">
        {activeTab === 'bids' && (
          <motion.div
            key="bids-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Bid Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 zen-shadow">
              <div className="flex items-center gap-2 px-3 text-slate-400 border-r border-slate-100 mr-2">
                <Filter size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
              </div>

              <Dropdown
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="min-w-[140px] text-xs py-2 bg-slate-50/50 border-none rounded-xl"
              >
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </Dropdown>

              <Dropdown className="min-w-[180px] text-xs py-2 bg-slate-50/50 border-none rounded-xl">
                <option>Earliest Availability</option>
                <option>Flexible Timing</option>
              </Dropdown>

              <Dropdown
                value={filterMinRating}
                onChange={(e) => setFilterMinRating(e.target.value)}
                className="min-w-[120px] text-xs py-2 bg-slate-50/50 border-none rounded-xl"
              >
                <option value="0">Any Rating</option>
                <option value="4.5">★ 4.5+</option>
                <option value="4.8">★ 4.8+</option>
              </Dropdown>

              <div
                className="flex items-center gap-3 px-5 py-2.5 bg-teal-50/30 border border-teal-100 rounded-xl cursor-pointer hover:bg-teal-50 transition-colors ml-auto"
                onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
              >
                <input
                  type="checkbox"
                  checked={filterVerifiedOnly}
                  onChange={() => { }} // Controlled by div click
                  id="verified-only"
                  className="w-4 h-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500 bg-white"
                />
                <label htmlFor="verified-only" className="text-[10px] font-black text-teal-700 uppercase tracking-widest cursor-pointer">Verified only</label>
              </div>
            </div>

            {/* Bids Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredBids.map((bid) => (
                <motion.div
                  key={bid.id}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedBidId(bid.id)}
                  className={`group relative bg-white rounded-[3rem] border-2 p-10 transition-all duration-500 cursor-pointer zen-shadow ${selectedBidId === bid.id
                    ? 'border-teal-500 bg-teal-50/5 ring-4 ring-teal-500/5 shadow-2xl shadow-teal-500/10'
                    : 'border-slate-50 hover:border-teal-100 hover:bg-slate-50/30'
                    }`}
                >
                  <div className="flex items-start justify-between mb-10">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl transition-all duration-500 group-hover:scale-105">
                          <img src={bid.avatar} alt={bid.expertName} className="w-full h-full object-cover" />
                        </div>
                        {bid.isVerified && (
                          <div className="absolute -top-2 -right-2 bg-teal-500 text-white p-1.5 rounded-xl border-4 border-white shadow-xl">
                            <ShieldCheck size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <h4 className="text-2xl font-black text-slate-900 font-display">{bid.expertName}</h4>
                          {bid.isVerified && <Badge variant="teal">VERIFIED</Badge>}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100/50">
                            <Star size={14} fill="currentColor" />
                            <span className="text-sm font-black ml-1">{bid.rating}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bid.reviewsCount} reviews</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bid</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">{bid.amount}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Calendar size={12} className="text-teal-500" /> Proposed Schedule
                      </p>
                      <p className="text-base font-bold text-slate-700">{bid.schedule}</p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deliverables</p>
                      <div className="flex flex-wrap gap-2.5">
                        {bid.deliverables.map((item, i) => (
                          <span key={i} className="px-4 py-2 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] flex items-center gap-2 group-hover:border-teal-200 group-hover:text-teal-700 transition-colors">
                            <CheckCircle2 size={14} className="text-teal-500" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-10 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="px-6 py-2.5 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 hover:text-teal-600 hover:border-teal-200 hover:bg-white transition-all uppercase tracking-widest flex items-center gap-2">
                        View Profile
                      </button>
                      <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 hover:bg-white transition-all">
                        <Copy size={18} />
                      </button>
                    </div>

                    <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${selectedBidId === bid.id ? 'border-teal-500 bg-teal-500 text-white shadow-xl shadow-teal-500/30' : 'border-slate-100 bg-slate-50 group-hover:border-teal-300'
                      }`}>
                      {selectedBidId === bid.id ? <CheckCircle2 size={24} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <motion.div
            key="messages-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 zen-shadow border-dashed"
          >
            <div className="w-20 h-20 bg-teal-50 rounded-[2rem] flex items-center justify-center text-teal-600 mb-6">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 font-display">No messages yet</h3>
            <p className="text-slate-500 font-medium mb-8">Direct messaging will be enabled once a bid is shortlisted.</p>
            <Button variant="outline" className="px-8 py-3 border-slate-200 text-slate-500 uppercase tracking-widest text-xs font-black">
              Start a discussion
            </Button>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {[
              { type: 'BID', user: 'Amit P', action: 'placed a bid of ₹13,500', time: '2 hours ago', icon: <FileText size={16} /> },
              { type: 'BID', user: 'Sneha K', action: 'placed a bid of ₹15,200', time: '4 hours ago', icon: <FileText size={16} /> },
              { type: 'SYSTEM', user: 'Platform', action: 'Verified Expert "Vikram M" joined the request', time: 'Yesterday', icon: <ShieldCheck size={16} /> },
              { type: 'UPDATE', user: 'You', action: 'updated the preferred window', time: '2 days ago', icon: <History size={16} /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-[2rem] zen-shadow hover:bg-slate-50/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  {item.icon}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-slate-900">
                    <span className="text-teal-600">{item.user}</span> {item.action}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.time}</p>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Bar at the very bottom */}
      <div className="mt-12 bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6 text-center sm:text-left">
            {selectedBidId ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-3 mb-1.5 justify-center sm:justify-start">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <p className="text-xs font-black text-teal-400 uppercase tracking-[0.2em]">Ready to Award</p>
                </div>
                <div className="flex items-center gap-5 justify-center sm:justify-start">
                  <span className="text-2xl font-black text-white font-display tracking-tight">{selectedExpert?.expertName}</span>
                  <div className="h-6 w-px bg-white/10" />
                  <span className="text-2xl font-black text-teal-400 tracking-tighter">{selectedExpert?.amount}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-slate-400 px-2">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                  <AlertCircle size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-200">Selection Pending</p>
                  <p className="text-xs font-medium text-slate-500">Please choose an expert bid to proceed.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-10 py-5 text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-[0.3em] border border-white/10 rounded-2xl">
              Close Bidding
            </button>
            <Button
              disabled={!selectedBidId}
              onClick={() => setShowAwardModal(true)}
              className="flex-1 sm:flex-none px-14 py-6 rounded-[1.75rem] bg-teal-500 hover:bg-teal-400 text-slate-900 font-black shadow-2xl shadow-teal-500/20 disabled:opacity-20 disabled:grayscale disabled:hover:scale-100 disabled:cursor-not-allowed text-lg font-display transition-all duration-500"
            >
              Award Expert <ArrowRight size={22} className="ml-3" />
            </Button>
          </div>
        </div>
      </div>

      {selectedExpert && (
        <AwardBookingModal
          isOpen={showAwardModal}
          onClose={() => setShowAwardModal(false)}
          onConfirm={handleConfirmAward}
          isSubmitting={isAwarding}
          expert={{
            name: selectedExpert.expertName,
            rating: selectedExpert.rating,
            amount: selectedExpert.amount,
            schedule: selectedExpert.schedule,
            deliverables: selectedExpert.deliverables,
            isVerified: selectedExpert.isVerified
          }}
        />
      )}
    </div>
  );
};
