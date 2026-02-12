
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, MapPin, Users, Globe, Mail, Phone, ExternalLink } from 'lucide-react';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { apiClient } from './utils/apiClient';

interface AdminOrgDetailScreenProps {
    orgId: string;
    onBack: () => void;
}

export const AdminOrgDetailScreen: React.FC<AdminOrgDetailScreenProps> = ({ orgId, onBack }) => {
    const [orgData, setOrgData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const data = await apiClient.get(`/admin/organizations/${orgId}`);
                setOrgData(data);
            } catch (error) {
                // Mock for demo
                setOrgData({
                    id: orgId,
                    name: 'Sterling Towers RWA',
                    type: 'RESIDENTIAL',
                    city: 'Pune',
                    address: 'Kalyani Nagar, Pune 411006',
                    sites: 4,
                    members: 12,
                    joined: '2023-11-20'
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrg();
    }, [orgId]);

    if (isLoading) return <div className="p-20 text-center">Loading organization details...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-teal-600 rounded-[1.25rem] transition-all border border-slate-100 zen-shadow group"
                >
                    <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Profile</h2>
                    <p className="text-slate-500 text-sm font-medium">Verify and manage corporate/society entities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 zen-shadow">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
                            <Building2 size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{orgData.name}</h3>
                        <Badge variant="blue">{orgData.type}</Badge>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <MapPin size={16} className="text-slate-300" /> {orgData.city}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <Users size={16} className="text-slate-300" /> {orgData.members} Members
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 zen-shadow">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Associated Sites</h4>
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Site Alpha-0{i}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Industrial</p>
                                        </div>
                                        <ExternalLink size={14} className="text-slate-300" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 zen-shadow">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Subscription & Billing</h4>
                            <div className="p-6 bg-teal-50 rounded-3xl border border-teal-100 text-center">
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Current Plan</p>
                                <p className="text-2xl font-black text-slate-900 mb-4">Enterprise Pro</p>
                                <Button size="sm" variant="primary" className="w-full text-[10px] font-black uppercase tracking-widest py-3">View Billing</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
