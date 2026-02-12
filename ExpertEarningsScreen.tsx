
import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Clock, FileText, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from './utils/apiClient';
import { showToast } from './utils/demo';
import { Badge } from './components/Badge';

export const ExpertEarningsScreen: React.FC = () => {
    const [earnings, setEarnings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const data = await apiClient.get('/expert/earnings');
                setEarnings(data);
            } catch (error) {
                showToast.error("Failed to load earnings data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    if (isLoading) return <div className="p-20 text-center text-teal-600">Loading earnings...</div>;

    const stats = [
        { label: 'Total Earned', value: `₹${earnings?.totalEarned?.toLocaleString() || '0'}`, icon: <CheckCircle2 className="text-teal-500" />, trend: 'Life time' },
        { label: 'Pending Settlement', value: `₹${earnings?.pending?.toLocaleString() || '0'}`, icon: <Clock className="text-amber-500" />, trend: 'Processing' },
        { label: 'This Month', value: '₹0', icon: <TrendingUp className="text-blue-500" />, trend: 'Target: ₹50k' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Earnings</h1>
                <p className="text-lg text-slate-500 font-medium">Manage your payouts and check payment history.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 zen-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.trend}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden">
                <div className="p-10 border-b border-slate-50">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">Payment History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit / Booking</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {earnings?.history?.map((item: any) => (
                                <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Booking #{item.id}</p>
                                                <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Req #{item.request}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-sm font-medium text-slate-500 whitespace-nowrap">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-6 font-black text-slate-900">
                                        ₹{item.amount?.toLocaleString()}
                                    </td>
                                    <td className="px-10 py-6">
                                        <Badge variant="teal">{item.status}</Badge>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
                                            <ArrowUpRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!earnings?.history || earnings.history.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <IndianRupee size={40} className="text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-medium">No payout history found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
