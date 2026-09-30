import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Search, Clock, UserCheck, Truck,
  CheckCircle2, Phone, Mail, BadgeInfo, Shield, Volume2, BookOpen,
  ChevronLeft, ChevronRight, Zap, Users, Trash2, Lock, User,
  Eye, EyeOff, Briefcase
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import TextCaptcha from '../components/TextCaptcha';
import FundUtilizationView from '../components/FundUtilizationView';
import RoorkeeMap from '../components/RoorkeeMap';

// ─── Live Clock ──────────────────────────────────────────────────────────────
const LiveClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  return (
    <div className="w-full bg-[#0f2447] border-t border-blue-900 py-3 px-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-green-300 text-xs font-bold uppercase tracking-widest">Live Time</span>
      </div>
      <span className="text-white font-black text-2xl font-mono tracking-widest">{timeStr}</span>
      <span className="text-blue-300 text-sm font-semibold">{dateStr}</span>
    </div>
  );
};

// ─── Mini Calendar ───────────────────────────────────────────────────────────
const MiniCalendar = () => {
  const [current, setCurrent] = useState(new Date());
  const today = new Date();
  const year  = current.getFullYear();
  const month = current.getMonth();
  const monthName  = current.toLocaleString('default', { month: 'long' });
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  const isToday = (d) => d && today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-green-700 text-white flex items-center justify-between px-5 py-3">
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="hover:bg-green-600 rounded-lg p-1 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
        <span className="font-bold text-sm tracking-wide">{monthName} {year}</span>
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="hover:bg-green-600 rounded-lg p-1 transition-colors"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 bg-green-50 px-3 pt-3">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-green-700 pb-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 px-3 py-2">
        {days.map((d, i) => (
          <div key={i} className={`text-center text-sm py-1.5 font-medium cursor-pointer rounded-full transition-colors ${
            !d ? '' : isToday(d)
              ? 'bg-green-700 text-white font-bold'
              : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
          }`}>{d || ''}</div>
        ))}
      </div>
      <div className="border-t border-gray-100 px-5 py-2.5 text-center bg-gray-50">
        <span className="text-xs text-green-700 font-bold">
          Today: {today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

// ─── Brand Title (matches logo) ──────────────────────────────────────────────
// dark=false → white text (for dark/blue backgrounds like footer & sidebar)
// dark=true  → navy text  (for light/white backgrounds like header)
const BrandTitle = ({ size = 'lg', dark = true }) => {
  const sizes = { sm: 'text-xl', lg: 'text-2xl sm:text-3xl', xl: 'text-3xl sm:text-4xl' };
  return (
    <span className={`font-black tracking-tight ${sizes[size]}`}>
      <span className={dark ? 'text-[#1a3a6b]' : 'text-white'}>Waste</span>
      <span className="text-[#f97316]">2</span>
      <span className={dark ? 'text-[#1a3a6b]' : 'text-white'}>Watt</span>
    </span>
  );
};

// ─── Main Landing Page ───────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const { complaints, tasks, staffList } = useAppContext();

  const [trackId, setTrackId]                     = useState('');
  const [searchedComplaint, setSearchedComplaint] = useState(null);
  const [hasSearched, setHasSearched]             = useState(false);
  const [captchaVerified, setCaptchaVerified]     = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [views, setViews]                         = useState(15420);
  const [energyGenerated, setEnergyGenerated]     = useState(12845);
  const [activeNavTab, setActiveNavTab]           = useState('home'); // track active nav tab

  // Slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: 'Smart Waste to Energy Initiative',
      desc:  "Nagar Nigam Roorkee's flagship project converting municipal solid waste into clean green electricity, powering the entire city grid.",
      badge: 'Flagship Project',
      tagline: '⚡ 12,000+ kWh Clean Power Generated',
      cta: 'Learn More',
      action: () => document.getElementById('handbook-section')?.scrollIntoView({ behavior: 'smooth' }),
      bg: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
    },
    {
      title: 'Real-Time IoT Dustbin Monitoring',
      desc:  '24/7 ultrasonic sensors monitor bin fill-levels across all 40 wards. Auto-dispatch fires automatically when a bin crosses 90% capacity.',
      badge: 'Smart Cities Mission',
      tagline: '📡 Live Tracking Across All 40 Wards',
      cta:  'IoT Dashboard',
      action: () => navigate('/login'),
      bg: 'linear-gradient(135deg, #0f4c75 0%, #1b6ca8 50%, #1e7a3e 100%)',
    },
    {
      title: 'Citizen Grievance Redressal',
      desc:  'File waste complaints with GPS coordinates and photos. Our field teams respond with mandatory photo proof for every complaint closure.',
      badge: 'Citizen Services',
      tagline: '📝 94% On-Time Complaint Resolution',
      cta:  'Register Issue',
      action: () => navigate('/register-complaint'),
      bg: 'linear-gradient(135deg, #1e3a5f 0%, #1a6b3a 50%, #166534 100%)',
    },
  ];

  // Flipbook
  const [flipbookPage, setFlipbookPage] = useState(0);

  // Login state
  const [loginRole, setLoginRole]   = useState('mayor');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass]   = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loginError, setLoginError] = useState('');
  const { setUser } = useAppContext();

  const loginRoles = [
    { id: 'mayor',           label: 'Mayor',           icon: Shield },
    { id: 'service-men',     label: 'Service Men',     icon: Briefcase },
    { id: 'collector',       label: 'Waste Collector', icon: Users },
    { id: 'vehicle-manager', label: 'Vehicle Manager', icon: Truck },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    if (loginRole === 'mayor') {
      if (loginEmail === 'mayor@mcr.gov.in' && loginPass === 'password') {
        setUser({ role: loginRole, email: loginEmail, name: 'Mayor Amit' });
        return navigate(`/${loginRole}`);
      }
      return setLoginError('Invalid username/email or password.');
    } else {
      const foundUser = staffList.find(s => s.email === loginEmail);
      if (foundUser) {
        const userPass = foundUser.password || 'password';
        if (loginPass !== userPass) return setLoginError('Invalid username/email or password.');
        setUser({ role: loginRole, email: loginEmail, name: foundUser.name, id: foundUser.id });
        return navigate(`/${loginRole}`);
      }
    }
    setLoginError('Invalid username/email or password.');
  };

  useEffect(() => {
    const v = setInterval(() => setViews(p => Math.min(p + Math.floor(Math.random() * 3), 16000)), 5000);
    const e = setInterval(() => setEnergyGenerated(p => p + Math.floor(Math.random() * 2) + 1), 8000);
    const s = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 6000);
    return () => { clearInterval(v); clearInterval(e); clearInterval(s); };
  }, []);

  const handleTrack = () => {
    if (!trackId.trim()) return;
    const found = complaints.find(c =>
      (c.id  && c.id.toLowerCase()  === trackId.trim().toLowerCase()) ||
      (c._id && c._id.toString()    === trackId.trim())
    );
    setSearchedComplaint(found || null);
    setHasSearched(true);
  };
  const getTrackingStep = (complaint) => {
    if (complaint.status === 'Resolved') return 4;
    const lt = tasks.find(t => t.linkedComplaintId === complaint.id || t.linkedComplaintId === complaint._id);
    if (!lt) return 1;
    const st = lt.status.toLowerCase();
    if (st === 'assigned') return 2;
    if (['active','completed','pending verification','completed_late'].includes(st)) return 3;
    return 1;
  };
  const getAssignedStaff = (c) => {
    const lt = tasks.find(t => t.linkedComplaintId === c.id);
    const aid = lt?.assignedToId || lt?.assignedTo;
    if (!lt || !aid) return null;
    return staffList.find(s => s.id === aid) || null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">

      {/* ── 1. GOI TOP BAR ───────────────────────────────────────────────── */}
      <div className="bg-[#1a3a6b] text-white text-xs py-2 px-6 flex items-center justify-between">
        <span className="font-semibold tracking-wide">Government of Uttarakhand, India</span>
        <div className="hidden sm:flex items-center gap-3 text-blue-200 text-[11px]">
          <span className="hover:text-white cursor-pointer transition-colors">Skip to Content</span>
          <span className="text-blue-400">|</span>
          <span className="hover:text-white cursor-pointer transition-colors">Screen Reader</span>
          <span className="text-blue-400">|</span>
          <div className="flex gap-1">
            {['A-','A','A+'].map(a => (
              <button key={a} className="bg-blue-800/60 hover:bg-blue-700 px-2 py-0.5 rounded text-[11px] font-bold transition-colors">{a}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. HEADER ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b-[5px] border-green-600 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          {/* Logo + Brand row */}
          <div className="flex items-center justify-between py-4 sm:py-5 border-b border-gray-100">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden border-2 sm:border-4 border-green-600 shadow-lg bg-white p-0.5">
                <img src="/logo.jpg" alt="Waste2Watt Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <BrandTitle size="lg" />
                <p className="text-[9px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5 sm:mt-1">Smart Segregation, Clean Gen</p>
                <p className="hidden sm:block text-[11px] text-gray-400 mt-0.5">Nagar Nigam Roorkee · Uttarakhand · India</p>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-1">
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">24/7 Citizen Helpline</div>
              <div className="text-green-700 font-black text-3xl">1800-123-4567</div>
              <div className="text-xs text-gray-400">Monday – Saturday &nbsp;·&nbsp; 9 AM – 6 PM</div>
            </div>
          </div>
        </div>
        {/* Nav (Full Width Green Bar) */}
        <div className="bg-green-700 w-full shadow-inner overflow-x-auto border-t border-green-800">
          <nav className="flex gap-2 p-2 max-w-7xl mx-auto px-6">
            {[
              { id: 'home',     label: '🏠 Home',                action: () => { setActiveNavTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
              { id: 'grievance',label: '📋 Register Grievance',  action: () => { navigate('/register-complaint'); } },
              { id: 'track',    label: '🔍 Track Status',        action: () => { setShowTrackingModal(true); } },
              { id: 'map',      label: '🗺️ City Map',            action: () => { setActiveNavTab('map'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
              { id: 'funds',    label: '💰 Fund Utilization',    action: () => { setActiveNavTab('funds'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
              { id: 'handbook', label: '📖 Citizen Handbook',    action: () => { setActiveNavTab('home'); setTimeout(() => document.getElementById('handbook-section')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
              { id: 'contact',  label: '📞 Contact Us',          action: () => { setActiveNavTab('home'); setTimeout(() => document.getElementById('footer-section')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
            ].map((item) => (
              <button key={item.id} onClick={item.action}
                className={`whitespace-nowrap flex-1 px-4 py-3 text-sm font-black transition-all duration-300 rounded-xl ${
                  activeNavTab === item.id
                    ? 'bg-white text-green-800 shadow-md scale-105 z-10'
                    : 'bg-transparent text-green-50 hover:bg-green-600 hover:scale-105 hover:text-white'
                }`}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── CONDITIONAL CONTENT ──────────────────────────────────────────── */}
      {activeNavTab === 'funds' ? (
        <div className="flex-1 bg-gray-50 flex flex-col py-8 animate-fade-in w-full">
          <FundUtilizationView />
        </div>
      ) : activeNavTab === 'map' ? (
        <div className="flex-1 bg-gray-50 flex flex-col py-8 animate-fade-in w-full animate-in fade-in zoom-in duration-500">
          <RoorkeeMap />
        </div>
      ) : (
        <>
          {/* ── 3. NEWS TICKER ───────────────────────────────────────────────── */}
      <div className="bg-green-50 border-b border-green-200 py-2.5 px-6 flex items-center gap-4 overflow-hidden">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-white bg-green-700 px-3 py-1.5 rounded-lg shrink-0 shadow-sm">
          <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Live
        </div>
        <div className="flex-1 overflow-hidden">
          <span className="inline-block text-sm text-gray-700 font-medium animate-marquee pl-[100%] whitespace-nowrap">
            📢 Mandatory source segregation: Dry waste → Blue Bin &nbsp;|&nbsp; Wet waste → Green Bin across all 40 wards. &nbsp;&nbsp;&nbsp;
            ⚡ Waste2Watt plant crosses 12,000+ kWh electricity milestone! &nbsp;&nbsp;&nbsp;
            📡 4 new IoT smart dustbins deployed: Station Road · Civil Lines · Sector-4 · IIT Roorkee. &nbsp;&nbsp;&nbsp;
            🏆 Roorkee awarded Best Smart City Waste Management 2025.
          </span>
        </div>
      </div>

      {/* ── 4. HERO SLIDESHOW (Full Width) ───────────────────────────────── */}
      <section className="w-full">
        <div className="relative w-full h-80 sm:h-96 md:h-[440px] overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col items-center justify-center text-center px-8 transition-all duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{ background: slide.bg }}
            >
              {/* Dot pattern overlay */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                <span className="bg-white/20 border border-white/40 text-white text-xs font-bold uppercase tracking-[0.15em] px-5 py-2 rounded-full mb-5 backdrop-blur-sm">
                  {slide.badge}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow">
                  {slide.title}
                </h2>
                <p className="text-base sm:text-lg text-white/85 max-w-2xl mb-4 leading-relaxed">
                  {slide.desc}
                </p>
                <div className="text-sm text-white font-bold bg-black/25 backdrop-blur-sm px-5 py-2 rounded-full mb-8">
                  {slide.tagline}
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
                  <button onClick={slide.action}
                    className="w-full sm:w-auto bg-white text-green-800 font-bold px-8 py-3.5 sm:py-3 rounded-xl text-sm hover:bg-green-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    {slide.cta}
                  </button>
                  <button onClick={() => navigate('/register-complaint')}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 sm:py-3 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> File Complaint
                  </button>
                </div>
              </div>
            </div>
          ))}
          {/* Arrows */}
          <button onClick={() => setCurrentSlide(p => (p - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentSlide(p => (p + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all backdrop-blur-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2.5 z-20">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-white w-8' : 'bg-white/45 w-2.5 hover:bg-white/70'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. THREE ACTION CARDS (Full Width) ───────────────────────────── */}
      <section className="bg-white border-y border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle, color: 'red',
                title: 'Register Waste Issue',
                desc: 'Notice an overflowing dustbin or an unswept road? Submit a complaint ticket with your GPS location and photos for immediate cleanup.',
                cta: 'File a Complaint →',
                action: () => navigate('/register-complaint'),
              },
              {
                icon: Search, color: 'blue',
                title: 'Track Your Complaint',
                desc: 'Already lodged a complaint? Enter your ticket ID to view real-time status, the assigned field worker, and photo verification of work done.',
                cta: 'Track Status →',
                action: () => setShowTrackingModal(true),
              },
              {
                icon: Zap, color: 'green',
                title: 'Staff Authority Console',
                desc: 'Access the live IoT monitoring dashboard, manage smart bin dispatch queues, and review energy generation analytics — all in one place.',
                cta: 'Login to Dashboard →',
                action: () => navigate('/login'),
              },
            ].map(({ icon: Icon, color, title, desc, cta, action }) => (
              <div key={title} onClick={action}
                className="group border border-gray-200 rounded-2xl p-8 cursor-pointer hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 bg-white relative overflow-hidden">
                {/* Background accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 ${
                  color === 'red' ? 'bg-red-500' : color === 'blue' ? 'bg-blue-500' : 'bg-green-600'
                }`} />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                  color === 'red' ? 'bg-red-50' : color === 'blue' ? 'bg-blue-50' : 'bg-green-50'
                }`}>
                  <Icon className={`w-7 h-7 ${
                    color === 'red' ? 'text-red-600' : color === 'blue' ? 'text-blue-600' : 'text-green-700'
                  }`} />
                </div>
                <h3 className="font-black text-lg text-gray-800 mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{desc}</p>
                <span className={`text-sm font-bold group-hover:underline transition-colors ${
                  color === 'red' ? 'text-red-600' : color === 'blue' ? 'text-blue-600' : 'text-green-700'
                }`}>{cta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. STAFF LOGIN SECTION (Full Width) ──────────────────────────── */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left: Login Info */}
            <div className="lg:w-2/5 space-y-6">
              <div>
                <span className="text-xs font-bold text-green-700 uppercase tracking-widest bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">Staff Portal</span>
                <h2 className="text-3xl font-black text-gray-800 mt-4 mb-3">
                  Authority Dashboard Login
                </h2>
                <p className="text-gray-500 leading-relaxed">
                  Secure access for Nagar Nigam Roorkee staff members. Login to manage waste collection tasks, view IoT monitoring data, dispatch field workers, and track citizen grievances in real time.
                </p>
              </div>
              {/* Feature bullets */}
              <div className="space-y-4">
                {[
                  { icon: Zap,    label: 'Live IoT Monitoring',    desc: 'Real-time bin fill-levels across all wards' },
                  { icon: Users,  label: 'Worker Dispatch',        desc: 'Assign & track field staff instantly' },
                  { icon: Search, label: 'Complaint Management',   desc: 'Review, assign and close grievances' },
                  { icon: Truck,  label: 'Vehicle Tracking',       desc: 'Monitor collection routes live' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-800">{label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Login Form */}
            <div className="lg:w-3/5 w-full">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
                <div className="bg-[#1a3a6b] px-8 py-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-black text-lg"><BrandTitle size="sm" /></div>
                    <div className="text-blue-200 text-xs font-semibold mt-0.5">Staff Authentication Portal</div>
                  </div>
                </div>

                <div className="p-8">
                  {loginError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
                      ⚠️ {loginError}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-6">
                    {/* Role selector */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Select Your Role</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {loginRoles.map(r => {
                          const Icon = r.icon;
                          return (
                            <button key={r.id} type="button" onClick={() => setLoginRole(r.id)}
                              className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 text-xs font-bold transition-all ${
                                loginRole === r.id
                                  ? 'border-green-600 bg-green-50 text-green-700 shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:text-green-600'
                              }`}>
                              <Icon className="w-5 h-5" />
                              <span className="text-center leading-tight">{r.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email / Username</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input required type="text" placeholder="Enter your email or username"
                          value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-gray-50 transition-all" />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input required type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                          value={loginPass} onChange={e => setLoginPass(e.target.value)}
                          className="w-full pl-11 pr-12 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-gray-50 transition-all" />
                        <button type="button" onClick={() => setShowPass(p => !p)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700 transition-colors">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button type="submit"
                      className="w-full bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-black py-4 rounded-xl text-base transition-all shadow-md hover:shadow-lg">
                      Login to Dashboard →
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. CALENDAR SECTION (Full Width) ─────────────────────────────── */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Calendar */}
            <div className="lg:w-2/5 w-full">
              <div className="mb-6">
                <span className="text-xs font-bold text-green-700 uppercase tracking-widest bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">Events & Schedule</span>
                <h2 className="text-3xl font-black text-gray-800 mt-4 mb-2">Municipal Calendar</h2>
                <p className="text-gray-500 text-sm">Track upcoming cleanups, ward meetings, and IoT maintenance schedules.</p>
              </div>
              <MiniCalendar />
            </div>

            {/* Alerts + Quick Links side by side */}
            <div className="lg:w-3/5 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Citizen Alerts */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-red-600 text-white px-5 py-4 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Citizen Alerts
                </div>
                <ul>
                  {[
                    { text: 'Bin overflow: Station Road, Ward 12', time: '2 hrs ago',  dot: 'red' },
                    { text: 'IoT Node offline: Civil Lines Bin #7',time: '5 hrs ago',  dot: 'yellow' },
                    { text: '4 new IoT bins deployed: Sector-4',   time: '1 day ago',  dot: 'green' },
                    { text: 'Cleanup scheduled: Gandhi Chowk',     time: '2 days ago', dot: 'blue' },
                  ].map((a, i) => (
                    <li key={i} className="px-5 py-4 flex items-start gap-3 border-b border-gray-100 last:border-0">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        a.dot==='red'?'bg-red-500':a.dot==='yellow'?'bg-yellow-500':a.dot==='blue'?'bg-blue-500':'bg-green-500'
                      }`} />
                      <div>
                        <p className="text-sm text-gray-700 font-medium leading-snug">{a.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Links + Numbers */}
              <div className="space-y-5">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-green-700 text-white px-5 py-4 font-bold text-sm uppercase tracking-wider">Quick Links</div>
                  <ul>
                    {[
                      { label: '📋 Register Complaint', action: () => navigate('/register-complaint') },
                      { label: '🔍 Track Status',       action: () => setShowTrackingModal(true) },
                      { label: '🔒 Staff Login',        action: () => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' }) },
                      { label: '📖 Citizen Handbook',   action: () => document.getElementById('handbook-section')?.scrollIntoView({ behavior: 'smooth' }) },
                    ].map((item, i) => (
                      <li key={i} className="border-b border-gray-100 last:border-0">
                        <button onClick={item.action}
                          className="w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 font-medium transition-colors flex items-center justify-between group">
                          {item.label}
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#1a3a6b] text-white rounded-2xl p-5 text-center shadow-sm">
                  <Phone className="w-7 h-7 mx-auto mb-2 text-blue-300" />
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">24/7 Toll-Free</div>
                  <div className="text-2xl font-black">1800-123-4567</div>
                  <div className="text-xs text-blue-300 mt-1">Free Citizen Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FLIPBOOK / CITIZEN HANDBOOK ───────────────────────────────── */}
      <section id="handbook-section" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">Interactive Guide</span>
            <h2 className="text-3xl font-black text-gray-800 mt-4 mb-2">Citizen Handbook &amp; Waste Guidelines</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Flip through our comprehensive guide on waste management, IoT monitoring, source segregation rules, and clean energy generation.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
            <div className="bg-green-700 text-white px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                <div>
                  <span className="font-black text-lg">Waste2Watt Citizen Handbook</span>
                  <p className="text-green-200 text-xs mt-0.5">Smart Waste Management · Nagar Nigam Roorkee</p>
                </div>
              </div>
              <span className="text-green-200 text-sm font-bold">Spread {flipbookPage + 1} / 3</span>
            </div>

            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-6 min-h-[280px]">
                {/* Left Page */}
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col justify-between">
                  {flipbookPage === 0 && (
                    <div className="flex flex-col items-center justify-center text-center h-full space-y-5 animate-fade-in">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-700 shadow-lg">
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <BrandTitle size="lg" />
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Smart Segregation, Clean Generation</p>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-xs">A guide for citizens of Roorkee on waste participation, source segregation, and clean power generation.</p>
                      <span className="text-sm text-green-700 font-bold border border-green-200 bg-green-50 px-4 py-2 rounded-full">📖 Use arrows below to flip pages →</span>
                    </div>
                  )}
                  {flipbookPage === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      <span className="inline-block text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">Section 1: Our Mission</span>
                      <h4 className="text-xl font-black text-gray-800">Generating Green Electricity</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">The Waste2Watt initiative is a landmark project by Nagar Nigam Roorkee. By processing organic and solid waste through bio-digestion and thermal extraction, we capture methane gas and generate clean steam to drive turbines.</p>
                      <p className="text-sm text-gray-600 leading-relaxed">This electricity feeds directly into local neighborhood grids — lighting streets and civic clinics at low cost.</p>
                      <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-sm text-gray-600">
                        🎯 <b>Goal:</b> Divert 100% of city waste from landfills and generate 50 kW of continuous clean power.
                      </div>
                    </div>
                  )}
                  {flipbookPage === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      <span className="inline-block text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">Section 3: Segregation Rules</span>
                      <h4 className="text-xl font-black text-gray-800">Waste Segregation Protocol</h4>
                      <p className="text-sm text-gray-600">Power generation efficiency depends entirely on correct waste sorting at source. All citizens must strictly follow:</p>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                          <span className="w-4 h-4 rounded-full bg-green-500 mt-0.5 shrink-0"></span>
                          <div><b className="text-gray-800">Green Bin (Wet Waste):</b><p className="text-sm text-gray-600 mt-1">Kitchen scraps, tea leaves, vegetables, fruits, and all organic waste — processed for bio-energy production.</p></div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <span className="w-4 h-4 rounded-full bg-blue-500 mt-0.5 shrink-0"></span>
                          <div><b className="text-gray-800">Blue Bin (Dry Waste):</b><p className="text-sm text-gray-600 mt-1">Plastics, paper, metals, cardboard, and all recyclable packaging materials.</p></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <span className="text-xs text-gray-400 font-bold mt-4">Page {flipbookPage * 2 + 1}</span>
                </div>

                {/* Book Spine */}
                <div className="hidden md:flex flex-col items-center justify-center w-8">
                  <div className="h-full w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                </div>

                {/* Right Page */}
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col justify-between">
                  {flipbookPage === 0 && (
                    <div className="space-y-5 animate-fade-in">
                      <span className="inline-block text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">Introduction</span>
                      <h4 className="text-xl font-black text-gray-800">Nagar Nigam Roorkee</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Dear Citizens of Roorkee,</p>
                      <p className="text-sm text-gray-600 leading-relaxed">Cleanliness is the cornerstone of progress. With the Waste2Watt initiative, we are integrating cutting-edge IoT technology with municipal waste management to convert waste from a liability into a powerful sustainable asset for our city.</p>
                      <p className="text-sm text-gray-600 leading-relaxed">Together, we can make Roorkee a shining model of smart governance for all of Uttarakhand.</p>
                      <div className="pt-4 border-t border-gray-200 text-sm text-gray-400 italic">— Municipal Commissioner, Roorkee.</div>
                    </div>
                  )}
                  {flipbookPage === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      <span className="inline-block text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">Section 2: IoT Network</span>
                      <h4 className="text-xl font-black text-gray-800">Live Ultrasonic Dustbin Nodes</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Our smart bins are equipped with solar-powered microcontroller nodes that transmit real-time fill heights to the municipal control center every 5 seconds.</p>
                      <div className="space-y-3">
                        {[
                          { color: 'bg-gray-400',  label: '0–75%',  status: 'Normal — No action needed' },
                          { color: 'bg-yellow-500', label: '75–90%', status: 'Alert — Under close monitoring' },
                          { color: 'bg-red-500',    label: '>90%',   status: 'Critical — Auto-dispatch triggered!', pulse: true },
                        ].map(({ color, label, status, pulse }) => (
                          <div key={label} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl">
                            <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${color} ${pulse ? 'animate-pulse' : ''}`} />
                            <span className="text-sm font-bold text-gray-700 w-14">{label}</span>
                            <span className="text-sm text-gray-500">{status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {flipbookPage === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      <span className="inline-block text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">Section 4: Helplines</span>
                      <h4 className="text-xl font-black text-gray-800">Important Contact Directories</h4>
                      <p className="text-sm text-gray-600">For waste problems, bin blockages, or technical failures, reach our helplines directly:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[['🚨 Emergency', '1800-123-4567'], ['📞 Citizen Center', '14420'], ['👩 Women Helpline', '1091'], ['✉️ Office Email', 'help@w2w.in']].map(([k, v]) => (
                          <div key={k} className="p-4 rounded-xl bg-white border border-gray-200">
                            <div className="text-xs text-green-700 font-bold mb-1">{k}</div>
                            <div className="text-base text-gray-800 font-black">{v}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 flex items-start gap-2">
                        <span>📍</span>
                        <span>Nagar Nigam Complex, Upper Ganga Canal Road, Civil Lines, Roorkee – 247667</span>
                      </p>
                    </div>
                  )}
                  <span className="text-xs text-gray-400 font-bold mt-4 self-end">Page {flipbookPage * 2 + 2}</span>
                </div>
              </div>

              {/* Flipbook Controls */}
              <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-100">
                <button onClick={() => setFlipbookPage(p => Math.max(0, p - 1))} disabled={flipbookPage === 0}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" /> Previous Page
                </button>
                <span className="text-sm text-gray-500 font-bold px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  Spread {flipbookPage + 1} of 3
                </span>
                <button onClick={() => setFlipbookPage(p => Math.min(2, p + 1))} disabled={flipbookPage === 2}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Next Page <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. STATS (Full Width) ─────────────────────────────────────────── */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">Live Portal Statistics</span>
            <h2 className="text-3xl font-black text-gray-800 mt-4 mb-2">Waste2Watt at a Glance</h2>
            <p className="text-gray-500">Real-time data from the Nagar Nigam Roorkee waste management system</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap,     color: 'yellow', value: `${energyGenerated.toLocaleString()} kWh`, label: 'Clean Energy Generated',   sub: 'From our waste-to-energy plant' },
              { icon: Trash2,  color: 'green',  value: `${603 + complaints.filter(c => c.status === 'Resolved').length}+`, label: 'Complaints Resolved', sub: '94% on-time resolution rate' },
              { icon: Users,   color: 'blue',   value: '45',                                       label: 'Active Field Personnel',   sub: 'Deployed across all 40 wards' },
              { icon: BookOpen,color: 'purple', value: views.toLocaleString(),                     label: 'Total Portal Visits',      sub: 'Citizens using our system' },
            ].map(({ icon: Icon, color, value, label, sub }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
                  color==='yellow'?'bg-yellow-50':color==='green'?'bg-green-50':color==='blue'?'bg-blue-50':'bg-purple-50'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    color==='yellow'?'text-yellow-600':color==='green'?'text-green-700':color==='blue'?'text-blue-600':'text-purple-600'
                  }`} />
                </div>
                <div className="text-3xl font-black text-gray-800 mb-1">{value}</div>
                <div className="text-xs text-gray-700 font-bold uppercase tracking-wider mb-1">{label}</div>
                <div className="text-xs text-gray-400">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

        </>
      )}

      {/* ── 11. FOOTER ───────────────────────────────────────────────────── */}

      <footer id="footer-section" className="bg-[#1a3a6b] text-gray-300 mt-0">
        <div className="bg-green-700 py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white font-semibold">
            <span>📞 Helpline: <strong>1800-123-4567</strong></span>
            <span>📧 help@roorkeew2w.in</span>
            <span>📍 Nagar Nigam Complex, Civil Lines, Roorkee – 247667</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-400 bg-white flex items-center justify-center">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <BrandTitle size="lg" dark={false} />
                <p className="text-xs text-blue-300 mt-1">Smart Segregation, Clean Generation</p>
              </div>
            </div>
            <p className="text-sm text-blue-200 max-w-sm leading-relaxed">
              An automated waste-to-energy collection and live IoT monitoring framework under Nagar Nigam Roorkee, Uttarakhand. Empowering clean energy production and citizen participation.
            </p>
            <p className="text-xs text-blue-300 font-bold mt-5">© 2026 Waste2Watt by Municipal Corporation Roorkee. All rights reserved.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-sm border-b border-blue-700 pb-3">Citizen Services</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              {[['Portal Home', () => window.scrollTo({ top: 0, behavior: 'smooth' })], ['Register Complaint', () => navigate('/register-complaint')], ['Track Status', () => setShowTrackingModal(true)], ['Staff Console', () => navigate('/login')]].map(([label, action]) => (
                <li key={label}><button onClick={action} className="hover:text-green-400 transition-colors">{label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-sm border-b border-blue-700 pb-3">National Helplines</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              {[['Citizen Center', '14420'], ['Child Helpline', '1098'], ['Women Helpline', '1091'], ['Vigilance Wing', '1064']].map(([k, v]) => (
                <li key={k} className="flex justify-between">{k}: <span className="text-white font-semibold">{v}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-800 py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-blue-400 uppercase tracking-wider">
            <div className="flex gap-5">
              {['Website Policies', 'Terms of Service', 'Contact Us'].map((t, i) => (
                <React.Fragment key={t}>{i > 0 && <span>•</span>}<span className="hover:text-blue-200 cursor-pointer transition-colors">{t}</span></React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              Hosted by <span className="text-green-400 font-bold mx-1">National Informatics Centre (NIC)</span>· Govt. of Uttarakhand
            </div>
          </div>
        </div>
        {/* Live Clock Strip */}
        <LiveClock />
      </footer>

      {/* ── TRACKING MODAL ───────────────────────────────────────────────── */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="bg-green-700 text-white px-6 py-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5" />
                <div>
                  <h2 className="text-lg font-black">Track Your Complaint</h2>
                  <p className="text-sm text-green-200">Enter your Ticket ID for real-time status</p>
                </div>
              </div>
              <button onClick={() => { setShowTrackingModal(false); setHasSearched(false); setTrackId(''); setCaptchaVerified(false); }}
                className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={trackId} onChange={e => { setTrackId(e.target.value); setHasSearched(false); }} placeholder="e.g. C-123456"
                  className="flex-1 text-center font-mono font-bold tracking-widest text-lg bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 uppercase text-gray-800 transition-all"
                  onKeyDown={e => { if (e.key === 'Enter' && captchaVerified && trackId.trim()) handleTrack(); }} />
                <button onClick={handleTrack} disabled={!captchaVerified || !trackId.trim()}
                  className="bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-4 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                  Track Status
                </button>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Enter security code to proceed:</label>
                <TextCaptcha onVerify={setCaptchaVerified} />
              </div>
            </div>
            {hasSearched && !searchedComplaint && (
              <div className="mx-6 mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium text-sm">
                No complaint found with ID "{trackId}". Please check and try again.
              </div>
            )}
            {hasSearched && searchedComplaint && (
              <div className="px-6 pb-6 space-y-5">
                <div className="relative hidden md:block py-6">
                  <div className="absolute top-[34px] left-[12.5%] right-[12.5%] h-1.5 bg-gray-200 rounded-full z-0"></div>
                  <div className="absolute top-[34px] left-[12.5%] h-1.5 bg-green-600 rounded-full z-0 transition-all duration-1000"
                    style={{ width: `${((getTrackingStep(searchedComplaint) - 1) / 3) * 75}%` }}></div>
                  <div className="relative z-10 flex justify-between">
                    {[{step:1,label:'Logged',icon:Clock},{step:2,label:'Assigned',icon:UserCheck},{step:3,label:'In Progress',icon:Truck},{step:4,label:'Resolved',icon:CheckCircle2}].map(({step,label,icon:Icon}) => {
                      const isActive = getTrackingStep(searchedComplaint) >= step;
                      return (
                        <div key={step} className="flex flex-col items-center w-1/4 gap-2">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all ${isActive ? 'bg-green-700 text-white scale-110' : 'bg-gray-200 text-gray-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className={`text-xs font-bold text-center ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>{label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {getTrackingStep(searchedComplaint) >= 2 && getAssignedStaff(searchedComplaint) && (() => {
                  const staff = getAssignedStaff(searchedComplaint);
                  return (
                    <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Assigned Personnel</h4>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md shrink-0">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-base text-gray-800">{staff.name}</h3>
                            <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{staff.role}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                            <p className="flex items-center gap-2"><BadgeInfo className="w-4 h-4 text-green-700 shrink-0"/>{staff.id}</p>
                            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-green-700 shrink-0"/>{staff.mobile}</p>
                            <p className="flex items-center gap-2 col-span-2"><Mail className="w-4 h-4 text-green-700 shrink-0"/>{staff.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
