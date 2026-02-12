
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  X,
  ArrowRight,
  ShieldAlert,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { Button } from './components/Button';
import { Badge } from './components/Badge';

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_STARTED';

interface UploadItemProps {
  label: string;
  description: string;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  status: VerificationStatus;
}

const UploadCard: React.FC<UploadItemProps> = ({ label, description, onFileSelect, selectedFile, status }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative p-8 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 group ${selectedFile
        ? 'bg-teal-50/30 border-teal-200'
        : 'bg-white border-slate-100 hover:border-teal-200 hover:bg-slate-50/50'
        }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${selectedFile ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-teal-600'
            }`}>
            {selectedFile ? <FileCheck size={28} /> : <UploadCloud size={28} />}
          </div>
          {status === 'APPROVED' && (
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 size={16} />
            </div>
          )}
        </div>

        <div className="space-y-1 mb-8">
          <h4 className="text-lg font-bold text-slate-900 tracking-tight">{label}</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>

        <div className="mt-auto">
          {selectedFile ? (
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-teal-100 shadow-sm animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText size={18} className="text-teal-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 truncate">{selectedFile.name}</span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline whitespace-nowrap ml-4"
              >
                Replace
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-200 bg-white rounded-xl font-bold text-xs uppercase tracking-widest"
            >
              Choose File
            </Button>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        accept=".pdf,.jpg,.jpeg,.png"
      />
    </div>
  );
};

import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

export const ExpertVerificationScreen: React.FC = () => {
  const [status, setStatus] = useState<VerificationStatus>('NOT_STARTED');
  const [files, setFiles] = useState<Record<string, File | null>>({
    degree: null,
    license: null,
    idProof: null,
    bankProof: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (key: string, file: File) => {
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/api/support/ticket", { type: 'VERIFICATION', files: Object.keys(files) });
      showToast.success("Verification documents submitted successfully!");
      setStatus('PENDING');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      showToast.error(error.message || "Document submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="text-amber-500" />,
          label: 'PENDING REVIEW',
          sub: 'Admin review in progress. We usually verify within 24-48 hours.',
          variant: 'blue' as const,
          bg: 'bg-amber-50 border-amber-100'
        };
      case 'APPROVED':
        return {
          icon: <ShieldCheck className="text-teal-500" />,
          label: 'VERIFIED EXPERT',
          sub: 'Your profile is approved. You can now bid on technical audit requests.',
          variant: 'teal' as const,
          bg: 'bg-teal-50 border-teal-100'
        };
      case 'REJECTED':
        return {
          icon: <ShieldAlert className="text-red-500" />,
          label: 'REJECTED',
          sub: 'Please re-upload corrected documents. Check admin notes below.',
          variant: 'red' as const,
          bg: 'bg-red-50 border-red-100'
        };
      default:
        return {
          icon: <FileUp className="text-slate-400" />,
          label: 'NOT STARTED',
          sub: 'Upload your credentials to start accepting audits.',
          variant: 'slate' as const,
          bg: 'bg-slate-50 border-slate-100'
        };
    }
  };

  const config = getStatusConfig();
  const allFilesUploaded = Object.values(files).every(f => f !== null);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Verification</h1>
          <p className="text-lg text-slate-500 font-medium">Upload documents to get verified and start accepting audits.</p>
        </div>

        <div className={`flex items-center gap-6 px-8 py-5 rounded-[2.5rem] border ${config.bg} zen-shadow transition-all duration-700`}>
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            {config.icon}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
            <div className="flex items-center gap-3">
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className={`p-8 rounded-[3rem] border flex items-start gap-6 shadow-sm ${config.bg}`}>
        <div className="shrink-0 p-3 bg-white rounded-2xl">
          <ShieldCheck className={status === 'APPROVED' ? 'text-teal-500' : 'text-slate-400'} size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">{config.label}</h3>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">{config.sub}</p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UploadCard
          label="Degree Certificate"
          description="Proof of academic qualification in technical domain."
          selectedFile={files.degree}
          onFileSelect={(f) => handleFileSelect('degree', f)}
          status={status}
        />
        <UploadCard
          label="Professional License"
          description="Certification or license to conduct technical audits."
          selectedFile={files.license}
          onFileSelect={(f) => handleFileSelect('license', f)}
          status={status}
        />
        <UploadCard
          label="Government ID"
          description="Aadhar, Passport or Driver's license for ID check."
          selectedFile={files.idProof}
          onFileSelect={(f) => handleFileSelect('idProof', f)}
          status={status}
        />
        <UploadCard
          label="Bank Proof"
          description="Cancelled cheque or passbook for earnings payout."
          selectedFile={files.bankProof}
          onFileSelect={(f) => handleFileSelect('bankProof', f)}
          status={status}
        />
      </div>

      {/* Admin Notes (Visible only when rejected) */}
      {status === 'REJECTED' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border border-red-100 p-8 rounded-[3rem] space-y-4"
        >
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle size={20} />
            <h4 className="font-bold uppercase tracking-widest text-xs">Admin Notes</h4>
          </div>
          <p className="text-sm text-red-700 font-medium leading-relaxed">
            "Your Government ID proof is blurred and the expiration date is not clearly visible. Please re-upload a high-resolution scan of your Passport or Aadhar card to proceed."
          </p>
        </motion.div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 zen-shadow flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 max-w-lg">
          <div className="w-16 h-16 rounded-[1.75rem] bg-slate-50 flex items-center justify-center text-slate-400">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-900">Trust & Security</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Documents are encrypted and stored securely. Only authorized infra2zen compliance team members can access these for verification.
            </p>
          </div>
        </div>

        <Button
          disabled={!allFilesUploaded || isSubmitting || status === 'PENDING' || status === 'APPROVED'}
          onClick={handleSubmit}
          loading={isSubmitting}
          className="w-full md:w-auto px-12 py-5 rounded-2xl text-lg font-display font-black shadow-2xl shadow-teal-500/10 disabled:opacity-30 disabled:grayscale transition-all duration-500"
        >
          {status === 'REJECTED' ? 'Update & Resubmit' : 'Submit for Verification'}
          {!isSubmitting && <ArrowRight size={22} className="ml-3" />}
        </Button>
      </div>

      {/* Compliance Notice */}
      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
        Platform Compliance V2.4 • Secured via infra2zen Cloud Gateway
      </p>
    </div>
  );
};
