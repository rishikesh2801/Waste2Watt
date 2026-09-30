import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, MapPin, Send, ArrowLeft, CheckCircle, Upload, X,
  Mail, Copy, Shield, AlertTriangle, User, Phone, FileText,
  ChevronRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import WebcamCapture from '../components/WebcamCapture';
import RoorkeeLocationInput from '../components/RoorkeeLocationInput';
import TextCaptcha from '../components/TextCaptcha';

// ── Brand Title ──────────────────────────────────────────────────────────────
const BrandTitle = ({ size = 'base' }) => {
  const sizes = { sm: 'text-lg', base: 'text-2xl', xl: 'text-3xl' };
  return (
    <span className={`font-black tracking-tight ${sizes[size]}`}>
      <span className="text-[#1a3a6b]">Waste</span>
      <span className="text-[#f97316]">2</span>
      <span className="text-[#1a3a6b]">Watt</span>
    </span>
  );
};

// ── Step indicator ───────────────────────────────────────────────────────────
const StepBar = ({ current }) => {
  const steps = ['Your Details', 'Location & Photo', 'Verify & Submit'];
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((label, i) => {
        const num  = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${
                done   ? 'bg-green-600 border-green-600 text-white' :
                active ? 'bg-[#1a3a6b] border-[#1a3a6b] text-white shadow-lg' :
                         'bg-white border-gray-300 text-gray-400'
              }`}>
                {done ? <CheckCircle className="w-5 h-5" /> : num}
              </div>
              <span className={`text-xs font-bold mt-1.5 whitespace-nowrap ${
                active ? 'text-[#1a3a6b]' : done ? 'text-green-600' : 'text-gray-400'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${done ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Main Complaint Page ──────────────────────────────────────────────────────
const ComplaintPage = () => {
  const navigate = useNavigate();
  const { addComplaint } = useAppContext();

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', description: '', location: '' });
  const [photo, setPhoto]       = useState(null);
  const [complaintId, setComplaintId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [showWebcam, setShowWebcam]     = useState(false);
  const [otpStep, setOtpStep]           = useState(false);
  const [enteredOtp, setEnteredOtp]     = useState('');
  const [actualOtp, setActualOtp]       = useState('');
  const [formError, setFormError]       = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPhoto({ raw: file, preview: URL.createObjectURL(file) });
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await resp.json();
            let address = data.display_name;
            if (address && !address.toLowerCase().includes('roorkee')) address = `${address} (Roorkee Area)`;
            setFormData(p => ({ ...p, location: address || `${lat}, ${lon} (Roorkee Area)` }));
          } catch {
            setFormData(p => ({ ...p, location: `${lat}, ${lon} (Roorkee Area)` }));
          }
        },
        () => alert('Error capturing location. Please select manually.')
      );
    }
  };

  // Validate and send OTP (no Gemini)
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (!/^\d{10}$/.test(formData.mobile))
      return setFormError('Please enter a valid 10-digit mobile number.');
    if (!formData.location.toLowerCase().includes('roorkee'))
      return setFormError('Complaints can only be registered for locations within Roorkee.');
    if (!photo)
      return setFormError('Please upload or capture a photo as proof of the issue.');
    if (!formData.description.trim())
      return setFormError('Please write a description of the waste issue.');
    if (!captchaVerified)
      return setFormError('Please complete the security verification.');

    setIsSubmitting(true);
    try {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      const otpResp = await fetch('/api/otp/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mobile: formData.mobile, email: formData.email, otp: generated, name: formData.name }),
      });
      if (otpResp.ok) {
        setActualOtp(generated);
        setOtpStep(true);
      } else {
        const err = await otpResp.json();
        throw new Error(err.error || 'Failed to send OTP');
      }
    } catch (err) {
      setFormError('Could not send OTP. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (enteredOtp !== actualOtp) return setFormError('Invalid OTP. Please check your email/SMS.');

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('mobile', formData.mobile);
      fd.append('description', formData.description);
      fd.append('location', formData.location);

      if (photo?.raw) {
        fd.append('photo', photo.raw);
      } else if (photo?.preview?.startsWith('data:')) {
        // Convert dataUrl (from webcam) to a proper File with correct MIME type
        const res  = await fetch(photo.preview);
        const blob = await res.blob();
        const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
        fd.append('photo', file, 'webcam-capture.jpg');
      }

      const response = await fetch('/api/complaints', {
        method:  'POST',
        headers: { 'ngrok-skip-browser-warning': 'any' },
        body:    fd,
      });

      if (response.ok) {
        const result = await response.json();
        setComplaintId(result.trackingId || result._id || result.id);
        addComplaint(result);
        setSubmitted(true);
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Server error');
      }
    } catch (err) {
      setFormError('Submission failed: ' + err.message);
      setOtpStep(false);
      setEnteredOtp('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Page ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b-4 border-green-600 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-green-600">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <BrandTitle />
              <p className="text-xs text-gray-500 font-semibold mt-0.5">Nagar Nigam Roorkee · Citizen Portal</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full space-y-5">
            {/* Success Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
              <div className="bg-green-600 p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Complaint Registered Successfully!</h2>
                <p className="text-green-100 text-sm">Your issue has been logged and will be addressed shortly.</p>
              </div>

              <div className="p-8 space-y-6">
                {/* Tracking ID */}
                <div className="bg-gray-50 border-2 border-dashed border-[#1a3a6b] rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Your Tracking ID</p>
                    <p className="text-3xl font-black font-mono text-[#1a3a6b] tracking-wider">{complaintId}</p>
                    <p className="text-xs text-gray-400 mt-1">Save this ID to track your complaint status</p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(complaintId); }}
                    className="flex flex-col items-center gap-1.5 p-3 bg-white border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-400 text-[#1a3a6b] transition-all shadow-sm"
                    title="Copy Tracking ID"
                  >
                    <Copy className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Copy</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: CheckCircle, color: 'green',  label: 'Status',   value: 'Pending Review' },
                    { icon: Mail,        color: 'blue',   label: 'Email',    value: 'Confirmation Sent' },
                    { icon: Phone,       color: 'orange', label: 'Response', value: 'Within 12-24 hrs' },
                  ].map(({ icon: Icon, color, label, value }) => (
                    <div key={label} className={`p-4 rounded-xl border text-center ${
                      color === 'green'  ? 'bg-green-50  border-green-200'  :
                      color === 'blue'   ? 'bg-blue-50   border-blue-200'   : 'bg-orange-50 border-orange-200'
                    }`}>
                      <Icon className={`w-5 h-5 mx-auto mb-2 ${
                        color === 'green'  ? 'text-green-600'  :
                        color === 'blue'   ? 'text-blue-600'   : 'text-orange-600'
                      }`} />
                      <p className="text-xs text-gray-500 font-semibold">{label}</p>
                      <p className={`text-sm font-black ${
                        color === 'green'  ? 'text-green-700'  :
                        color === 'blue'   ? 'text-blue-700'   : 'text-orange-700'
                      }`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-8 pb-8">
                {/* Email preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden mb-5">
                  <div className="bg-[#1a3a6b] px-5 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Email Dispatched</p>
                      <p className="text-sm font-bold text-white">To: {formData.email}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-green-400 bg-green-900/30 border border-green-700/30 px-2.5 py-1 rounded-full">Sent</span>
                  </div>
                  <div className="p-6 font-mono text-sm text-gray-600 leading-relaxed space-y-3">
                    <p>Dear <strong className="text-gray-800">{formData.name}</strong>,</p>
                    <p>Thank you for registering a complaint. We will try to resolve the reported issue at <strong className="text-[#1a3a6b] underline">{formData.location}</strong> within 12–24 hours.</p>
                    <p className="text-green-700 font-black">Green Roorkee, Clean Roorkee 🌳</p>
                    <p className="text-gray-400 text-xs">— Automatically generated by Waste2Watt, Nagar Nigam Roorkee</p>
                  </div>
                </div>

                <button onClick={() => navigate('/')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl text-base transition-all shadow-md hover:shadow-lg">
                  ← Return to Home Page
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────────────────────────────────
  const step = otpStep ? 3 : (photo && formData.location ? 2 : 1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b-4 border-green-600 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-600">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <BrandTitle />
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Citizen Grievance Portal</p>
            </div>
          </div>
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-700 font-semibold text-sm px-4 py-2 rounded-xl bg-gray-100 hover:bg-green-50 border border-gray-200 hover:border-green-300 transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Back to Home</span>
          </button>
        </div>
      </header>

      {/* GOI Strip */}
      <div className="bg-[#1a3a6b] py-2 px-6 text-center">
        <p className="text-xs text-blue-200 font-semibold">Government of Uttarakhand · Nagar Nigam Roorkee · Waste Management Portal</p>
      </div>

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-6 space-y-6">

          {/* Page Title */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              <AlertTriangle className="w-3.5 h-3.5" /> Citizen Complaint Portal
            </div>
            <h1 className="text-3xl font-black text-[#1a3a6b] mb-2">Register a Waste Issue</h1>
            <p className="text-gray-500 max-w-xl mx-auto">Help keep Roorkee clean. Report overflowing dustbins, unswept roads, or any waste management issue in your area.</p>
          </div>

          {/* Step Bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <StepBar current={step} />
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
            <div className="bg-[#1a3a6b] px-6 py-5 flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-300" />
              <div>
                <h2 className="text-white font-black text-lg">Complaint Details</h2>
                <p className="text-blue-300 text-xs">All fields marked with * are required</p>
              </div>
            </div>

            <form onSubmit={otpStep ? handleSubmit : handleSendOTP} className="p-6 space-y-6">

              {/* Row 1: Name + Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-green-600" /> Full Name <span className="text-red-500">*</span>
                  </label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-gray-50 transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-green-600" /> Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500/30 focus-within:border-green-500 bg-gray-50 transition-all">
                    <span className="flex items-center gap-2 px-4 bg-gray-100 border-r border-gray-200 text-gray-700 font-bold text-sm shrink-0">
                      🇮🇳 +91
                    </span>
                    <input required type="tel" name="mobile" maxLength="10" value={formData.mobile} onChange={handleInputChange}
                      placeholder="10-digit number"
                      className="w-full px-4 py-3 bg-transparent outline-none font-mono text-gray-800 text-sm" />
                  </div>
                </div>
              </div>

              {/* Row 2: Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-green-600" /> Email Address <span className="text-red-500">*</span>
                </label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="Enter your email for OTP and updates"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-gray-50 transition-all" />
              </div>

              {/* Row 3: Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-green-600" /> Complaint Description <span className="text-red-500">*</span>
                </label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={4}
                  placeholder="Describe the waste issue in detail — e.g., 'Overflowing dustbin near ABC School, Ward 5. Garbage has been piling up for 3 days.'"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-gray-50 transition-all resize-none" />
              </div>

              {/* Row 4: Location + Photo side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-green-600" /> Location (Roorkee) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <RoorkeeLocationInput
                        value={formData.location}
                        onChange={(val) => setFormData(p => ({ ...p, location: val }))}
                      />
                    </div>
                    <button type="button" onClick={getLocation} title="Get current location"
                      className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl hover:bg-green-100 transition-colors shrink-0">
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-green-600" /> Photo Proof <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                    <label htmlFor="photo-upload"
                      className="flex-1 flex flex-col items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all text-gray-500 hover:text-green-700 text-xs font-bold">
                      <Upload className="w-5 h-5" />
                      Upload File
                    </label>
                    <button type="button" onClick={() => setShowWebcam(true)}
                      className="flex-1 flex flex-col items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all text-gray-500 hover:text-green-700 text-xs font-bold">
                      <Camera className="w-5 h-5" />
                      Camera
                    </button>
                  </div>
                </div>
              </div>

              {/* Webcam */}
              {showWebcam && (
                <WebcamCapture
                  onCapture={(dataUrl) => { setPhoto({ preview: dataUrl }); setShowWebcam(false); }}
                  onClose={() => setShowWebcam(false)}
                />
              )}

              {/* Photo Preview */}
              {photo?.preview && (
                <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-gray-200 shadow-sm animate-fade-in">
                  <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <button type="button" onClick={() => setPhoto(null)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-3 left-3 text-white text-xs font-bold bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    ✓ Photo added
                  </span>
                </div>
              )}

              {/* Captcha + Submit */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Security Verification <span className="text-red-500">*</span></label>
                  <TextCaptcha onVerify={setCaptchaVerified} />
                </div>

                {formError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm font-semibold">{formError}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isSubmitting || !captchaVerified || !photo}
                  className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-black text-base transition-all shadow-md ${
                    isSubmitting || !captchaVerified || !photo
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send OTP &amp; Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a3a6b] text-blue-200 py-4 px-6 mt-4 text-center text-xs font-semibold">
        © 2026 Municipal Corporation Roorkee · Waste2Watt · Government of Uttarakhand
      </footer>

      {/* ── OTP Modal ──────────────────────────────────────────────────────── */}
      {otpStep && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-[#1a3a6b] px-6 py-6 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-white">Verify Your Email</h2>
              <p className="text-blue-200 text-sm mt-1">
                A 6-digit code has been sent to<br />
                <strong className="text-white">{formData.email}</strong>
              </p>
            </div>

            <div className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold text-center">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Enter OTP Code</label>
                <input
                  type="text" maxLength="6"
                  value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)}
                  className="w-full text-center text-3xl tracking-[0.5em] font-black font-mono bg-gray-50 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-xl px-4 py-4 outline-none transition-all"
                  placeholder="------"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setOtpStep(false); setEnteredOtp(''); setFormError(null); }}
                  className="py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  disabled={isSubmitting || enteredOtp.length !== 6}
                  className={`py-3 rounded-xl font-black text-white transition-all ${
                    isSubmitting || enteredOtp.length !== 6
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 shadow-md'
                  }`}>
                  {isSubmitting ? 'Verifying...' : 'Verify & Submit'}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                Didn't receive the code?{' '}
                <button type="button" onClick={handleSendOTP} className="text-green-700 font-bold hover:underline">
                  Resend OTP
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintPage;
