import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

const CustomCaptcha = ({ onVerify }) => {
  const [status, setStatus] = useState('idle'); // idle, loading, verified

  const handleVerify = () => {
    if (status !== 'idle') return;
    setStatus('loading');
    
    // Simulate network delay for realism
    setTimeout(() => {
      setStatus('verified');
      if (onVerify) onVerify(true);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div className="flex bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] py-[10px] px-[14px] w-full max-w-[304px] shadow-sm select-none transition-all duration-300 hover:shadow-md mx-auto sm:mx-0">
      <div className="flex-1 flex items-center gap-[12px] cursor-pointer group" onClick={handleVerify}>
         <div className={`w-7 h-7 flex items-center justify-center bg-white border-[2.5px] rounded-sm transition-all duration-300 relative
           ${status === 'idle' ? 'border-[#c1c1c1] group-hover:border-[#b0b0b0]' : ''}
           ${status === 'loading' ? 'border-transparent' : ''}
           ${status === 'verified' ? 'border-transparent' : ''}
         `}>
           {status === 'loading' && <Loader2 className="absolute w-8 h-8 text-blue-600 animate-spin" />}
           {status === 'verified' && <div className="absolute w-full h-full bg-transparent flex items-center justify-center"><Check className="w-8 h-8 text-[#009E5F] drop-shadow-sm" strokeWidth={3} /></div>}
         </div>
         <span className="text-[14px] font-medium text-[#222] tracking-wide relative top-[1px]" style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}>
           I'm not a robot
         </span>
      </div>
      <div className="flex flex-col items-center justify-center opacity-[0.85] border-l border-[#d3d3d3] pl-[14px] ml-2">
         <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" className="w-[30px] mb-1" alt="recaptcha logo" />
         <div className="text-[8.5px] text-[#555] flex flex-col items-center leading-tight mt-[1px]">
            <span>Privacy - Terms</span>
         </div>
      </div>
    </div>
  );
};

export default CustomCaptcha;
