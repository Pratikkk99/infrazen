
import React, { useState, useEffect } from 'react';
import { Terminal, Activity, Clock, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { apiClient } from './utils/apiClient';
import { showToast } from './utils/demo';

interface AdminLogsScreenProps {
    onBack: () => void;
}

export const AdminLogsScreen: React.FC<AdminLogsScreenProps> = ({ onBack }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.get('/admin/logs');
            setLogs(data);
        } catch (error) {
            showToast.error("Failed to load platform logs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-teal-600 rounded-[1.25rem] transition-all border border-slate-100 zen-shadow group"
                    >
                        <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Audit Logs</h2>
                        <p className="text-slate-500 text-sm font-medium">Monitoring system actions and technical events.</p>
                    </div>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 font-bold text-xs uppercase tracking-widest hover:text-teal-600 transition-all zen-shadow"
                >
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    Refresh Logs
                </button>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Terminal size={120} className="text-teal-500" />
                </div>

                <div className="relative z-10 space-y-6">
                    {isLoading ? (
                        <div className="py-20 text-center text-slate-500 font-mono tracking-widest text-xs uppercase animate-pulse">
                            Initializing log stream...
                        </div>
                    ) : (
                        <div className="space-y-4 font-mono text-sm">
                            {logs.map((log) => (
                                <div key={log.id} className="group border-l-2 border-teal-500/20 hover:border-teal-500 pl-6 py-4 transition-all">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] font-black bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded uppercase tracking-tighter">
                                            {log.action}
                                        </span>
                                        <span className="text-slate-500 text-[10px]">
                                            [{new Date(log.timestamp).toLocaleTimeString()}]
                                        </span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed font-medium">
                                        {log.details}
                                    </p>
                                </div>
                            ))}
                            <div className="pt-8 flex items-center justify-between border-t border-white/5 mt-8">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <ShieldAlert size={14} className="text-teal-500" /> Secure Log Stream Active
                                </div>
                                <span className="text-[10px] font-bold text-slate-600">v1.4.2_TRACE</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Events', value: '1,240', icon: <Activity size={18} /> },
                    { label: 'Last Event', value: '2 mins ago', icon: <Clock size={18} /> },
                    { label: 'Security Level', value: 'High', icon: <ShieldAlert size={18} /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-teal-100 transition-all zen-shadow">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-xl font-bold text-slate-900">{stat.value}</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 flex items-center justify-center transition-all">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
