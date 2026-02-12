
import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  GitPullRequest,
  Clock,
  CheckCircle2,
  Users,
  MapPin,
  Building2,
  Zap,
  Sun,
  Droplets,
  X,
  Filter,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Dropdown } from './components/Dropdown';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

interface Bid {
  id: string;
  expertName: string;
  amount: string;
  time: string;
  rating: number;
}

interface Request {
  id: string;
  customer: string;
  target: string;
  category: string;
  status: string;
  bidsCount: number;
  city: string;
  description: string;
  bids: Bid[];
}

interface RequestsManagementProps {
  onBack?: () => void;
}

export const RequestsManagement: React.FC<RequestsManagementProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);
  const [loadingBidId, setLoadingBidId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await apiClient.get('/admin/requests');
        setRequests(data.map((r: any) => ({
          id: r.request_id.toString(),
          customer: r.organizations?.org_name || 'N/A',
          target: r.org_sites?.site_name || 'N/A',
          category: r.service_category,
          status: r.request_status,
          bidsCount: r.expert_bids_expert_bids_request_idToservice_requests?.length || 0,
          city: r.org_sites?.city || '-',
          description: r.scope_notes || '',
          bids: r.expert_bids_expert_bids_request_idToservice_requests?.map((b: any) => ({
            id: b.bid_id.toString(),
            expertName: b.expert_profiles?.app_users_expert_profiles_user_idToapp_users?.full_name || 'Expert',
            amount: `₹${b.bid_amount}`,
            time: b.last_update_dt ? new Date(b.last_update_dt).toLocaleDateString() : '-',
            rating: 4.5
          })) || []
        })));
      } catch (error) {
        showToast.error("Failed to load requests");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleViewRequest = async (req: Request) => {
    setSelectedRequest(req);
  };

  const handleAssignExpert = async (bid: Bid) => {
    if (!selectedRequest) return;
    setLoadingBidId(bid.id);
    try {
      await apiClient.post(`/requests/${selectedRequest.id}/award`, { bidId: parseInt(bid.id) });
      showToast.success(`Expert ${bid.expertName} assigned successfully`);
      setSelectedRequest(null);
      // Refresh list
      window.location.reload();
    } catch (error) {
      showToast.error("Failed to assign expert");
    } finally {
      setLoadingBidId(null);
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/api/bookings/${selectedRequest.id}/cancel`, { reason: 'Cancelled by Admin' }); // Reusing cancel endpoint or similar
      showToast.success("Request cancelled successfully");
      setSelectedRequest(null);
      // Refresh logic would be good
    } catch (error: any) {
      showToast.error(error.message || "Failed to cancel request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.id.includes(searchQuery) ||
      req.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || req.category === categoryFilter;
    const matchesCity = cityFilter === 'All' || req.city === cityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesCity;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ELECTRICAL': return <Zap size={14} />;
      case 'SOLAR': return <Sun size={14} />;
      case 'PLUMBING': return <Droplets size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusVariant = (status: string): 'teal' | 'slate' | 'red' | 'blue' => {
    switch (status) {
      case 'BIDDING_OPEN': return 'teal';
      case 'ASSIGNED': return 'blue';
      case 'COMPLETED': return 'slate';
      case 'CANCELLED': return 'red';
      default: return 'slate';
    }
  };

  const uniqueCities = Array.from(new Set(requests.map(r => r.city)));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-teal-600 rounded-[1.25rem] transition-all border border-slate-100 zen-shadow group"
          >
            <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Requests</h2>
          <p className="text-slate-500 text-sm font-medium">Monitor audit requests and expert bidding activity.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-3xl border border-slate-100 zen-shadow">
        <div className="flex-grow min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Search Requests</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="ReqID or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 text-sm transition-all"
            />
          </div>
        </div>

        <Dropdown
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-44"
        >
          <option value="All">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="AWARDED">Awarded</option>
          <option value="CANCELLED">Cancelled</option>
        </Dropdown>

        <Dropdown
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-40"
        >
          <option value="All">All Categories</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="SOLAR">Solar</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="STP">STP</option>
          <option value="SNAGLIST">Snagging</option>
        </Dropdown>

        <Dropdown
          label="City"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="w-32"
        >
          <option value="All">All Cities</option>
          {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
        </Dropdown>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 zen-shadow overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ReqID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Customer / Target</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Bids</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="group hover:bg-teal-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400">#{req.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 leading-tight">{req.customer}</span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                          <MapPin size={10} /> {req.target} ({req.city})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600">
                        {getCategoryIcon(req.category)}
                        {req.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(req.status)}>{req.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-xs font-bold text-slate-600 group-hover:bg-white group-hover:text-teal-600 transition-all zen-shadow border border-transparent group-hover:border-teal-100">
                        {req.bidsCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4 py-1.5 text-xs font-bold border-slate-200 hover:border-teal-600 hover:text-teal-600 bg-white"
                        onClick={() => handleViewRequest(req)}
                        loading={loadingRequestId === req.id}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedRequest(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] zen-shadow overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={getStatusVariant(selectedRequest.status)}>{selectedRequest.status.replace('_', ' ')}</Badge>
                    <span className="text-sm font-bold text-slate-300 tracking-widest uppercase">Request #{selectedRequest.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedRequest.customer} — {selectedRequest.target}</h3>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X size={24} className="text-slate-300" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Requirement Description</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {selectedRequest.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expert Bids ({selectedRequest.bids.length})</h4>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Available Bids</span>
                  </div>

                  {selectedRequest.bids.length > 0 ? (
                    <div className="space-y-3">
                      {selectedRequest.bids.map((bid) => (
                        <div key={bid.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-teal-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <Users size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{bid.expertName}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Rating: {bid.rating} ★ • {bid.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-slate-900">{bid.amount}</span>
                            <Button
                              size="sm"
                              className="px-4 py-2 text-xs font-bold bg-teal-600"
                              onClick={() => handleAssignExpert(bid)}
                              loading={loadingBidId === bid.id}
                            >
                              Assign <ArrowRight size={12} className="ml-1.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <Clock size={32} className="text-slate-200 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Waiting for Expert Bids</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-8 mt-8 border-t border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Building2 size={14} /> Organization Verified
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="px-6 py-3 border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 font-bold text-xs uppercase tracking-widest"
                  onClick={handleCancelRequest}
                  loading={isSubmitting}
                >
                  Cancel Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
