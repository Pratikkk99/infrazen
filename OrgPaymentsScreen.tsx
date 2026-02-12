
import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Landmark, ArrowUpRight, History, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from './utils/apiClient';
import { showToast } from './utils/demo';
import { Badge } from './components/Badge';

interface OrgPaymentsScreenProps {
    orgId?: number;
}

export const OrgPaymentsScreen: React.FC<OrgPaymentsScreenProps> = ({ orgId }) => {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!orgId) return;
        const fetchPayments = async () => {
            try {
                const data = await apiClient.get(`/org/${orgId}/payments`);
                setPayments(data);
            } catch (error) {
                showToast.error("Failed to load payment history");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPayments();
    }, [orgId]);

    if (isLoading) return <div className="p-20 text-center text-teal-600">Loading payments...</div>;

    const cards = [
        { label: 'Platform Balance', value: '₹0.00', icon: <Wallet className="text-teal-500" />, sub: 'Ready for allocation' },
        { label: 'Spent this Month', value: '₹42,500', icon: <CreditCard className="text-blue-500" />, sub: '3 Audits Completed' },
        { label: 'Active Escrows', value: '₹15,000', icon: <Landmark className="text-amber-500" />, sub: 'Booking #77' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-2">Billing & Payments</h1>
                <p className="text-lg text-slate-500 font-medium">Manage invoices, payment methods, and transaction history.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 zen-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-slate-50 rounded-2xl">{card.icon}</div>
                            <Badge variant="teal">Active</Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">{card.value}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{card.sub}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 zen-shadow overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">Transaction History</h2>
                    <button className="text-xs font-black text-teal-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        Download All <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Context</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Method</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payments.map((pay) => (
                                <tr key={pay.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-10 py-6">
                                        <p className="font-bold text-slate-900">{pay.id}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                            {new Date(pay.date).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-10 py-6 text-sm font-medium text-slate-600">
                                        {pay.request}
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{pay.method[0]}</div>
                                            <span className="text-xs font-bold text-slate-500 tracking-widest">{pay.method}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 font-black text-slate-900">
                                        ₹{pay.amount?.toLocaleString()}
                                    </td>
                                    <td className="px-10 py-6">
                                        <Badge variant="teal">{pay.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-3xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold mb-1">Encrypted Billing</h4>
                        <p className="text-slate-400 text-sm">All transactions are secured via platform escrow until audit completion.</p>
                    </div>
                </div>
                <button className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-teal-400 transition-colors uppercase tracking-widest text-xs">
                    Update Methods
                </button>
            </div>
        </div>
    );
};
