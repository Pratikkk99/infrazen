
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Shield, Calendar, Mail, Phone, MapPin, Activity } from 'lucide-react';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { apiClient } from './utils/apiClient';

interface AdminUserDetailScreenProps {
    userId: string;
    onBack: () => void;
}

export const AdminUserDetailScreen: React.FC<AdminUserDetailScreenProps> = ({ userId, onBack }) => {
    const [userData, setUserData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await apiClient.get(`/admin/users/${userId}`);
                setUserData(data);
            } catch (error) {
                // For demo, if not found use mock
                setUserData({
                    id: userId,
                    name: 'Vikram Singh',
                    email: 'vikram@example.com',
                    phone: '+91 98765 43210',
                    role: 'EXPERT',
                    status: 'Active',
                    joined: '2024-01-15'
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    if (isLoading) return <div className="p-20 text-center">Loading user details...</div>;

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
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile</h2>
                    <p className="text-slate-500 text-sm font-medium">Control and monitor user access.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 zen-shadow text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
                            <User size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{userData.name}</h3>
                        <Badge variant={userData.role === 'SYSTEM_ADMIN' ? 'red' : 'teal'}>{userData.role}</Badge>

                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <Mail size={16} className="text-slate-300" /> {userData.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <Phone size={16} className="text-slate-300" /> {userData.phone}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <Calendar size={16} className="text-slate-300" /> Joined {new Date(userData.joined).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Security Actions</h4>
                        <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start text-xs border-white/10 hover:bg-white/5">Reset Password</Button>
                            <Button variant="outline" className="w-full justify-start text-xs border-white/10 hover:bg-white/5">Deactivate Account</Button>
                            <Button variant="ghost" className="w-full justify-start text-xs text-red-400 hover:bg-red-500/10">Delete Permanent</Button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 zen-shadow">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Recent Activity</h3>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Logged into system</p>
                                        <p className="text-xs text-slate-500">2 hours ago • IP: 192.168.1.{i}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
