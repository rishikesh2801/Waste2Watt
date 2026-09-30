import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, X, RefreshCw, ZapOff } from 'lucide-react';

const WebcamCapture = ({ onCapture, onClose }) => {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady]           = useState(false);
  const [error, setError]           = useState(null);
  const [switching, setSwitching]   = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (facing) => {
    stopStream();
    setReady(false);
    setError(null);

    const constraints = [
      { video: { facingMode: { exact: facing }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: facing } },
      { video: { facingMode: { ideal: facing } } },
      { video: true },
    ];

    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout')), 8000);
            videoRef.current.onloadedmetadata = async () => {
              clearTimeout(timeout);
              try {
                await videoRef.current.play();
                resolve();
              } catch (e) { reject(e); }
            };
            videoRef.current.onerror = (e) => { clearTimeout(timeout); reject(e); };
          });
          setReady(true);
          setSwitching(false);
        }
        return; // success — stop trying
      } catch (e) {
        stopStream();
        // try next constraint
      }
    }

    setSwitching(false);
    setError('Camera access denied or unavailable. Please allow camera permissions in your browser settings and try again.');
  }, [stopStream]);

  useEffect(() => {
    startCamera('environment');
    return () => stopStream();
  }, []); // eslint-disable-line

  const switchCamera = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setSwitching(true);
    setFacingMode(next);
    await startCamera(next);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !ready) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCapture(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 animate-fade-in">
      <div className="bg-gray-900 rounded-2xl overflow-hidden w-full max-w-xl shadow-2xl flex flex-col border border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${
              ready ? 'bg-green-500 animate-pulse' : switching ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
            }`} />
            <Camera className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">
              {switching ? 'Switching Camera...' : ready ? 'Camera Ready' : error ? 'Camera Error' : 'Starting Camera...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={switchCamera} title="Switch Camera" disabled={switching}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-40">
              <RefreshCw className={`w-4 h-4 ${switching ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => { stopStream(); onClose(); }}
              className="p-2 bg-red-900/50 hover:bg-red-700 text-red-300 hover:text-white rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative bg-black flex items-center justify-center" style={{ minHeight: '320px' }}>
          {error ? (
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <ZapOff className="w-12 h-12 text-red-400" />
              <p className="text-red-300 text-sm font-medium max-w-xs">{error}</p>
              <button onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors">
                Retry Camera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[55vh] object-contain"
                style={{ display: 'block' }}
              />
              {(!ready || switching) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                  <div className="w-10 h-10 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                  <p className="text-gray-300 text-sm font-medium">
                    {switching ? 'Switching camera...' : 'Initializing camera...'}
                  </p>
                </div>
              )}
              {/* Viewfinder corners */}
              {ready && !switching && (
                <div className="absolute inset-8 pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-400 rounded-br-lg" />
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Capture Button */}
        <div className="px-5 py-5 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-6">
          <button onClick={() => { stopStream(); onClose(); }}
            className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={capturePhoto}
            disabled={!ready || !!error || switching}
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all shadow-lg ${
              ready && !error && !switching
                ? 'border-green-400 bg-transparent hover:scale-105 active:scale-95 shadow-green-500/30'
                : 'border-gray-600 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className={`w-11 h-11 rounded-full ${ready && !error && !switching ? 'bg-white' : 'bg-gray-500'}`} />
          </button>
          <button onClick={switchCamera} disabled={switching}
            className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${switching ? 'animate-spin' : ''}`} /> Flip
          </button>
        </div>

      </div>
    </div>
  );
};

export default WebcamCapture;
