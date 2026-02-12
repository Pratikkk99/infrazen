
import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Ruler, Layers, CheckCircle2, AlertCircle, Factory } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { Dropdown } from './components/Dropdown';
import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

interface SiteProfileScreenProps {
  orgId?: number;
  onSuccess?: () => void;
  site?: any;
}

export const SiteProfileScreen: React.FC<SiteProfileScreenProps> = ({ orgId, onSuccess, site }) => {
  const [formData, setFormData] = useState({
    name: site?.name || '',
    type: site?.type || 'INDUSTRIAL_PLANT',
    address1: site?.address1 || '',
    address2: site?.address2 || '',
    city: site?.city || '',
    state: site?.state || '',
    pincode: site?.pincode || '',
    area: site?.area?.replace(' sqft', '') || '',
    floors: site?.floors || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Site name is required';
    if (!formData.address1) newErrors.address1 = 'Address line 1 is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode (6 digits)';

    if (formData.area && isNaN(Number(formData.area))) newErrors.area = 'Must be a number';
    if (formData.floors && isNaN(Number(formData.floors))) newErrors.floors = 'Must be a number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast.error("Please fix validation errors");
      return;
    }

    if (!orgId) {
      showToast.error("Organization ID missing");
      return;
    }

    setIsSaving(true);
    try {
      if (site?.id) {
        // Update logic - not explicitly added in backend yet but following pattern
        await apiClient.put(`/org/${orgId}/sites/${site.id}`, formData);
      } else {
        await apiClient.post(`/org/${orgId}/sites`, formData);
      }
      showToast.success("Site details saved successfully");
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast.error("Failed to save site data");
    } finally {
      setIsSaving(false);
    }
  };

  const siteTypeOptions = [
    { value: 'INDUSTRIAL_PLANT', label: 'Industrial Plant' },
    { value: 'RESIDENTIAL_BUILDING', label: 'Residential Building' },
    { value: 'COMMERCIAL_COMPLEX', label: 'Commercial Complex' },
    { value: 'WAREHOUSE', label: 'Warehouse' },
    { value: 'APARTMENT_TOWER', label: 'Apartment Tower' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="text-left mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Site Details</h1>
        <p className="text-lg text-slate-500 font-medium">{site ? 'Edit details for ' + site.name : 'Add a facility/location where audits will be conducted.'}</p>
      </div>

      <motion.form
        onSubmit={handleSave}
        className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 zen-shadow space-y-10"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Factory size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Site Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Input
                label="Site Name"
                placeholder="e.g. Warehouse North - Unit 4"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1 mt-1">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>

            <Dropdown
              label="Site Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {siteTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Dropdown>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <MapPin size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Location</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Input
                label="Address Line 1"
                placeholder="Street address, P.O. box..."
                value={formData.address1}
                onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
              />
              {errors.address1 && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1 mt-1">
                  <AlertCircle size={12} /> {errors.address1}
                </p>
              )}
            </div>
            <Input
              label="Address Line 2 (Optional)"
              placeholder="Apartment, suite, unit, building, floor, etc."
              value={formData.address2}
              onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Input
                  label="City"
                  placeholder="Pune"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                {errors.city && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.city}</p>}
              </div>
              <div className="space-y-1">
                <Input
                  label="State"
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
                {errors.state && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.state}</p>}
              </div>
              <div className="space-y-1">
                <Input
                  label="Pincode"
                  placeholder="411001"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
                {errors.pincode && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Building2 size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Technical Specs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="relative">
                <Input
                  label="Area (sqft)"
                  placeholder="e.g. 5000"
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
                <Ruler className="absolute right-4 bottom-3.5 text-slate-300" size={16} />
              </div>
              {errors.area && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1 mt-1">
                  {errors.area}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Input
                  label="Total Floors"
                  placeholder="e.g. 12"
                  type="text"
                  value={formData.floors}
                  onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                />
                <Layers className="absolute right-4 bottom-3.5 text-slate-300" size={16} />
              </div>
              {errors.floors && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1 mt-1">
                  {errors.floors}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex flex-col items-center">
          <Button
            type="submit"
            loading={isSaving}
            className="w-full md:w-auto md:px-20 py-5 rounded-[2rem] text-xl font-display shadow-2xl shadow-teal-500/10 transition-all"
          >
            {site ? 'Update Site' : 'Save Site'}
          </Button>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-6">
            Sites are used to scope technical audit requests
          </p>
        </div>
      </motion.form>
    </div >
  );
};
