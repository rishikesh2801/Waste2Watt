import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const TextCaptcha = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);
  const canvasRef = useRef(null);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars O, 0, I, 1
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setIsVerified(false);
    setError(false);
    if(onVerify) onVerify(false);
    drawCaptcha(result);
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Distraction lines
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.2)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    // Text
    ctx.font = 'bold 30px "Courier New", Courier, monospace';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < text.length; i++) {
        const x = 20 + i * 25;
        const y = canvas.height / 2 + (Math.random() * 10 - 5);
        const angle = (Math.random() * 30 - 15) * Math.PI / 180;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`;
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
    }

    // Dots/Noise
    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
        ctx.fill();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleCheck = () => {
    if (userInput.toUpperCase() === captchaText) {
      setIsVerified(true);
      setError(false);
      if (onVerify) onVerify(true);
    } else {
      setError(true);
      setIsVerified(false);
      if (onVerify) onVerify(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-[300px]">
      <div className="flex items-center gap-3">
        <div className="relative group">
          <canvas 
            ref={canvasRef} 
            width="180" 
            height="50" 
            className="rounded-lg border border-slate-200 shadow-inner bg-white"
          />
          <button 
            type="button"
            onClick={generateCaptcha}
            className="absolute -right-2 -top-2 p-1.5 bg-white shadow-md border border-slate-100 rounded-full text-slate-400 hover:text-municipal-blue hover:rotate-180 transition-all duration-500"
            title="Refresh Captcha"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {isVerified && (
          <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5" />
            Verified
          </div>
        )}
      </div>

      {!isVerified && (
        <div className="flex gap-2">
          <input 
            type="text" 
            value={userInput}
            onChange={(e) => {
                setUserInput(e.target.value.toUpperCase());
                if(error) setError(false);
            }} 
            placeholder="Type code above"
            maxLength={6}
            className={`input-3d py-2 flex-1 text-center font-mono font-bold tracking-widest uppercase ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCheck())}
          />
          <button 
            type="button"
            onClick={handleCheck}
            className="btn-primary py-2 px-4 text-sm"
          >
            Check
          </button>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold animate-shake">
          <AlertCircle className="w-4 h-4" />
          Incorrect code. Try again.
        </div>
      )}
    </div>
  );
};

export default TextCaptcha;
