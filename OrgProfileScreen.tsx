
import React, { useState, useEffect } from 'react';
import { Building2, Landmark, Briefcase, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { RadioGroup } from './components/RadioGroup';
import { Dropdown } from './components/Dropdown';
import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

export const OrgProfileScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'society',
    industry: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    totalUnits: '',
    stage: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrgId, setCurrentOrgId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const orgs = await apiClient.get('/org/my-organizations');
        if (orgs.length > 0) {
          const org = orgs[0];
          setCurrentOrgId(org.org_id);
          setFormData({
            name: org.org_name || '',
            type: org.org_type === 'RESIDENTIAL_SOCIETY' ? 'society' : 'business',
            industry: org.industry || '',
            address1: org.address_line1 || '',
            address2: org.address_line2 || '',
            city: org.city || '',
            state: org.state || '',
            pincode: org.pincode || '',
            totalUnits: '',
            stage: ''
          });
        }
      } catch (error) {
        showToast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrg();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Organization name is required';
    if (!formData.address1) newErrors.address1 = 'Primary address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode (6 digits required)';

    if (formData.type === 'business' && !formData.industry) {
      newErrors.industry = 'Industry selection is required for businesses';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast.error("Please fix validation errors");
      return;
    }

    if (!currentOrgId) return;

    setIsSaving(true);
    try {
      await apiClient.put(`/org/${currentOrgId}`, formData);
      showToast.success("Organization profile updated");
    } catch (error) {
      showToast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const typeOptions = [
    { id: 'society', label: 'Residential Society' },
    { id: 'business', label: 'Business Entity' }
  ];

  const industryOptions = [
    { value: '', label: 'Select Industry' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'it', label: 'IT Services' },
    { value: 'commercial', label: 'Commercial Complex' },
    { value: 'retail', label: 'Retail & Mall' },
    { value: 'other', label: 'Other' }
  ];

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-left mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Organization Profile</h1>
        <p className="text-lg text-slate-500 font-medium">Update your organization details for audit requests and bookings.</p>
      </div>

      <motion.form
        onSubmit={handleSave}
        className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 zen-shadow space-y-10"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Building2 size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Identity</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Input
                label="Organization Name"
                placeholder="e.g. Green Valley Residents Welfare Association"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1 mt-1">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>

            <RadioGroup
              label="Organization Type"
              options={typeOptions}
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val })}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {formData.type === 'business' ? (
            <motion.div
              key="business"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pt-6 border-t border-slate-50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Briefcase size={18} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Business Context</h2>
              </div>
              <div className="space-y-1">
                <Dropdown
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  {industryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Dropdown>
                {errors.industry && (
                  <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1 mt-1">
                    <AlertCircle size={12} /> {errors.industry}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="society"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pt-6 border-t border-slate-50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Landmark size={18} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Society Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Total Units"
                  placeholder="e.g. 250"
                  type="number"
                  value={formData.totalUnits}
                  onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                />
                <Input
                  label="Stage / Phase"
                  placeholder="e.g. Phase 2"
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                placeholder="Building name, street address..."
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
              placeholder="Area, landmark..."
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

        <div className="pt-8 border-t border-slate-50 flex flex-col items-center">
          <Button
            type="submit"
            loading={isSaving}
            className="w-full md:w-auto md:px-20 py-5 rounded-[2rem] text-xl font-display shadow-2xl shadow-teal-500/10 transition-all"
          >
            Save Profile
          </Button>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-6">
            Securely encrypted organization data
          </p>
        </div>
      </motion.form>
    </div>
  );
};
