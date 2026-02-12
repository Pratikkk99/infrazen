
import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  MapPin,
  Award,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Download,
  Calendar,
  Briefcase
} from 'lucide-react';
// Added missing motion import
import { motion } from 'framer-motion';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { ConfirmationModal } from './components/ConfirmationModal';

interface ExpertReviewScreenProps {
  expert: {
    id: string;
    name: string;
    experience: string;
    services: string[];
    email: string;
    joinedDate: string;
  };
  onBack: () => void;
  onUpdateStatus: (id: string, status: 'Approved' | 'Rejected', notes: string) => void;
}

import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

export const ExpertReviewScreen: React.FC<ExpertReviewScreenProps> = ({ expert, onBack, onUpdateStatus }) => {
  const [notes, setNotes] = useState('');
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmAction = async () => {
    setIsSubmitting(true);
    try {
      const status = modalType === 'approve' ? 'APPROVED' : 'REJECTED';
      await apiClient.post(`/api/admin/experts/${expert.id}/verify`, { status });
      onUpdateStatus(expert.id, modalType === 'approve' ? 'Approved' : 'Rejected', notes);
      showToast.success(`Expert ${modalType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setModalType(null);
      onBack();
    } catch (error: any) {
      showToast.error(error.message || "Action failed — try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentItems = [
    { name: 'Educational_Degree.pdf', size: '2.4 MB', type: 'Degree' },
    { name: 'Technical_License_2024.pdf', size: '1.8 MB', type: 'License' },
    { name: 'Identity_Verification.pdf', size: '3.1 MB', type: 'ID' },
    { name: 'Experience_Certificate.pdf', size: '1.2 MB', type: 'Experience' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navigation & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors font-bold text-xs uppercase tracking-widest group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Queue
          </button>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Verify Expert: {expert.name}</h2>
            <p className="text-slate-500 font-medium">Review credentials and approve or reject this auditor.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="blue">Verification Pending</Badge>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary & Services */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 zen-shadow">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Expert Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-all">
                    <Award size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Experience</p>
                    <p className="text-lg font-bold text-slate-900">{expert.experience}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service Radius</p>
                    <p className="text-lg font-bold text-slate-900">15 km (Pune Central)</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joined On</p>
                    <p className="text-lg font-bold text-slate-900">{expert.joinedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all">
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expert Type</p>
                    <p className="text-lg font-bold text-slate-900">Independent Consultant</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Services Offered</h4>
              <div className="flex flex-wrap gap-2">
                {expert.services.map(service => (
                  <div key={service} className="px-4 py-2 bg-teal-50 text-teal-700 text-sm font-bold rounded-xl border border-teal-100 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-teal-500" />
                    {service}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Documents Section */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 zen-shadow">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Uploaded Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documentItems.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-white transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-teal-600 group-hover:shadow-md transition-all">
                      <FileText size={20} />
                    </div>
                    <button className="p-2 text-slate-300 hover:text-teal-600 transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate mb-1 group-hover:text-teal-700 transition-colors">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.type}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50">•</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Notes & Actions Sidebar */}
        <div className="space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 zen-shadow sticky top-24">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Review & Finalize</h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Notes</label>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes or rejection reason..."
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/10 font-bold"
                  onClick={() => setModalType('approve')}
                >
                  <CheckCircle2 size={18} className="mr-2" />
                  Approve Expert
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-4 border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50 font-bold"
                  onClick={() => setModalType('reject')}
                >
                  <XCircle size={18} className="mr-2" />
                  Reject Application
                </Button>
              </div>

              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">
                Trust & Compliance Review Required
              </p>
            </div>
          </section>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onConfirm={handleConfirmAction}
        isSubmitting={isSubmitting}
        type={modalType || 'approve'}
        title={modalType === 'approve' ? 'Approve Expert' : 'Reject Expert'}
        message={
          modalType === 'approve'
            ? `Are you sure you want to approve ${expert.name}? This will grant them access to accept audit bookings.`
            : `Are you sure you want to reject the application of ${expert.name}? They will be notified of your decision.`
        }
      />
    </div>
  );
};
