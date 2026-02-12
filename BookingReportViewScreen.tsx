
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { Badge } from './components/Badge';
import { TimelineStepper } from './components/TimelineStepper';
import { ReviewModal } from './components/ReviewModal';
import { ReportSummaryCard } from './components/ReportSummaryCard';
import { FindingsAccordion } from './components/FindingsAccordion';
import { EvidenceGallery } from './components/EvidenceGallery';
import { DownloadButtons } from './components/DownloadButtons';
import { ActionFooter } from './components/ActionFooter';

interface BookingReportViewScreenProps {
  bookingId: string;
  requestId: string;
  onBack: () => void;
}

import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

export const BookingReportViewScreen: React.FC<BookingReportViewScreenProps> = ({
  bookingId,
  requestId,
  onBack
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: string, callback?: () => void) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/support/ticket', { action, bookingId });
      if (callback) callback();
    } catch (error: any) {
      showToast.error(error.message || "Action failed — try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const evidenceImages = [
    'https://images.unsplash.com/photo-1581094794329-c627a92ad1ab?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1590348697170-717bdc399e4b?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1581093583449-80d009b061d4?auto=format&fit=crop&q=80&w=400'
  ];

  const findingsData = [
    {
      id: 'f1',
      title: 'Earthing Resistance Above Limit',
      severity: 'CRITICAL' as const,
      description: 'The measured value for the primary building earthing pit was 4.8Ω, which exceeds the safety standard of 2Ω. This poses a risk to equipment safety during surge events.',
      location: 'Primary Substation Yard'
    },
    {
      id: 'f2',
      title: 'LT Panel Overheating Signs',
      severity: 'MEDIUM' as const,
      description: 'Thermal imaging identified hotspots (up to 82°C) on the Phase B busbar junction. This suggests loose terminal connections or excessive contact resistance.',
      location: 'Main Distribution Room - LT Panel A'
    },
    {
      id: 'f3',
      title: 'Load Imbalance Across Phases',
      severity: 'LOW' as const,
      description: 'Detected a 15% current imbalance between Phase A and Phase C. While within operating limits, it leads to neutral current buildup and reduced transformer efficiency.',
      location: 'Floor 4 Secondary DB'
    },
    {
      id: 'f4',
      title: 'Missing Fire Sealants',
      severity: 'RECOMMENDATION' as const,
      description: 'Several cable penetrations through the main server room wall are missing certified fire sealants. Recommend installing fire-stop putty.',
      location: 'Data Center Entrance'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors font-bold text-xs uppercase tracking-widest group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Bookings
          </button>
          <div className="flex flex-wrap items-center gap-5">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-display">Report — Booking #{bookingId}</h1>
            <Badge variant="teal">VERIFIED</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2">Linked Req <span className="text-teal-600">#{requestId}</span></span>
            <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
            <span className="flex items-center gap-2">Category: <span className="text-slate-900">ELECTRICAL</span></span>
          </div>
        </div>

        <DownloadButtons />
      </header>

      {/* Pipeline Status */}
      <section className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-14 zen-shadow mb-10 overflow-hidden">
        <TimelineStepper currentStatus="REPORT_SUBMITTED" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <ReportSummaryCard
            critical={3}
            medium={5}
            low={2}
            recommendations={8}
          />

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Detailed Findings</h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-teal-600 uppercase tracking-widest">
                <Clock size={14} /> Total 18 Points Checked
              </div>
            </div>
            <FindingsAccordion findings={findingsData} />
          </section>

          <EvidenceGallery images={evidenceImages} />
        </div>

        <div className="space-y-10">
          {/* Expert Info Card */}
          <section className="bg-white rounded-[3.5rem] border border-slate-100 p-10 zen-shadow text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl mx-auto transition-transform group-hover:scale-105 duration-500">
                <img src="https://i.pravatar.cc/150?img=11" className="w-full h-full object-cover" alt="Expert" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
                <ShieldCheck size={18} />
              </div>
            </div>
            <h4 className="text-2xl font-black text-slate-900 font-display mb-1">Amit P</h4>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Master Technical Auditor</p>

            <div className="space-y-4 text-left">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-teal-600 shadow-sm">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inspection Date</p>
                  <p className="text-xs font-bold text-slate-700">15 Jan, 2024</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-teal-600 shadow-sm">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auditor ID</p>
                  <p className="text-xs font-bold text-slate-700">EXPER_8492</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats Sidebar */}
          <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 zen-shadow space-y-8">
            <h4 className="text-lg font-black text-slate-900 font-display tracking-tight">Audit Metrics</h4>
            <div className="space-y-5">
              {[
                { label: 'Time Onsite', value: '4h 32m', color: 'text-teal-600' },
                { label: 'Checklist Score', value: '94%', color: 'text-teal-600' },
                { label: 'Media Captured', value: '24 Photos', color: 'text-slate-700' },
                { label: 'Verification', value: 'Level 3', color: 'text-teal-600' }
              ].map((metric, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{metric.label}</span>
                  <span className={`text-sm font-black ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-teal-50 border border-teal-100 rounded-[3rem] text-center">
            <FileText size={48} className="mx-auto text-teal-600 mb-4 opacity-40" />
            <h5 className="font-bold text-teal-900 mb-1">Compliance Check</h5>
            <p className="text-xs text-teal-700 leading-relaxed font-medium">This report complies with ISO 19011:2018 auditing standards for technical facilities.</p>
          </div>
        </div>
      </div>

      <ActionFooter
        onRate={() => setShowReviewModal(true)}
        onRaiseTicket={() => handleAction("Raise Support Ticket", () => showToast.success("Support ticket created"))}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        expertName="Amit P"
        onSuccess={(r, rev) => {
          console.log(`Review success: ${r} stars, "${rev}"`);
        }}
      />
    </div>
  );
};
