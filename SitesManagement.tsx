
import React, { useState } from 'react';
import { Search, Plus, ExternalLink, MapPin, Building2, Factory, Home, Landmark, ArrowLeft } from 'lucide-react';
import { Dropdown } from './components/Dropdown';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';

interface Site {
  id: string;
  name: string;
  orgName: string;
  type: 'Industrial Plant' | 'Residential Society' | 'Commercial Office' | 'Individual Villa';
  city: string;
}

interface SitesManagementProps {
  onBack?: () => void;
}

export const SitesManagement: React.FC<SitesManagementProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [orgFilter, setOrgFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSiteId, setLoadingSiteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const data = await apiClient.get('/admin/sites');
        setSites(data.map((s: any) => ({
          id: s.site_id.toString(),
          name: s.site_name,
          orgName: s.organizations?.org_name || 'N/A',
          type: s.site_type,
          city: s.city || 'N/A'
        })));
      } catch (error) {
        showToast.error("Failed to load sites");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSites();
  }, []);

  const handleAddSite = async () => {
    showToast.success("Please add sites via Organization dashboard.");
  };

  const handleViewSite = async (site: Site) => {
    setLoadingSiteId(site.id);
    try {
      showToast.success(`Details for ${site.name} loaded`);
      // Future: Navigate to site detail
    } catch (error) {
      showToast.error("Failed to load site details");
    } finally {
      setLoadingSiteId(null);
    }
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.orgName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || site.type === typeFilter;
    const matchesCity = cityFilter === 'All' || site.city === cityFilter;
    const matchesOrg = orgFilter === 'All' || site.orgName === orgFilter;
    return matchesSearch && matchesType && matchesCity && matchesOrg;
  });

  const getSiteIcon = (type: Site['type']) => {
    switch (type) {
      case 'Industrial Plant': return <Factory size={18} />;
      case 'Residential Society': return <Landmark size={18} />;
      case 'Commercial Office': return <Building2 size={18} />;
      case 'Individual Villa': return <Home size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  const getTypeBadgeVariant = (type: Site['type']) => {
    switch (type) {
      case 'Commercial Office': return 'teal';
      case 'Residential Society': return 'blue';
      case 'Industrial Plant': return 'slate';
      case 'Individual Villa': return 'slate';
      default: return 'slate';
    }
  };

  const uniqueOrgs = Array.from(new Set(sites.map(s => s.orgName)));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
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
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sites / Facilities</h2>
            <p className="text-slate-500 text-sm font-medium">Manage audit locations across organizations and societies.</p>
          </div>
        </div>

        <Button
          variant="primary"
          className="flex items-center gap-2 px-6 py-3 shadow-lg shadow-teal-500/10"
          onClick={handleAddSite}
          loading={isSubmitting}
        >
          <Plus size={18} />
          Add Site / Facility
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-3xl border border-slate-100 zen-shadow">
        <div className="flex-grow min-w-[240px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Search Sites</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search site or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 text-sm transition-all"
            />
          </div>
        </div>

        <Dropdown
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-44"
        >
          <option value="All">All Types</option>
          <option value="Industrial Plant">Industrial Plant</option>
          <option value="Residential Society">Residential Soc</option>
          <option value="Commercial Office">Commercial Office</option>
          <option value="Individual Villa">Individual Villa</option>
        </Dropdown>

        <Dropdown
          label="Organization"
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="w-48"
        >
          <option value="All">All Organizations</option>
          {uniqueOrgs.map(org => (
            <option key={org} value={org}>{org}</option>
          ))}
        </Dropdown>

        <Dropdown
          label="City"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="w-32"
        >
          <option value="All">All Cities</option>
          <option value="Pune">Pune</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
        </Dropdown>
      </div>

      {/* Sites Table */}
      <div className="bg-white rounded-3xl border border-slate-100 zen-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Site Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Organization</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">City</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSites.map((site) => (
                <tr key={site.id} className="group hover:bg-teal-50/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:text-teal-600 transition-all zen-shadow border border-transparent group-hover:border-teal-100">
                        {getSiteIcon(site.type)}
                      </div>
                      <span className="font-semibold text-slate-900">{site.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600">{site.orgName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getTypeBadgeVariant(site.type)}>{site.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {site.city}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4 py-1.5 text-xs font-bold border-slate-200 hover:border-teal-600 hover:text-teal-600 bg-white"
                        onClick={() => handleViewSite(site)}
                        loading={loadingSiteId === site.id}
                      >
                        <ExternalLink size={14} className="mr-1.5" /> View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSites.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="inline-flex flex-col items-center">
                      <MapPin size={40} className="text-slate-200 mb-4" />
                      <p className="text-slate-400 text-sm font-medium">No sites found matching the current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-5 border-t border-slate-50 flex items-center justify-between bg-white">
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            Showing {filteredSites.length} of {sites.length} Active Sites
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
