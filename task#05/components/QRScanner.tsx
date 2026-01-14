import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Loader2, CameraOff, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showRetryHint, setShowRetryHint] = useState(false);
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanLock = useRef(false);
  const scannerId = "qr-reader";
  const initializedRef = useRef(false);
  const retryTimerRef = useRef<number | null>(null);

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  const startRetryTimer = () => {
    clearRetryTimer();
    setShowRetryHint(false);
    retryTimerRef.current = window.setTimeout(() => {
      setShowRetryHint(true);
    }, 8000); // Show hint after 8 seconds of no detection
  };

  const stopScanner = async () => {
    clearRetryTimer();
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        console.log("QRFriends: Scanner stopped successfully.");
      } catch (err) {
        console.warn("QRFriends: Error stopping scanner:", err);
      }
    }
  };

  const startScanning = async (cameraId: string) => {
    if (!html5QrCodeRef.current) return;
    
    setIsInitializing(true);
    try {
      await stopScanner();

      // Standard box sizing for mobile compatibility
      const qrboxSize = 250;

      await html5QrCodeRef.current.start(
        cameraId,
        {
          fps: 15,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0
        },
        async (decodedText) => {
          // 1. Check Lock - Prevent multiple triggers
          if (scanLock.current) return;
          scanLock.current = true;
          
          console.log("QRFriends: Valid QR Detected:", decodedText);

          // 2. Immediate Haptic Feedback
          if (navigator.vibrate) navigator.vibrate(100);

          // 3. Stop Scanner Immediately BEFORE parent logic
          try {
            await stopScanner();
          } catch (e) {
            console.error("QRFriends: Stop failed during detection", e);
          }

          // 4. Trigger Parent Connection Logic
          onScan(decodedText);
        },
        () => {
          // Frame error (no QR found in this specific frame) - Ignore
        }
      );
      
      setIsInitializing(false);
      setHasError(false);
      startRetryTimer(); // Start tracking for slow detection
    } catch (err) {
      console.error("QRFriends: Scanning start error:", err);
      setHasError(true);
      setIsInitializing(false);
      onError("Failed to start camera. Please verify permissions.");
    }
  };

  useEffect(() => {
    // Prevent double-initialization in StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;
    scanLock.current = false;

    const html5QrCode = new Html5Qrcode(scannerId);
    html5QrCodeRef.current = html5QrCode;

    const init = async () => {
      try {
        // 1. Explicitly request camera permissions
        console.log("QRFriends: Explicitly requesting camera media stream...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        // Release the initial stream immediately so html5-qrcode can take over
        stream.getTracks().forEach(track => track.stop());

        // 2. Detect available cameras
        const availableCameras = await Html5Qrcode.getCameras();
        if (availableCameras && availableCameras.length > 0) {
          setCameras(availableCameras.map(c => ({ id: c.id, label: c.label })));
          
          // Logic to prefer the rear/back camera
          const backCamIndex = availableCameras.findIndex(cam => 
            cam.label.toLowerCase().includes('back') || 
            cam.label.toLowerCase().includes('rear') ||
            cam.label.toLowerCase().includes('environment')
          );
          
          const indexToUse = backCamIndex !== -1 ? backCamIndex : 0;
          setCurrentCameraIndex(indexToUse);
          await startScanning(availableCameras[indexToUse].id);
        } else {
          throw new Error("No camera hardware detected.");
        }
      } catch (err) {
        console.error("QRFriends: Camera permission or detection error:", err);
        setHasError(true);
        setIsInitializing(false);
        onError("Camera access denied. Please enable it in browser settings.");
      }
    };

    // Small delay to ensure the DOM node is rendered and ready
    const timeout = setTimeout(init, 500);

    return () => {
      clearTimeout(timeout);
      stopScanner().then(() => {
        html5QrCodeRef.current = null;
        initializedRef.current = false;
      });
      clearRetryTimer();
    };
  }, []);

  const switchCamera = async () => {
    if (cameras.length < 2) return;
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    await startScanning(cameras[nextIndex].id);
  };

  const handleManualRetry = () => {
    setShowRetryHint(false);
    startScanning(cameras[currentCameraIndex].id);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black relative">
      {/* Target Container */}
      <div id={scannerId} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>

      {isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-900">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
          <p className="text-white font-bold">Accessing Lens...</p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-slate-900 px-8 text-center">
          <CameraOff size={48} className="text-red-500 mb-6" />
          <h3 className="text-white text-xl font-black mb-3">Lens Blocked</h3>
          <p className="text-slate-400 mb-8 text-sm">We need camera access to scan codes. Check site permissions.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary w-full max-w-[200px]"
          >
            Refresh & Grant
          </button>
        </div>
      )}
      
      {!hasError && !isInitializing && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Viewfinder UI */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[250px] h-[250px]">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500 shadow-[0_0_15px_#4f46e5] animate-scan-line"></div>
            </div>
          </div>

          {/* Slow Detection Overlay */}
          {showRetryHint && (
            <div className="absolute top-20 left-6 right-6 z-50 animate-scale pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-[28px] shadow-2xl border border-white/20 flex flex-col items-center text-center">
                <div className="bg-amber-100 p-3 rounded-full mb-3">
                  <AlertCircle size={24} className="text-amber-600" />
                </div>
                <p className="text-slate-800 font-extrabold text-sm mb-1">Having trouble scanning?</p>
                <p className="text-slate-500 text-xs mb-4">Try improving the lighting or moving the camera closer.</p>
                <button 
                  onClick={handleManualRetry}
                  className="btn btn-secondary py-2 px-6 flex items-center gap-2 text-xs rounded-full border-slate-200"
                >
                  <RotateCcw size={14} /> Restart Lens
                </button>
              </div>
            </div>
          )}

          <div className="absolute bottom-10 left-0 right-0 px-6 flex flex-col items-center gap-4 pointer-events-auto">
             <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl">
                <p className="text-white font-bold text-xs uppercase tracking-widest">Scanning...</p>
             </div>
             
             {cameras.length > 1 && (
               <button 
                 onClick={switchCamera}
                 className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl"
               >
                 <RefreshCw size={20} />
               </button>
             )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scanLine 2.5s linear infinite;
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #qr-reader__dashboard, #qr-reader__status_span {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;