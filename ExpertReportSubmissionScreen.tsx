
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  UploadCloud,
  CheckCircle2,
  Send,
  X,
  AlertCircle,
  Link as LinkIcon,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { Button } from './components/Button';
import { PreviewCard } from './components/PreviewCard';
import { ConfirmationModal } from './components/ConfirmationModal';
import { simulateAction, showToast } from './utils/demo';

interface ExpertReportSubmissionScreenProps {
  bookingId: string;
  onBack: () => void;
  onSubmitSuccess: () => void;
}

import { apiClient } from './utils/apiClient';

export const ExpertReportSubmissionScreen: React.FC<ExpertReportSubmissionScreenProps> = ({
  bookingId,
  onBack,
  onSubmitSuccess
}) => {
  const [summary, setSummary] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const finalReportUrl = reportUrl || (file ? `https://storage.infrazen.com/reports/${bookingId}/${file.name}` : '');
      await apiClient.post(`/bookings/${bookingId}/report`, {
        summary,
        reportUrl: finalReportUrl
      });
      showToast.success("Report submitted successfully! Verification pending.");
      onSubmitSuccess();
    } catch (error) {
      showToast.error("Submission failed — try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = summary.trim().length > 10 && (file !== null || reportUrl.trim().length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 relative">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors font-bold text-xs uppercase tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Booking
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display tracking-tighter">Generate Report — Booking #{bookingId}</h1>
            <p className="text-lg text-slate-500 font-medium">Submit your final findings and upload the completed report.</p>
          </div>
          <div className="px-6 py-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-teal-500" /> Compliance Mode
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Content */}
        <div className="lg:col-span-7 space-y-10">
          <section className="bg-white rounded-[3.5rem] border border-slate-100 p-10 md:p-12 zen-shadow space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <FileText size={14} className="text-teal-500" /> Summary Notes
              </label>
              <textarea
                rows={6}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key observations, major issues, overall recommendations..."
                className="w-full px-6 py-5 bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all resize-none leading-relaxed"
              />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right px-2">
                {summary.length} characters (min 10)
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preview Breakdown</label>
              <PreviewCard
                criticalCount={3}
                mediumCount={5}
                recommendationCount={8}
                topIssues={[
                  "Main Panel Hotspot detected via IR scan (85°C)",
                  "Secondary DB Earthing resistance exceeds 2Ω",
                  "Loose terminal connections in HVAC plant room"
                ]}
              />
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-5 space-y-10">
          <section className="bg-white rounded-[3.5rem] border border-slate-100 p-8 md:p-10 zen-shadow sticky top-24 space-y-8">
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attach Final Report</label>

              {/* File Upload Area */}
              <div className={`relative group border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-500 ${file ? 'bg-teal-50/30 border-teal-200' : 'bg-slate-50 border-slate-100 hover:border-teal-200 hover:bg-white'
                }`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 mb-4 ${file ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'bg-white text-slate-300 group-hover:text-teal-500 group-hover:scale-110'
                    }`}>
                    {file ? <FileCheck size={28} /> : <UploadCloud size={28} />}
                  </div>
                  {file ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Ready to upload</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700">Drop PDF Report Here</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">or click to browse files</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-100 flex-grow" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or paste URL</span>
                <div className="h-px bg-slate-100 flex-grow" />
              </div>

              <div className="relative group">
                <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="url"
                  placeholder="Paste report link..."
                  value={reportUrl}
                  onChange={(e) => setReportUrl(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-4">
              <Button
                disabled={!isFormValid || isSubmitting}
                loading={isSubmitting}
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-6 rounded-[2rem] bg-teal-600 hover:bg-teal-700 text-white font-black text-xl shadow-2xl shadow-teal-600/20 transition-all duration-500 disabled:opacity-30 disabled:grayscale"
              >
                Submit Report
                {!isSubmitting && <Send size={24} className="ml-3" />}
              </Button>
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4">
                Once submitted, this report will be verified and sent to the client.
              </p>
            </div>
          </section>

          {/* Guidelines Box */}
          <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-5 items-start">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
              <AlertCircle size={20} />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-black text-amber-900 uppercase tracking-widest">Audit Guidelines</h5>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">Ensure all critical findings have corresponding evidence photos attached in the PDF. High-res thermal imaging is mandatory for this category.</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalSubmit}
        isSubmitting={isSubmitting}
        type="approve"
        title="Final Submission"
        message="Are you sure you want to submit this audit report? You will not be able to edit the findings once verified by the platform."
      />
    </div>
  );
};
