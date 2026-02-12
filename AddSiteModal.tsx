import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

interface AddSiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    orgId: string;
    onSuccess: () => void;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({ isOpen, onClose, orgId, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'RESIDENTIAL_BUILDING',
        address: '',
        city: '',
        state: '',
        pincode: '',
        area: '',
        floors: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const siteTypes = [
        { value: 'RESIDENTIAL_BUILDING', label: 'Residential Building' },
        { value: 'INDUSTRIAL_PLANT', label: 'Industrial Plant' },
        { value: 'OFFICE_BUILDING', label: 'Office Building' },
        { value: 'WAREHOUSE', label: 'Warehouse' },
        { value: 'RETAIL_STORE', label: 'Retail Store' },
        { value: 'HOSPITAL_FACILITY', label: 'Hospital Facility' },
        { value: 'HOTEL_PROPERTY', label: 'Hotel Property' },
        { value: 'OTHER', label: 'Other' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.city) {
            showToast.error("Please fill in required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.post(`/org/${orgId}/sites`, formData);
            showToast.success("Site added successfully");
            setFormData({
                name: '',
                type: 'RESIDENTIAL_BUILDING',
                address: '',
                city: '',
                state: '',
                pincode: '',
                area: '',
                floors: ''
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            showToast.error(error.message || "Failed to add site");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-[3rem] zen-shadow p-8 max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                                <Building2 size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add New Site</h3>
                                <p className="text-sm text-slate-500 font-medium">Create a facility where audits can be requested</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Site Name *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Tower A, Manufacturing Unit 1"
                                required
                            />

                            <div>
                                <label className="text-sm font-semibold text-slate-700 ml-1 block mb-2">
                                    Site Type *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="appearance-none w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all cursor-pointer"
                                >
                                    {siteTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Street address or landmark"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="City *"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="e.g. Pune, Mumbai"
                                    required
                                />
                                <Input
                                    label="State"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="e.g. Maharashtra"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <Input
                                    label="Pincode"
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    placeholder="411001"
                                />
                                <Input
                                    label="Area (sq ft)"
                                    type="number"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    placeholder="25000"
                                />
                                <Input
                                    label="Floors"
                                    type="number"
                                    value={formData.floors}
                                    onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                                    placeholder="15"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                Add Site
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
