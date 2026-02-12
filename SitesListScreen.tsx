
import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Eye,
  Filter,
  Factory,
  Building2,
  Warehouse,
  Home,
  Building,
  MoreVertical,
  MapPin,
  Ruler,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Dropdown } from './components/Dropdown';

interface Site {
  id: string;
  name: string;
  type: 'INDUSTRIAL_PLANT' | 'RESIDENTIAL_BUILDING' | 'COMMERCIAL_COMPLEX' | 'WAREHOUSE' | 'APARTMENT_TOWER';
  city: string;
  area: string;
  floors: string;
}

interface SitesListScreenProps {
  sites: Site[];
  onAddSite: () => void;
  onEditSite: (site: Site) => void;
  onViewSite: (site: Site) => void;
}

import { simulateAction, showToast } from './utils/demo';

export const SitesListScreen: React.FC<SitesListScreenProps> = ({ sites, onAddSite, onEditSite, onViewSite }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
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


  const getSiteIcon = (type: Site['type']) => {
    switch (type) {
      case 'INDUSTRIAL_PLANT': return <Factory size={16} />;
      case 'RESIDENTIAL_BUILDING': return <Home size={16} />;
      case 'COMMERCIAL_COMPLEX': return <Building2 size={16} />;
      case 'WAREHOUSE': return <Warehouse size={16} />;
      case 'APARTMENT_TOWER': return <Building size={16} />;
    }
  };

  const getBadgeVariant = (type: Site['type']): 'teal' | 'slate' | 'blue' | 'red' => {
    switch (type) {
      case 'INDUSTRIAL_PLANT': return 'slate';
      case 'COMMERCIAL_COMPLEX': return 'blue';
      case 'WAREHOUSE': return 'slate';
      case 'APARTMENT_TOWER': return 'teal';
      case 'RESIDENTIAL_BUILDING': return 'teal';
      default: return 'slate';
    }
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || site.type === typeFilter;
    const matchesCity = cityFilter === 'All' || site.city === cityFilter;
    return matchesSearch && matchesType && matchesCity;
  });

  const uniqueCities = Array.from(new Set(sites.map(s => s.city)));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Sites / Facilities</h1>
          <p className="text-lg text-slate-500 font-medium">Manage all locations where audits can be requested.</p>
        </div>
        <Button
          variant="primary"
          className="px-8 py-4 rounded-2xl font-display shadow-2xl shadow-teal-500/20"
          onClick={() => handleAction("Add New Site", onAddSite)}
          loading={isSubmitting}
        >
          <Plus size={20} className="mr-2" /> Add Site
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-6 rounded-[2.5rem] border border-slate-100 zen-shadow">
        <div className="md:col-span-6">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Search Site Name</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="e.g. Tower A"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 text-sm font-medium transition-all"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <Dropdown
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="INDUSTRIAL_PLANT">Industrial Plant</option>
            <option value="RESIDENTIAL_BUILDING">Residential Building</option>
            <option value="COMMERCIAL_COMPLEX">Commercial Complex</option>
            <option value="WAREHOUSE">Warehouse</option>
            <option value="APARTMENT_TOWER">Apartment Tower</option>
          </Dropdown>
        </div>

        <div className="md:col-span-3">
          <Dropdown
            label="City"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="All">All Cities</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Sites List Container */}
      <div className="bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Site</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">City</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Area</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Floors</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSites.map((site) => (
                <tr key={site.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-teal-600 group-hover:border-teal-100/50 transition-all duration-500">
                        {getSiteIcon(site.type)}
                      </div>
                      <span className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-teal-800 transition-colors">
                        {site.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={getBadgeVariant(site.type)}>
                      {site.type.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <MapPin size={14} className="text-slate-300" />
                      {site.city}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <Ruler size={14} className="text-slate-300" />
                      {site.area}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <Layers size={14} className="text-slate-300" />
                      {site.floors}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        onClick={() => handleAction(`Edit Site: ${site.name}`, () => onEditSite(site))}
                        className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-teal-600 hover:border-teal-200 hover:bg-white transition-all group/btn"
                        title="Edit Site"
                        variant="ghost"
                        loading={isSubmitting}
                      >
                        <Edit3 size={18} className="group-hover/btn:scale-110 transition-transform" />
                      </Button>
                      <Button
                        onClick={() => handleAction(`View Site: ${site.name}`, () => onViewSite(site))}
                        className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-white transition-all group/btn"
                        title="View Site Details"
                        variant="ghost"
                        loading={isSubmitting}
                      >
                        <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-slate-50">
          {filteredSites.map((site) => (
            <div key={site.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    {getSiteIcon(site.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg tracking-tight">{site.name}</h3>
                    <Badge variant={getBadgeVariant(site.type)}>
                      {site.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <button className="p-2 text-slate-300">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City</p>
                  <p className="text-sm font-bold text-slate-700">{site.city}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Area</p>
                  <p className="text-sm font-bold text-slate-700">{site.area}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floors</p>
                  <p className="text-sm font-bold text-slate-700">{site.floors}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 py-3 text-sm border-teal-100 text-teal-600 hover:bg-teal-50"
                  onClick={() => handleAction(`Edit Site: ${site.name}`, () => onEditSite(site))}
                  loading={isSubmitting}
                >
                  <Edit3 size={16} className="mr-2" /> Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 py-3 text-sm border-slate-100 text-slate-500"
                  onClick={() => handleAction(`View Site: ${site.name}`, () => onViewSite(site))}
                  loading={isSubmitting}
                >
                  <Eye size={16} className="mr-2" /> View
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSites.length === 0 && (
          <div className="py-24 text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <MapPin size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No sites found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              We couldn't find any sites matching your current filters. Try adjusting your search or add a new site.
            </p>
            <Button variant="primary" onClick={() => handleAction("Add First Site", onAddSite)} loading={isSubmitting}>
              <Plus size={18} className="mr-2" /> Add Your First Site
            </Button>
          </div>
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          Showing {filteredSites.length} of {sites.length} Active Locations
        </p>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 text-xs font-black text-slate-300 border border-slate-100 rounded-xl cursor-not-allowed uppercase tracking-widest">
            Previous
          </button>
          <button className="px-6 py-2.5 text-xs font-black text-teal-600 border border-teal-100 rounded-xl bg-teal-50/50 uppercase tracking-widest hover:bg-teal-50 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
