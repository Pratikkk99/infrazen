
import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, User, ExternalLink, ArrowLeft } from 'lucide-react';
import { Dropdown } from './components/Dropdown';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { ExpertReviewScreen } from './ExpertReviewScreen';
import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

interface Expert {
  id: string;
  name: string;
  experience: string;
  services: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
  email: string;
  joinedDate: string;
}

interface ExpertsVerificationProps {
  onBack?: () => void;
}

export const ExpertsVerification: React.FC<ExpertsVerificationProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [experts, setExperts] = useState<Expert[]>([]);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const data = await apiClient.get('/admin/experts');
        setExperts(data.map((e: any) => ({
          id: e.expert_id.toString(),
          name: e.app_users_expert_profiles_user_idToapp_users?.full_name || 'Expert',
          experience: e.experience_years ? `${e.experience_years} Years` : 'New',
          services: e.expert_services?.map((s: any) => s.service_category) || [],
          status: e.verification_status === 'APPROVED' ? 'Approved' : e.verification_status === 'REJECTED' ? 'Rejected' : 'Pending',
          email: e.app_users_expert_profiles_user_idToapp_users?.email || '-',
          joinedDate: e.last_update_dt ? new Date(e.last_update_dt).toLocaleDateString() : '-'
        })));
      } catch (error) {
        showToast.error("Failed to load experts");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperts();
  }, []);

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

  const handleUpdateStatus = (id: string, status: Expert['status'], notes: string) => {
    const apiStatus = status === 'Approved' ? 'APPROVED' : status === 'Rejected' ? 'REJECTED' : 'PENDING';
    apiClient.post(`/admin/experts/${id}/verify`, { status: apiStatus })
      .then(() => {
        setExperts(prev => prev.map(e => e.id === id ? { ...e, status } : e));
        showToast.success(`Expert status updated to ${status}`);
        setSelectedExpert(null);
      })
      .catch(() => showToast.error("Failed to update status"));
  };

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || expert.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || expert.services.some(s => s === categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadgeVariant = (status: Expert['status']) => {
    switch (status) {
      case 'Approved': return 'teal';
      case 'Pending': return 'blue';
      case 'Rejected': return 'red';
      default: return 'slate';
    }
  };

  const categories = Array.from(new Set(experts.flatMap(e => e.services)));

  if (selectedExpert) {
    return (
      <ExpertReviewScreen
        expert={selectedExpert}
        onBack={() => setSelectedExpert(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    );
  }

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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Expert Verification</h2>
          <p className="text-slate-500 text-sm font-medium">Review and approve auditors before they join the platform.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-3xl border border-slate-100 zen-shadow">
        <div className="flex-grow min-w-[240px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Search Experts</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Name or email..."
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
          className="w-40"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </Dropdown>

        <Dropdown
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-48"
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
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
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Expert</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Experience</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Services</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExperts.map((expert) => (
                  <tr key={expert.id} className="group hover:bg-teal-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:text-teal-600 transition-all zen-shadow border border-transparent group-hover:border-teal-100">
                          <User size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none">{expert.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{expert.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">{expert.experience}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {expert.services.map(service => (
                          <span key={service} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {service}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(expert.status)}>{expert.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4 py-1.5 text-xs font-bold border-slate-200 hover:border-teal-600 hover:text-teal-600 bg-white"
                        onClick={() => handleAction(`Review Expert: ${expert.name}`, () => setSelectedExpert(expert))}
                        loading={isSubmitting}
                      >
                        <ExternalLink size={14} className="mr-1.5" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredExperts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="inline-flex flex-col items-center">
                        <ShieldCheck size={40} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 text-sm font-medium">No experts found matching these criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
