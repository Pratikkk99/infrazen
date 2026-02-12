
import React, { useState } from 'react';
import {
  GitPullRequest,
  MapPin,
  Zap,
  Calendar,
  IndianRupee,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { RadioGroup } from './components/RadioGroup';
import { Dropdown } from './components/Dropdown';
import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';

interface CreateRequestScreenProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export const CreateRequestScreen: React.FC<CreateRequestScreenProps> = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    target: 'organization_site',
    siteId: '',
    category: '',
    startDate: '',
    endDate: '',
    budgetAmount: '',
    currency: 'INR',
    scope: '',
    biddingDuration: '24',
    customDuration: '',
    visibility: 'verified_only'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const myOrgs = await apiClient.get('/org/my-organizations');
        setOrgs(myOrgs);
        if (myOrgs.length > 0) {
          const sitesData = await apiClient.get(`/org/${myOrgs[0].org_id}/sites`);
          setSites(sitesData);
        }
      } catch (error) {
        showToast.error("Failed to load sites");
      }
    };
    fetchSites();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.siteId) newErrors.siteId = 'Please select a site';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.biddingDuration === 'custom' && !formData.customDuration) {
      newErrors.customDuration = 'Please specify hours';
    }
    if (formData.customDuration && isNaN(Number(formData.customDuration))) {
      newErrors.customDuration = 'Must be a number';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast.error("Required fields missing");
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      if (orgs.length === 0) return;
      await apiClient.post(`/org/${orgs[0].org_id}/requests`, { ...formData, request_status: 'DRAFT' });
      showToast.success("Draft saved successfully");
    } catch (error: any) {
      showToast.error(error.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (orgs.length === 0) {
      showToast.error("No organization found");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/requests', {
        orgId: orgs[0].org_id,
        siteId: formData.siteId,
        category: formData.category.toUpperCase(),
        scope: formData.scope,
        budget: formData.budgetAmount,
        closeDate: formData.endDate
      });
      showToast.success("Request published successfully");
      setShowSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error: any) {
      showToast.error(error.message || "Failed to publish request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Select Category' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'solar', label: 'Solar' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'stpowc', label: 'STP/OWC' },
    { value: 'snagging', label: 'Snag Inspection' }
  ];

  const biddingOptions = [
    { id: '24', label: '24h' },
    { id: '48', label: '48h' },
    { id: 'custom', label: 'Custom' }
  ];

  const visibilityOptions = [
    { id: 'verified_only', label: 'Verified Experts Only' },
    { id: 'all_experts', label: 'All Experts' }
  ];

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-24 text-center space-y-8"
      >
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto border-4 border-white shadow-xl">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">Request Published!</h2>
          <p className="text-slate-500 font-medium px-6">Your audit request is now live in the expert marketplace. You'll be notified as soon as experts start bidding.</p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" className="px-10 py-4 rounded-2xl" onClick={onSuccess}>
            View Request Details
          </Button>
          <Button variant="ghost" className="px-10 py-4 rounded-2xl text-slate-400 font-bold" onClick={onBack}>
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">

      <div className="text-left mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Create Request</h1>
        <p className="text-lg text-slate-500 font-medium">Submit an audit request and invite verified experts to bid.</p>
      </div>

      <motion.form
        onSubmit={handlePublish}
        className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-14 zen-shadow space-y-12"
      >
        {/* Section: Target & Site */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <MapPin size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Target</h2>
            </div>

            <RadioGroup
              label="Select Target Type"
              options={[{ id: 'organization_site', label: 'Organization Site' }]}
              value={formData.target}
              onChange={(val) => setFormData({ ...formData, target: val })}
              name="target_type"
            />
          </div>

          <div className="space-y-6">
            <div className="pt-10">
              <Dropdown
                label="Target Facility"
                value={formData.siteId}
                onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              >
                {sites.map(site => (
                  <option key={site.site_id} value={site.site_id}>{site.site_name}</option>
                ))}
              </Dropdown>
              {errors.siteId && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1 mt-1">
                  <AlertCircle size={12} /> {errors.siteId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section: Category & Schedule */}
        <div className="pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Zap size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Service</h2>
            </div>
            <Dropdown
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Dropdown>
            {errors.category && (
              <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 ml-1 mt-1">
                <AlertCircle size={12} /> {errors.category}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Calendar size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Preferred Window</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Input
                  label="Start"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                {errors.startDate && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.startDate}</p>}
              </div>
              <div className="space-y-1">
                <Input
                  label="End"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
                {errors.endDate && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Budget & Notes */}
        <div className="pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <IndianRupee size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Budget Hint</h2>
            </div>
            <div className="flex gap-2">
              <div className="flex-grow">
                <Input
                  label="Amount"
                  placeholder="e.g. 15000"
                  type="number"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                />
              </div>
              <div className="w-24">
                <Dropdown
                  label="Currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </Dropdown>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <FileText size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Scope Notes</h2>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Requirements & Issues</label>
              <textarea
                rows={4}
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                placeholder="Describe specific issues, building age, panels to be inspected, etc."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section: Bidding & Visibility */}
        <div className="pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Clock size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Bidding Duration</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {biddingOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, biddingDuration: opt.id })}
                  className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.biddingDuration === opt.id
                    ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {formData.biddingDuration === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
                    <Input
                      label="Custom Duration (hours)"
                      placeholder="e.g. 72"
                      value={formData.customDuration}
                      onChange={(e) => setFormData({ ...formData, customDuration: e.target.value })}
                    />
                    {errors.customDuration && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{errors.customDuration}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <ShieldCheck size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Visibility</h2>
            </div>
            <RadioGroup
              label="Who can bid?"
              options={visibilityOptions}
              value={formData.visibility}
              onChange={(val) => setFormData({ ...formData, visibility: val })}
              name="visibility_setting"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            loading={isSavingDraft}
            disabled={isSubmitting}
            className="w-full md:w-auto px-10 py-4 border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-100 rounded-2xl font-bold uppercase tracking-widest text-xs"
          >
            Save Draft
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSavingDraft}
            className="w-full md:w-auto px-16 py-4 rounded-[2rem] text-xl font-display shadow-2xl shadow-teal-500/10 transition-all"
          >
            Publish Request
            {!isSubmitting && <ArrowRight size={20} className="ml-3" />}
          </Button>
        </div>
      </motion.form >
    </div >
  );
};
