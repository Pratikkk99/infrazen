
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Award, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { Dropdown } from './components/Dropdown';
import { showToast } from './utils/demo';
import { apiClient } from './utils/apiClient';

export const ExpertProfileScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '5',
    bio: '',
    skills: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user data from localStorage as a base
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Fetch expert profile details
        const bookings = await apiClient.get('/bookings'); // Just to get a hint of roles, but we need a profile endpoint
        // Actually let's assume we can get profile via a new endpoint or just use user data

        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        }));
      } catch (error) {
        showToast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/expert/profile', formData);
      showToast.success("Profile saved successfully");
    } catch (error) {
      showToast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b-4 border-slate-900">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Auditor Profile</h1>
          <p className="text-xl text-slate-500 font-bold uppercase tracking-widest mt-2">Manage your professional identity</p>
        </div>
        <div className="flex items-center gap-3 bg-teal-50 px-6 py-3 rounded-2xl border border-teal-100">
          <CheckCircle2 className="text-teal-600" size={24} />
          <span className="text-teal-700 font-black uppercase tracking-widest text-sm text-nowrap">Verified Expert</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Personal info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 zen-shadow group">
            <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 mx-auto mb-8 group-hover:border-teal-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-all duration-500 cursor-pointer overflow-hidden">
              <User size={48} />
            </div>
            <h3 className="text-center font-black text-slate-900 text-xl mb-1">{formData.name}</h3>
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">System Auditor ID: #EXP-9302</p>

            <div className="space-y-6 pt-6 border-t border-slate-50">
              <Input label="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} icon={<User size={16} />} />
              <Input label="Direct Email" value={formData.email} disabled icon={<Mail size={16} />} />
              <Input label="Mobile Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} icon={<Phone size={16} />} />
            </div>
          </div>
        </div>

        {/* Right Column: Professional info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Award size={160} />
            </div>
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center">
                  <Briefcase size={24} className="text-slate-900" />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight">Professional Standing</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Dropdown
                  className="bg-white/5 border-white/10 text-white"
                  label="Experience Level"
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                >
                  <option value="1">1-3 Years (Junior)</option>
                  <option value="5">5-8 Years (Intermediate)</option>
                  <option value="10">10+ Years (Senior Lead)</option>
                  <option value="20">Expert Emeritus</option>
                </Dropdown>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 ml-1">Current Skill Mapping</label>
                  <div className="flex flex-wrap gap-2">
                    {['STP', 'Fire Safety', 'Electrical Audit'].map(s => (
                      <span key={s} className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold border border-white/5">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 ml-1">Professional Biography</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 h-40"
                  placeholder="Briefly describe your specialization and key projects..."
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-4">
            <Button variant="ghost" className="px-10 py-5 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest">Discard Changes</Button>
            <Button
              loading={isSaving}
              type="submit"
              className="bg-slate-900 text-teal-400 hover:bg-black px-16 py-5 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl"
            >
              Commit Profile
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
