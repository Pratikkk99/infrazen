
import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Download,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Filter,
  X,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Send,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { Dropdown } from './components/Dropdown';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { simulateAction, showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

interface Report {
  id: string;
  bookingId: string;
  customer: string;
  category: string;
  submittedDate: string;
  status: 'Pending Review' | 'Approved' | 'Sent to Customer';
  expertName: string;
  findings?: any[];
  summaryNotes?: string;
  reportFileUrl?: string;
}

interface ReportsManagementProps {
  onBack?: () => void;
}

export const ReportsManagement: React.FC<ReportsManagementProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await apiClient.get('/admin/reports');
        setReports(data.map((r: any) => ({
          id: r.report_id.toString(),
          bookingId: r.booking_id.toString(),
          customer: r.bookings?.organizations?.org_name || 'N/A',
          category: r.bookings?.service_category || 'N/A',
          submittedDate: r.last_update_dt ? new Date(r.last_update_dt).toLocaleDateString() : '-',
          status: r.bookings?.booking_status === 'REPORT_SUBMITTED' ? 'Pending Review' : r.bookings?.booking_status === 'COMPLETED' ? 'Approved' : 'Sent to Customer',
          expertName: r.bookings?.expert_profiles?.app_users_expert_profiles_user_idToapp_users?.full_name || 'N/A',
          summaryNotes: r.summary_notes,
          reportFileUrl: r.report_file_url
        })));
      } catch (error) {
        showToast.error("Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleAction = async (action: string, callback: () => void) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/support/ticket', { action });
      callback();
    } catch (error: any) {
      showToast.error(error.message || "Action failed — try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || report.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusVariant = (status: Report['status']) => {
    switch (status) {
      case 'Pending Review': return 'blue';
      case 'Approved': return 'teal';
      case 'Sent to Customer': return 'slate';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-teal-600 rounded-[1.25rem] transition-all border border-slate-100 zen-shadow group"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h2>
            <p className="text-slate-500 text-sm font-medium">View submitted audit reports and manage approvals.</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-2 px-6 py-3 border-slate-200 text-slate-600 hover:text-teal-600 hover:bg-teal-50/50 transition-all font-bold text-xs uppercase tracking-widest"
          onClick={() => handleAction("Export Report Archive", () => showToast.success("Archive export started"))}
          loading={isSubmitting}
        >
          <Download size={16} />
          Export Archive
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-3xl border border-slate-100 zen-shadow">
        <div className="flex-grow min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Search Reports</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Booking ID or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 text-sm transition-all"
            />
          </div>
        </div>

        <Dropdown
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-40"
        >
          <option value="All">All Categories</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="SOLAR">Solar</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="STP">STP</option>
          <option value="SNAGLIST">Snagging</option>
        </Dropdown>

        <Dropdown
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-44"
        >
          <option value="All">All Statuses</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Sent to Customer">Sent to Customer</option>
        </Dropdown>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 zen-shadow overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Booking</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Submitted</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="group hover:bg-teal-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">#{report.bookingId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 leading-tight">{report.customer}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">By {report.expertName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="slate">{report.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} className="text-slate-300" />
                        {report.submittedDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-4 py-1.5 text-xs font-bold border-slate-200 hover:border-teal-600 hover:text-teal-600 bg-white"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye size={14} className="mr-1.5" /> View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="inline-flex flex-col items-center">
                        <FileText size={40} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 text-sm font-medium">No reports found matching your selection.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] zen-shadow overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-8 border-b border-slate-50 shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={getStatusVariant(selectedReport.status)}>{selectedReport.status}</Badge>
                    <span className="text-sm font-bold text-slate-300 tracking-widest uppercase">Report #{selectedReport.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Audit Report: {selectedReport.customer}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Booking: #{selectedReport.bookingId} • Expert: {selectedReport.expertName}</p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X size={24} className="text-slate-300" />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <section>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Inspection Summary</h4>
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {selectedReport.summaryNotes || "No summary notes provided by the auditor."}
                      </p>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Report File</h4>
                  {selectedReport.reportFileUrl ? (
                    <div className="aspect-[3/4] bg-slate-100 rounded-[2rem] border border-slate-200 flex flex-col items-center justify-center p-8 text-center group transition-all border-dashed">
                      <div className="w-16 h-16 rounded-2xl bg-white zen-shadow flex items-center justify-center text-teal-600 mb-4">
                        <FileText size={32} />
                      </div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-full">{selectedReport.reportFileUrl}</p>
                      <a
                        href={selectedReport.reportFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
                      >
                        Open Report
                      </a>
                    </div>
                  ) : (
                    <div className="p-10 text-center text-slate-400 border border-dashed rounded-3xl">No report file uploaded.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 shrink-0 bg-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {selectedReport.status === 'Pending Review' && (
                    <Button
                      className="flex-grow sm:flex-none py-4 px-8 bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/10 font-bold"
                      onClick={() => handleAction(`Approve Report for ${selectedReport.customer}`, () => {
                        apiClient.post(`/bookings/${selectedReport.bookingId}/status`, { status: 'COMPLETED' })
                          .then(() => {
                            showToast.success("Report approved successfully");
                            setSelectedReport(null);
                            // Refresh list (optional, but good)
                            window.location.reload();
                          });
                      })}
                      loading={isSubmitting}
                    >
                      <CheckCircle2 size={18} className="mr-2" />
                      Approve & Complete
                    </Button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center sm:text-right">
                  System ID: {selectedReport.id} • Audit Verified
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
