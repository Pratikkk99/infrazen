
import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  Home,
  Zap,
  Sun,
  Droplets,
  Wind,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  FileText,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo';
import { SectionTitle } from './components/SectionTitle';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { Step } from './components/Step';
import { AuthPage } from './AuthPage';
import { LoginPage } from './LoginPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { AdminDashboard } from './AdminDashboard';
import { OrgDashboard } from './OrgDashboard';
import { ExpertDashboard } from './ExpertDashboard';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [view, setView] = useState<'landing' | 'signup' | 'login' | 'forgot-password' | 'admin' | 'org' | 'expert'>('landing');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginSuccess = (role: 'admin' | 'org' | 'expert' = 'admin') => {
    setView(role);
    window.scrollTo(0, 0);
  };

  if (view === 'signup') {
    return <AuthPage onBack={() => setView('landing')} onLogin={() => setView('login')} />;
  }

  if (view === 'login') {
    return (
      <LoginPage
        onBack={() => setView('landing')}
        onSignUp={() => setView('signup')}
        onForgotPassword={() => setView('forgot-password')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (view === 'forgot-password') {
    return <ForgotPasswordPage onBack={() => setView('login')} />;
  }

  if (view === 'admin') {
    return <AdminDashboard onLogout={() => setView('landing')} />;
  }

  if (view === 'org') {
    return <OrgDashboard onLogout={() => setView('landing')} />;
  }

  if (view === 'expert') {
    return <ExpertDashboard onLogout={() => setView('landing')} />;
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      <Toaster position="top-right" />
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{
          y: 0,
          height: scrolled ? '80px' : '96px',
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0)',
          borderBottomColor: scrolled ? 'rgba(241, 245, 249, 1)' : 'rgba(241, 245, 249, 0)'
        }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setView('landing')}>
            <Logo />
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {['who', 'services'].map((section) => (
              <motion.a
                key={section}
                href={`#${section}`}
                whileHover={{ y: -2 }}
                className="text-xs font-bold text-slate-500 hover:text-teal-600 transition-all uppercase tracking-[0.2em] relative group"
              >
                {section === 'who' ? 'Who is this for' : section.charAt(0).toUpperCase() + section.slice(1)}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}
            <div className="h-4 w-px bg-slate-200"></div>
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => setView('login')}
              className="text-xs font-bold text-slate-600 hover:text-teal-600 transition-all uppercase tracking-[0.2em]"
            >
              Login
            </motion.button>
            <Button variant="primary" size="sm" className="px-8 font-display" onClick={() => setView('signup')}>Sign Up</Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-3 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-8 flex flex-col gap-6 shadow-2xl"
            >
              <a href="#who" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-slate-900 py-2 border-b border-slate-50">Who is this for</a>
              <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-slate-900 py-2 border-b border-slate-50">Services</a>
              <button
                onClick={() => { setView('login'); setIsMenuOpen(false); }}
                className="text-xl font-bold text-slate-900 py-2 border-b border-slate-50 text-left"
              >
                Login
              </button>
              <Button variant="primary" className="w-full text-center py-5 text-xl rounded-2xl" onClick={() => { setView('signup'); setIsMenuOpen(false); }}>Sign Up</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative pt-12 pb-32 px-6 lg:px-10 overflow-hidden min-h-[90vh] flex items-center">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.1, 1], x: [0, 40, 0] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute top-[-15%] right-[-5%] w-[70%] h-[70%] bg-teal-50 rounded-full blur-[180px] opacity-70"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], x: [0, -40, 0] }}
              transition={{ duration: 25, repeat: Infinity }}
              className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-slate-100 rounded-full blur-[160px] opacity-50"
            />
          </div>

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-teal-50/50 border border-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-[0.3em] mb-12 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                </span>
                Neutral Technical Audits
              </div>
              <h1 className="text-6xl md:text-[5.5rem] font-extrabold tracking-tight text-slate-900 mb-10 leading-[0.9] font-display">
                From Infrastructure <br />
                <span className="text-teal-600 italic font-semibold">to Insight.</span>
              </h1>
              <p className="text-2xl text-slate-500 mb-14 max-w-xl leading-relaxed font-medium">
                Bridging the gap between complex building systems and verified technical truth for owners and associations.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <Button variant="primary" size="lg" className="px-14 py-6 min-w-[260px] rounded-[2rem] font-display text-xl shadow-2xl shadow-teal-500/30" onClick={() => setView('signup')}>
                  Request an Audit <ArrowRight className="ml-3" size={24} />
                </Button>
                <motion.button
                  whileHover={{ x: 8 }}
                  onClick={() => setView('signup')}
                  className="group flex items-center gap-4 text-sm font-bold text-slate-900 uppercase tracking-widest hover:text-teal-600 transition-all"
                >
                  Join as Expert <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 60 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -30, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-[5rem] shadow-[0_60px_100px_-20px_rgba(15,118,110,0.15)] border-[16px] border-white"
              >
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
                  alt="Modern Infrastructure"
                  className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/30 to-transparent"></div>
              </motion.div>

              <div className="absolute -bottom-12 -left-12 bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] zen-shadow border border-slate-100/50 hidden sm:block shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-teal-500 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                    <ShieldAlert size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Infrastructure Status</p>
                    <p className="text-lg font-bold text-slate-900 font-display">VERIFIED COMPLIANT</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* WHO IS THIS FOR */}
        <section id="who" className="py-40 px-6 lg:px-10 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <SectionTitle subtitle="PARTNERS">
              Tailored Technical Clarity
            </SectionTitle>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mt-4">
              <Card
                image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800"
                icon={<Building2 className="text-teal-600" size={32} />}
                title="Societies"
                description="Comprehensive audits for housing societies to ensure safety, compliance, and long-term asset health."
              />
              <Card
                image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
                icon={<Briefcase className="text-teal-600" size={32} />}
                title="Businesses"
                description="Neutral property inspections to mitigate commercial risks and optimize specialized facility operations."
              />
              <Card
                image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"
                icon={<Home className="text-teal-600" size={32} />}
                title="Home Owners"
                description="Detailed snagging reports and safety audits for villas and apartments during critical handover phases."
              />
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-40 px-6 lg:px-10 bg-white relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <SectionTitle subtitle="EXPERTISE" align="left">
                Precision Diagnostics <br /> for Modern Systems
              </SectionTitle>
              <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed">
                Access a network of verified specialists using cutting-edge sensors to reveal the underlying health of your property.
              </p>
              <div className="space-y-5">
                {[
                  { name: 'Electrical Safety & IR', icon: <Zap size={20} /> },
                  { name: 'Solar Yield Optimization', icon: <Sun size={20} /> },
                  { name: 'Plumbing & Leakage Diagnostics', icon: <Droplets size={20} /> },
                ].map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:border-teal-300 transition-all zen-shadow cursor-default group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm"
                    >
                      {item.icon}
                    </motion.div>
                    <span className="text-lg font-bold text-slate-900 tracking-tight">{item.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-8 h-full">
                <div className="space-y-8 pt-16">
                  <motion.div
                    whileHover={{ y: -15 }}
                    className="bg-teal-50 rounded-[4rem] p-12 border border-teal-100 flex flex-col h-80 justify-between zen-shadow"
                  >
                    <Zap className="text-teal-600" size={48} />
                    <h4 className="text-3xl font-extrabold text-slate-900 tracking-tighter leading-none">Thermal <br /> Mapping</h4>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -15 }}
                    className="bg-slate-900 rounded-[4rem] p-12 flex flex-col h-80 justify-between shadow-2xl"
                  >
                    <Wind className="text-teal-400" size={48} />
                    <h4 className="text-3xl font-extrabold text-white tracking-tighter leading-none">IAQ <br /> Monitoring</h4>
                  </motion.div>
                </div>
                <div className="space-y-8">
                  <motion.div
                    whileHover={{ y: -15 }}
                    className="bg-slate-100 rounded-[4rem] p-12 border border-slate-200 flex flex-col h-96 justify-between zen-shadow overflow-hidden group"
                  >
                    <ClipboardCheck className="text-slate-500 group-hover:text-teal-600 transition-colors" size={48} />
                    <h4 className="text-3xl font-extrabold text-slate-900 tracking-tighter leading-none">Technical <br /> Snagging</h4>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -15 }}
                    className="bg-white rounded-[4rem] p-12 border border-slate-100 flex flex-col h-72 justify-between zen-shadow hover:border-teal-300 transition-all group"
                  >
                    <Sun className="text-amber-500 group-hover:scale-110 transition-transform" size={48} />
                    <h4 className="text-3xl font-extrabold text-slate-900 tracking-tighter leading-none">Energy <br /> Profiling</h4>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-48 px-6 lg:px-10 bg-teal-50/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent"></div>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <SectionTitle subtitle="PROCESS">
              The Zen Pipeline to Clarity
            </SectionTitle>

            <div className="relative mt-24 flex flex-col lg:flex-row justify-between items-start gap-12 px-4">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                style={{ originX: 0 }}
                className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-teal-500/0 via-teal-500/30 to-teal-500/0 -z-0"
              />

              <Step number={1} title="Scope Definition" description="Define your audit requirements and specific technical pain points." />
              <Step number={2} title="Expert Match" description="Get paired with a verified, neutral domain specialist for your needs." />
              <Step number={3} title="Field Audit" description="Deep onsite inspection utilizing high-end diagnostic hardware." />
              <Step number={4} title="Final Insight" description="Receive your verified, technical report with clear evidence." />
            </div>

            <div className="mt-32 pt-16 border-t border-slate-200/50 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -8, zIndex: 10, scale: 1.1 }}
                      className="w-14 h-14 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-xl"
                    >
                      <img src={`https://i.pravatar.cc/150?img=${i + 15}`} alt="Expert" className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Global Network</p>
                  <p className="text-sm font-bold text-slate-700">150+ Certified Domain Experts Online</p>
                </div>
              </div>
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:border-teal-600 font-display text-lg px-12 py-5 rounded-2xl">
                View Sample Report
              </Button>
            </div>
          </div>
        </section>

        {/* WHY infra2zen */}
        <section className="py-40 px-6 lg:px-10 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-32 items-center">
            <div className="space-y-12">
              <SectionTitle subtitle="OUR PHILOSOPHY" align="left">
                Technical Integrity <br /> Without Compromise
              </SectionTitle>

              <div className="space-y-10">
                {[
                  { title: 'Independent Experts', desc: 'Our auditors work exclusively for the client, not the builder or vendor. 100% neutral.' },
                  { title: 'Conflict-Free Model', desc: 'We only provide audits. We do not sell repairs, maintenance, or equipment.' },
                  { title: 'Verified Evidence', desc: 'Every claim is backed by sensor logs, high-res thermal scans, and digital checklists.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.8 }}
                    className="flex gap-8 group"
                  >
                    <div className="shrink-0 w-16 h-16 rounded-[1.5rem] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500 shadow-md">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight font-display">{item.title}</h4>
                      <p className="text-lg text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="relative"
            >
              <div className="bg-teal-50/50 p-6 rounded-[4rem] relative">
                <div className="rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-[3/4]">
                  <img
                    src="/audit_accuracy_new.jpg"
                    alt="Audit Accuracy"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute -top-12 -right-12 bg-[#0A192F] text-white p-10 rounded-[3.5rem] shadow-2xl hidden lg:block max-w-[280px]">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-8">
                    <CheckCircle2 size={24} />
                  </div>
                  <h5 className="text-2xl font-bold tracking-tight mb-4 font-display leading-tight">Neutrality <br />Guarantee</h5>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">We reveal the truth so you can make informed decisions without vendor pressure.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 lg:px-10 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto bg-[#0A192F] rounded-[5rem] py-32 px-10 text-center relative overflow-hidden group shadow-2xl shadow-slate-900/40"
          >
            <motion.div
              animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.3, 1] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-teal-500 rounded-full blur-[180px]"
            />

            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-6xl md:text-[5.5rem] font-black text-white mb-12 tracking-tight leading-[0.95] font-display">
                Ready to find <br /> <span className="text-teal-400 italic">your clarity?</span>
              </h2>
              <p className="text-2xl text-slate-400 mb-16 font-medium leading-relaxed max-w-2xl mx-auto">
                Join hundreds of managed properties that rely on infra2zen for verified technical insight and peace of mind.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                <Button variant="primary" size="lg" className="px-16 py-7 rounded-[2rem] bg-teal-500 hover:bg-teal-400 shadow-2xl shadow-teal-500/30 text-2xl font-display" onClick={() => setView('signup')}>
                  Start Audit Request
                </Button>
                <motion.button
                  whileHover={{ borderColor: "#2dd4bf", color: "#2dd4bf", x: 5 }}
                  onClick={() => setView('signup')}
                  className="px-12 py-7 text-sm font-bold text-white border-2 border-slate-700 rounded-[2rem] transition-all uppercase tracking-[0.3em] font-display"
                >
                  Join as Expert
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-32 pb-20 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-20 lg:gap-40 mb-24">
            <div className="max-w-sm space-y-8">
              <Logo />
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                The global standard for independent infrastructure monitoring and technical audits. Restoring trust in building systems.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-32">
              <div className="space-y-8">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Platform</h5>
                <ul className="space-y-5">
                  <li><a href="#who" className="text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors uppercase tracking-widest">Audits</a></li>
                  <li><a href="#services" className="text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors uppercase tracking-widest">Expert Network</a></li>
                  <li><a href="#" className="text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors uppercase tracking-widest">Case Studies</a></li>
                </ul>
              </div>
              <div className="space-y-8">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Resources</h5>
                <ul className="space-y-5">
                  <li><a href="#" className="text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors uppercase tracking-widest">Blog</a></li>
                  <li><a href="#" className="text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors uppercase tracking-widest">Help Center</a></li>
                  <li><a href="#" className="text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors uppercase tracking-widest">Safety Standards</a></li>
                </ul>
              </div>
              <div className="space-y-8">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Internal</h5>
                <ul className="space-y-5">
                  <li>
                    <button
                      onClick={() => setView('admin')}
                      className="flex items-center gap-3 text-sm font-bold text-teal-600 hover:text-teal-700 transition-all uppercase tracking-widest"
                    >
                      <ShieldAlert size={16} /> Admin Panel
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-12 pt-12 border-t border-slate-50">
            <div className="flex items-center gap-10">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em]">
                &copy; {new Date().getFullYear()} infra2zen
              </p>
              <div className="h-1.5 w-12 rounded-full bg-teal-100 hidden sm:block" />
            </div>

            <div className="flex gap-12 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-teal-600 transition-colors">Legal Terms</a>
              <a href="#" className="hover:text-teal-600 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
