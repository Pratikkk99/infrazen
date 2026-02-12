
import React, { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink, Building2, MapPin, Users as UsersIcon, ArrowLeft } from 'lucide-react';
import { Dropdown } from './components/Dropdown';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

interface Organization {
  id: string;
  name: string;
  type: string;
  city: string;
  sitesCount: number;
  membersCount: number;
}

interface OrganizationsManagementProps {
  onBack?: () => void;
  onView?: (orgId: string) => void;
}

export const OrganizationsManagement: React.FC<OrganizationsManagementProps> = ({ onBack, onView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data = await apiClient.get('/admin/organizations');
        setOrganizations(data.map((o: any) => ({
          id: o.org_id.toString(),
          name: o.org_name,
          type: o.org_type,
          city: o.city || 'N/A',
          sitesCount: o.org_sites?.length || 0,
          membersCount: o.organization_members?.length || 0
        })));
      } catch (error) {
        showToast.error("Failed to load organizations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  const handleAction = async (action: string, callback?: () => void) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/support/ticket', { action });
      if (callback) callback();
    } catch (error: any) {
      showToast.error(error.message || "Action failed — try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || org.type === typeFilter;
    const matchesCity = cityFilter === 'All' || org.city === cityFilter;
    return matchesSearch && matchesType && matchesCity;
  });

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'RESIDENTIAL': return 'blue';
      case 'BUSINESS': return 'slate';
      default: return 'teal';
    }
  };

  const uniqueCities = Array.from(new Set(organizations.map(o => o.city)));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Organizations</h2>
            <p className="text-slate-500 text-sm font-medium">View and manage societies, businesses, and registered entities.</p>
          </div>
        </div>

        <Button
          variant="primary"
          className="flex items-center gap-2 px-6 py-3 shadow-lg shadow-teal-500/10"
          onClick={() => handleAction("Add Organization", () => showToast.success("New registration form opened"))}
          loading={isSubmitting}
        >
          <Plus size={18} />
          Add Organization
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-3xl border border-slate-100 zen-shadow">
        <div className="flex-grow min-w-[240px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Search Organizations</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 text-sm transition-all"
            />
          </div>
        </div>

        <Dropdown
          label="Organization Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-48"
        >
          <option value="All">All Types</option>
          <option value="RESIDENTIAL">Residential</option>
          <option value="BUSINESS">Business</option>
          <option value="OTHER">Other</option>
        </Dropdown>

        <Dropdown
          label="City"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="w-36"
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
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Organization</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">City</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Sites</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Members</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="group hover:bg-teal-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:text-teal-600 transition-all zen-shadow border border-transparent group-hover:border-teal-100">
                          <Building2 size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" />
                        </div>
                        <span className="font-semibold text-slate-900">{org.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getTypeBadgeVariant(org.type)}>{org.type}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin size={12} className="text-slate-300" />
                        {org.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{org.sitesCount}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-slate-500 font-medium">
                        <UsersIcon size={14} className="text-slate-300" />
                        {org.membersCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4 py-1.5 text-xs font-bold border-slate-200 hover:border-teal-600 hover:text-teal-600 bg-white"
                        onClick={() => onView ? onView(org.id) : handleAction(`View Organization: ${org.name}`)}
                        loading={isSubmitting}
                      >
                        <ExternalLink size={14} className="mr-1.5" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-5 border-t border-slate-50 flex items-center justify-between bg-white">
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            Showing {filteredOrgs.length} of {organizations.length} Entities
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 text-[10px] font-bold text-slate-400 border border-slate-100 rounded-xl cursor-not-allowed uppercase tracking-widest">Prev</button>
            <button className="px-4 py-1.5 text-[10px] font-bold text-teal-600 border border-teal-100 rounded-xl bg-teal-50/50 uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
