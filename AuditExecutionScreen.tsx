
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Zap,
  Droplets,
  Sun,
  Wind,
  ClipboardCheck,
  Trash2,
  Edit3,
  Camera,
  Video,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Save,
  ArrowRight,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Dropdown } from './components/Dropdown';
import { SeverityBadge, SeverityLevel } from './components/SeverityBadge';
import { simulateAction, showToast } from './utils/demo';

interface CapturedFinding {
  id: string;
  title: string;
  category: string;
  severity: SeverityLevel;
  description: string;
  recommendation: string;
  images: string[];
}

interface AuditExecutionScreenProps {
  bookingId: string;
  onBack: () => void;
  onComplete: () => void;
}

import { apiClient } from './utils/apiClient';

export const AuditExecutionScreen: React.FC<AuditExecutionScreenProps> = ({ bookingId, onBack, onComplete }) => {
  const [findings, setFindings] = useState<CapturedFinding[]>([]);
  const [currentFinding, setCurrentFinding] = useState<Partial<CapturedFinding>>({
    title: '',
    category: 'ELECTRICAL',
    severity: 'MEDIUM',
    description: '',
    recommendation: '',
    images: []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveFinding = async () => {
    if (!currentFinding.title || !currentFinding.severity) return;

    setIsSaving(true);
    try {
      // For local state management
      let newFindings;
      if (isEditing && editId) {
        newFindings = findings.map(f => f.id === editId ? { ...f, ...currentFinding as CapturedFinding } : f);
      } else {
        const nf: CapturedFinding = {
          ...currentFinding as CapturedFinding,
          id: Math.random().toString(36).substr(2, 9),
          images: currentFinding.images || []
        };
        newFindings = [nf, ...findings];
      }

      // Sync with backend
      await apiClient.post(`/bookings/${bookingId}/findings`, { findings: newFindings });

      setFindings(newFindings);
      showToast.success(isEditing ? "Finding updated" : "Finding saved to audit log");

      if (isEditing) {
        setIsEditing(false);
        setEditId(null);
      }

      // Reset Form
      setCurrentFinding({
        title: '',
        category: 'ELECTRICAL',
        severity: 'MEDIUM',
        description: '',
        recommendation: '',
        images: []
      });
    } catch (error) {
      showToast.error("Failed to save finding");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteAudit = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post(`/bookings/${bookingId}/status`, { status: 'IN_PROGRESS' });
      showToast.success("Audit session completed accurately!");
      onComplete();
    } catch (error) {
      showToast.error("Consolidation failed — check network");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (finding: CapturedFinding) => {
    setCurrentFinding(finding);
    setIsEditing(true);
    setEditId(finding.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = (id: string) => {
    setFindings(prev => prev.filter(f => f.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock image upload
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map(() =>
        `https://images.unsplash.com/photo-${1581000000000 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&q=80&w=200`
      );
      setCurrentFinding(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setCurrentFinding(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto pb-48 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="space-y-4 mb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors font-bold text-xs uppercase tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Detail
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display tracking-tighter">Audit Execution — Booking #{bookingId}</h1>
            <p className="text-lg text-slate-500 font-medium">Capture findings, severity, and upload evidence.</p>
          </div>
          <Badge variant="teal">IN_PROGRESS</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10">
        {/* Form Card */}
        <section className="bg-white rounded-[3.5rem] border border-slate-100 p-8 md:p-12 zen-shadow space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 font-display tracking-tight uppercase tracking-widest flex items-center gap-3">
              <Plus className="text-teal-500" size={24} />
              {isEditing ? 'Edit Finding' : 'Capture New Finding'}
            </h2>
            {isEditing && (
              <button onClick={() => {
                setIsEditing(false);
                setEditId(null);
                setCurrentFinding({ title: '', category: 'ELECTRICAL', severity: 'MEDIUM', description: '', recommendation: '', images: [] });
              }} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                Cancel Editing
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Finding Title</label>
              <input
                type="text"
                placeholder="e.g. Main LT Panel terminal lugs show overheating"
                value={currentFinding.title}
                onChange={(e) => setCurrentFinding(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <Dropdown
                className="bg-slate-50 border-2 border-slate-100 rounded-2xl h-[52px]"
                value={currentFinding.category}
                onChange={(e) => setCurrentFinding(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="ELECTRICAL">Electrical</option>
                <option value="SOLAR">Solar</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="IAQ">IAQ</option>
                <option value="SNAGGING">Snag Inspection</option>
              </Dropdown>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Severity Level</label>
              <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border-2 border-slate-100 h-[52px]">
                {(['CRITICAL', 'MEDIUM', 'LOW'] as SeverityLevel[]).map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setCurrentFinding(prev => ({ ...prev, severity: sev }))}
                    className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentFinding.severity === sev
                      ? (sev === 'CRITICAL' ? 'bg-red-500 text-white shadow-lg' : sev === 'MEDIUM' ? 'bg-amber-500 text-white shadow-lg' : 'bg-teal-500 text-white shadow-lg')
                      : 'text-slate-400 hover:bg-white'
                      }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Observation Notes</label>
              <textarea
                rows={4}
                placeholder="Describe the issue, location, impact..."
                value={currentFinding.description}
                onChange={(e) => setCurrentFinding(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidence Capture</label>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 flex flex-col items-center justify-center text-slate-300 hover:text-teal-600 transition-all"
                >
                  <Camera size={24} className="mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Add Photo</span>
                </button>
                <button
                  type="button"
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 opacity-50 cursor-not-allowed"
                >
                  <Video size={24} className="mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Video</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />

                {currentFinding.images?.map((img, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 group shadow-sm">
                    <img src={img} alt="Finding evidence" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recommendation</label>
              <textarea
                rows={3}
                placeholder="Suggested corrective action..."
                value={currentFinding.recommendation}
                onChange={(e) => setCurrentFinding(prev => ({ ...prev, recommendation: e.target.value }))}
                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-sm font-medium text-slate-700 focus:outline-none focus:border-teal-500 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex justify-end">
            <Button
              variant="outline"
              onClick={handleSaveFinding}
              disabled={!currentFinding.title}
              loading={isSaving}
              className="px-12 py-4 border-teal-100 text-teal-600 hover:bg-teal-50 rounded-2xl font-black uppercase tracking-widest text-xs"
            >
              <Save size={18} className="mr-2" /> {isEditing ? 'Update Finding' : 'Save Finding'}
            </Button>
          </div>
        </section>

        {/* Captured Findings List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Captured Findings ({findings.length})</h3>
            {findings.length > 0 && (
              <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1">
                <Clock size={12} /> Auto-saving draft
              </span>
            )}
          </div>

          <div className="space-y-4">
            {findings.map((finding) => (
              <motion.div
                key={finding.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 zen-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:border-teal-100 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${finding.severity === 'CRITICAL' ? 'bg-red-50 text-red-500' : finding.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-500' : 'bg-teal-50 text-teal-500'
                    }`}>
                    {finding.images.length > 0 ? (
                      <div className="relative">
                        <ImageIcon size={20} />
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-teal-600 text-white text-[8px] flex items-center justify-center rounded-full border border-white">{finding.images.length}</span>
                      </div>
                    ) : (
                      <FileText size={20} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-teal-900 transition-colors">{finding.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <SeverityBadge level={finding.severity} />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{finding.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleEdit(finding)}
                    className="p-3 rounded-xl border border-slate-100 text-slate-300 hover:text-teal-600 hover:border-teal-100 transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleRemove(finding.id)}
                    className="p-3 rounded-xl border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}

            {findings.length === 0 && (
              <div className="py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 text-center">
                <AlertCircle size={40} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No findings recorded yet. Start by filling the form above.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-80 p-8 z-50 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.6)] border border-white/5 backdrop-blur-3xl flex flex-col sm:flex-row items-center justify-between gap-8"
          >
            <div className="text-center sm:text-left">
              <p className="text-xs font-black text-teal-400 uppercase tracking-[0.2em] mb-1">Session Active</p>
              <p className="text-2xl font-black text-white font-display tracking-tight">{findings.length} Finding{findings.length !== 1 ? 's' : ''} Captured</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                className="px-8 py-5 border-white/10 text-slate-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                onClick={handleSaveFinding}
                disabled={!currentFinding.title}
                loading={isSaving}
              >
                Save Current Draft
              </Button>
              <Button
                onClick={handleCompleteAudit}
                loading={isSubmitting}
                className="px-12 py-5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black rounded-2xl shadow-2xl shadow-teal-500/20 text-base font-display transition-all duration-500"
              >
                Complete & Generate Report <ArrowRight size={20} className="ml-3" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
