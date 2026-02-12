
import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  Zap,
  Sun,
  Droplets,
  Wind,
  ClipboardCheck,
  ArrowRight,
  IndianRupee,
  Navigation,
  CheckSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Dropdown } from './components/Dropdown';

export interface OpenRequest {
  id: string;
  target: string;
  city: string;
  category: string;
  closesIn: string;
  isUrgent: boolean;
  budget: string;
  distance: string;
}

import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';
interface ExpertRequestsListScreenProps {
  onViewDetail: (req: OpenRequest) => void;
}

export const ExpertRequestsListScreen: React.FC<ExpertRequestsListScreenProps> = ({ onViewDetail }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState('All');
  const [closingSoon, setClosingSoon] = useState(false);
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

  const [requests, setRequests] = useState<OpenRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await apiClient.get('/market/requests');
        setRequests(data.map((r: any) => ({
          id: r.request_id.toString(),
          target: r.org_sites?.site_name || 'Generic Site',
          city: r.org_sites?.city || '-',
          category: r.service_category,
          closesIn: r.bidding_close_dt ? new Date(r.bidding_close_dt).toLocaleDateString() : 'N/A',
          isUrgent: r.request_status === 'PUBLISHED', // Logic for urgency can be refined
          budget: r.budget_hint ? `₹${parseFloat(r.budget_hint).toLocaleString()}` : '--',
          distance: '5 km' // Mocked for now
        })));
      } catch (error) {
        showToast.error("Failed to load marketplace");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getCategoryIcon = (cat: OpenRequest['category']) => {
    switch (cat) {
      case 'ELECTRICAL': return <Zap size={14} />;
      case 'SOLAR': return <Sun size={14} />;
      case 'PLUMBING': return <Droplets size={14} />;
      case 'IAQ': return <Wind size={14} />;
      case 'SNAGGING': return <ClipboardCheck size={14} />;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.id.includes(searchQuery) || req.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || req.category === categoryFilter;
    const matchesUrgency = !closingSoon || req.isUrgent;
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Requests (Bidding Open)</h1>
        <p className="text-lg text-slate-500 font-medium">Browse open audit requests near you and submit bids before they close.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 zen-shadow flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-grow w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search ReqID or Target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 text-sm font-medium transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <Dropdown
            className="min-w-[160px] bg-white"
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
            className="min-w-[140px] bg-white"
            value={distanceFilter}
            onChange={(e) => setDistanceFilter(e.target.value)}
          >
            <option value="All">Any Distance</option>
            <option value="5">Within 5 km</option>
            <option value="15">Within 15 km</option>
            <option value="50">Within 50 km</option>
          </Dropdown>

          <div
            onClick={() => setClosingSoon(!closingSoon)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all cursor-pointer select-none ${closingSoon ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
          >
            <CheckSquare size={18} className={closingSoon ? 'text-teal-600' : 'text-slate-200'} />
            <span className="text-xs font-black uppercase tracking-widest">Closing Soon</span>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ReqID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Target / Site</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">City</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Closes In</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Budget Hint</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-teal-600 uppercase tracking-widest">#{req.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-teal-800 transition-colors">{req.target}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                        <Navigation size={10} className="text-slate-300" /> {req.distance} away
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <MapPin size={14} className="text-slate-300" />
                      {req.city}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {getCategoryIcon(req.category as any)}
                      {req.category}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-2 text-sm font-mono font-bold ${req.isUrgent ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                      <Clock size={14} className={req.isUrgent ? 'text-red-500' : 'text-teal-500'} />
                      {req.closesIn}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-700">
                    {req.budget}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button
                      variant="outline"
                      className="px-8 py-2 border-teal-100 text-teal-600 hover:bg-teal-50 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                      onClick={() => handleAction(`View Details: ${req.id}`, () => onViewDetail(req))}
                      loading={isSubmitting}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="inline-flex flex-col items-center">
                      <Navigation size={48} className="text-slate-100 mb-4" />
                      <p className="text-slate-400 font-medium">No open requests match your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
