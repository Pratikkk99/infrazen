
import React, { useState } from 'react';
import {
  FileText,
  Search,
  Zap,
  Sun,
  Droplets,
  Wind,
  ClipboardCheck,
  ArrowRight,
  MoreVertical,
  History,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Dropdown } from './components/Dropdown';
import { ConfirmationModal } from './components/ConfirmationModal';
import { simulateAction, showToast } from './utils/demo';

export interface MyBid {
  id: string;
  reqId: string;
  category: 'ELECTRICAL' | 'SOLAR' | 'PLUMBING' | 'IAQ' | 'SNAGGING';
  amount: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  submittedDate: string;
  siteName: string;
}

interface ExpertBidsScreenProps {
  onRevise: (bid: MyBid) => void;
  onViewBooking: (bid: MyBid) => void;
}


import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';

export const ExpertBidsScreen: React.FC<ExpertBidsScreenProps> = ({ onRevise, onViewBooking }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [bidToRemove, setBidToRemove] = useState<MyBid | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bids, setBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const bidsData = await apiClient.get('/expert/me/bids');
        setBids(bidsData.map((b: any) => ({
          id: b.bid_id.toString(),
          reqId: b.request_id.toString(),
          category: b.service_requests_expert_bids_request_idToservice_requests.service_category,
          amount: `₹${parseFloat(b.bid_amount).toLocaleString()}`,
          status: b.bid_status,
          submittedDate: new Date(b.created_dt).toLocaleDateString(),
          siteName: b.service_requests_expert_bids_request_idToservice_requests.org_sites?.site_name || 'Site'
        })));
      } catch (error) {
        showToast.error("Failed to load bids");
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const getCategoryIcon = (cat: MyBid['category']) => {
    switch (cat) {
      case 'ELECTRICAL': return <Zap size={14} />;
      case 'SOLAR': return <Sun size={14} />;
      case 'PLUMBING': return <Droplets size={14} />;
      case 'IAQ': return <Wind size={14} />;
      case 'SNAGGING': return <ClipboardCheck size={14} />;
    }
  };

  const getStatusBadge = (status: MyBid['status']) => {
    switch (status) {
      case 'SUBMITTED': return <Badge variant="blue">SUBMITTED</Badge>;
      case 'ACCEPTED': return <Badge variant="teal">ACCEPTED</Badge>;
      case 'REJECTED': return <Badge variant="red">REJECTED</Badge>;
      case 'WITHDRAWN': return <Badge variant="slate">WITHDRAWN</Badge>;
    }
  };

  const filteredBids = bids.filter(bid => {
    const matchesSearch = bid.reqId.includes(searchQuery) || bid.siteName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || bid.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleWithdraw = async () => {
    if (!bidToRemove) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(`/api/bids/${bidToRemove.id}/withdraw`, {});
      setBids(prev => prev.map(b => b.id === bidToRemove.id ? { ...b, status: 'WITHDRAWN' } : b));
      showToast.success("Bid withdrawn successfully");
      setBidToRemove(null);
    } catch (error: any) {
      showToast.error(error.message || "Failed to withdraw bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">My Bids</h1>
        <p className="text-lg text-slate-500 font-medium">Track your submitted bids and booking outcomes.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 zen-shadow flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-grow w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by ReqID or Site Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 text-sm font-medium transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Dropdown
            className="min-w-[180px] bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </Dropdown>

          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest">
            <History size={14} /> {filteredBids.length} Bids
          </div>
        </div>
      </div>

      {/* Bids Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ReqID / Site</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Submitted</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBids.map((bid) => (
                <tr key={bid.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-teal-600 uppercase tracking-widest mb-0.5">#{bid.reqId}</span>
                      <span className="font-bold text-slate-900 group-hover:text-teal-800 transition-colors">{bid.siteName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {getCategoryIcon(bid.category)}
                      {bid.category}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-lg font-black text-slate-900 tracking-tight">{bid.amount}</span>
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(bid.status)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Clock size={12} className="text-slate-300" />
                      {bid.submittedDate}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      {bid.status === 'SUBMITTED' && (
                        <>
                          <Button
                            variant="outline"
                            className="px-5 py-2 border-teal-100 text-teal-600 hover:bg-teal-50 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                            onClick={() => onRevise(bid)}
                          >
                            <Edit3 size={14} className="mr-2" /> Revise
                          </Button>
                          <button
                            onClick={() => setBidToRemove(bid)}
                            className="p-2.5 rounded-xl border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 transition-all"
                            title="Withdraw Bid"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}

                      {bid.status === 'ACCEPTED' && (
                        <Button
                          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-teal-600/10"
                          onClick={() => onViewBooking(bid)}
                        >
                          <Calendar size={14} className="mr-2" /> View Booking
                        </Button>
                      )}

                      {bid.status === 'REJECTED' && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-50/50 px-3 py-1.5 rounded-lg border border-red-100">
                          <XCircle size={12} /> Closed
                        </div>
                      )}

                      {bid.status === 'WITHDRAWN' && (
                        <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-widest transition-colors group/rewrap">
                          <RotateCcw size={12} className="group-hover/rewrap:rotate-[-45deg] transition-transform" /> Re-bid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBids.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="inline-flex flex-col items-center">
                      <FileText size={48} className="text-slate-100 mb-4" />
                      <p className="text-slate-400 font-medium italic">"No bids found matching your filters."</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 zen-shadow flex items-center gap-6">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acceptance Rate</p>
            <p className="text-2xl font-black text-slate-900">42%</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 zen-shadow flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Response Time</p>
            <p className="text-2xl font-black text-slate-900">4.2h</p>
          </div>
        </div>
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl flex items-center gap-6 group overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-teal-400 border border-white/10 group-hover:scale-110 transition-transform">
            <Zap size={28} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Pipeline</p>
            <p className="text-2xl font-black text-white tracking-tighter">₹42,000</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Withdrawal */}
      <ConfirmationModal
        isOpen={!!bidToRemove}
        onClose={() => setBidToRemove(null)}
        onConfirm={handleWithdraw}
        type="reject"
        title="Withdraw Bid"
        message={`Are you sure you want to withdraw your bid of ${bidToRemove?.amount} for Req #${bidToRemove?.reqId}? This action will remove your proposal from the client's queue.`}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
