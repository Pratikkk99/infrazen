
import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Clock,
  Eye,
  Zap,
  Droplets,
  Sun,
  Wind,
  ClipboardCheck,
  MapPin,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  /* Added missing icon import */
  GitPullRequest
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Dropdown } from './components/Dropdown';

interface AuditRequest {
  id: string;
  title: string;
  category: string;
  status: string;
  bids: number;
  closesIn: string;
  city: string;
}

interface OrgRequestsListScreenProps {
  requests: AuditRequest[];
  onCreateRequest: () => void;
  onViewRequest: (request: AuditRequest) => void;
}

import { simulateAction, showToast } from './utils/demo';

export const OrgRequestsListScreen: React.FC<OrgRequestsListScreenProps> = ({ requests, onCreateRequest, onViewRequest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
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

  const getCategoryIcon = (category: AuditRequest['category']) => {
    switch (category) {
      case 'ELECTRICAL': return <Zap size={14} />;
      case 'PLUMBING': return <Droplets size={14} />;
      case 'SOLAR': return <Sun size={14} />;
      case 'IAQ': return <Wind size={14} />;
      case 'SNAGGING': return <ClipboardCheck size={14} />;
    }
  };

  const getStatusVariant = (status: AuditRequest['status']): 'teal' | 'blue' | 'slate' | 'red' => {
    switch (status) {
      case 'BIDDING_OPEN': return 'teal';
      case 'AWARDED': return 'blue';
      case 'CLOSED': return 'slate';
      case 'CANCELLED': return 'red';
      default: return 'slate';
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.id.includes(searchQuery) || req.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || req.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const uniqueSites = Array.from(new Set(requests.map(r => r.city)));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Requests</h1>
          <p className="text-lg text-slate-500 font-medium">Track your audit requests, bidding status, and expert responses.</p>
        </div>
        <Button
          variant="primary"
          className="px-8 py-4 rounded-2xl font-display shadow-2xl shadow-teal-500/20"
          onClick={() => handleAction("Create Request", () => {
            showToast.success("Request creation form opened");
            onCreateRequest();
          })}
          loading={isSubmitting}
        >
          <Plus size={20} className="mr-2" /> Create Request
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 zen-shadow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Search ReqID / Site</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="e.g. 104 or Plant 1"
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
              <option value="BIDDING_OPEN">Bidding Open</option>
              <option value="AWARDED">Awarded</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </Dropdown>
          </div>

          <div className="md:col-span-3">
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

          <div className="md:col-span-2">
            <div className="p-3 bg-slate-50/30 border border-slate-100 rounded-xl flex items-center justify-center h-[50px]">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global Market</span>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table Container */}
      <div className="bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ReqID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Site</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Bids</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Closes In</th>
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
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-300" />
                      <span className="font-bold text-slate-900">{req.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {getCategoryIcon(req.category as any)}
                      {req.category}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={getStatusVariant(req.status as any)}>
                      {req.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-xs font-bold text-slate-700 group-hover:bg-white group-hover:text-teal-600 group-hover:shadow-sm transition-all">
                      {req.bids}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-600">
                      {req.closesIn !== '--' && <Clock size={14} className="text-teal-500" />}
                      {req.closesIn}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-6 py-2 border-teal-100 text-teal-600 hover:bg-teal-50 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                      onClick={() => handleAction(`View Request: ${req.id}`, () => onViewRequest(req))}
                      loading={isSubmitting}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-50">
          {filteredRequests.map((req) => (
            <div key={req.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">REQ #{req.id}</p>
                  <h3 className="text-lg font-bold text-slate-900">{req.title}</h3>
                </div>
                <Badge variant={getStatusVariant(req.status)}>
                  {req.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    {getCategoryIcon(req.category)}
                    {req.category}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bids</p>
                  <p className="text-sm font-bold text-slate-700">{req.bids} received</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Closes In</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Clock size={14} className="text-teal-500" /> {req.closesIn}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full py-3.5 border-teal-100 text-teal-600 font-bold uppercase tracking-widest text-xs"
                onClick={() => handleAction(`View Request: ${req.id}`, () => onViewRequest(req))}
                loading={isSubmitting}
              >
                View Request Details
              </Button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <GitPullRequest size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No requests found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              We couldn't find any requests matching your filters. Try adjusting them or create a new request.
            </p>
            <Button variant="primary" onClick={() => handleAction("Create First Request", onCreateRequest)} loading={isSubmitting}>
              <Plus size={18} className="mr-2" /> Create First Request
            </Button>
          </div>
        )}
      </div>

      {/* Footer / Sorting Hint */}
      <div className="flex items-center justify-between pt-4 px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Sorted by: Closest Deadline
        </p>
        <div className="flex gap-4">
          <button className="text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest">Previous</button>
          <button className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest">Next</button>
        </div>
      </div>
    </div>
  );
};
