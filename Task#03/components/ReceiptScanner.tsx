
import React, { useState, useRef } from 'react';
import { scanReceipt } from '../services/geminiService';
import { ScanResult, Expense } from '../types';

interface ReceiptScannerProps {
  onSave: (expense: Expense) => void;
  onCancel: () => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onSave, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setImage(event.target?.result as string);
      
      setScanning(true);
      setError(null);
      try {
        const scanResult = await scanReceipt(base64);
        setResult(scanResult);
      } catch (err: any) {
        setError(err.message || "Failed to scan receipt.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!result) return;
    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      merchant: result.merchant,
      date: result.date,
      total: result.total,
      currency: result.currency,
      category: result.category,
      imageUrl: image || undefined,
      rawText: result.rawText,
      createdAt: Date.now()
    };
    onSave(newExpense);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 max-w-3xl mx-auto w-full animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900">AI Receipt Scan</h2>
          <p className="text-sm text-gray-400">Powered by Gemini Multimodal Extraction</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-4 border-dashed border-indigo-50 rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
        >
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </div>
          <p className="text-xl font-bold text-gray-800">Upload Receipt Image</p>
          <p className="text-gray-400 mt-2 text-center max-w-xs">Directly scan SROIE formatted receipts for 99% accuracy extraction.</p>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group">
              <div className="rounded-2xl overflow-hidden border border-gray-100 h-80 bg-black flex items-center justify-center shadow-lg">
                <img src={image} alt="Receipt" className="object-contain h-full w-full opacity-90 group-hover:opacity-100 transition-opacity" />
                {scanning && (
                  <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-md flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-white font-black mt-4 uppercase tracking-[0.2em] text-xs">Extracting Fields...</p>
                  </div>
                )}
              </div>
              {result?.rawText && (
                <button 
                  onClick={() => setShowRaw(!showRaw)}
                  className="mt-3 text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  {showRaw ? 'Hide OCR Text' : 'View Raw OCR Text'}
                </button>
              )}
            </div>

            <div className="space-y-6">
              {showRaw && result?.rawText ? (
                <div className="h-80 overflow-y-auto p-4 bg-gray-900 text-green-400 font-mono text-xs rounded-2xl border border-gray-800 animate-in fade-in slide-in-from-right-4">
                  <p className="mb-2 text-gray-500 uppercase tracking-widest text-[10px]">/// RAW RECEIPT OCR STREAM ///</p>
                  {result.rawText}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Extracted Intelligence
                  </h3>
                  
                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex gap-3">
                       <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    <EditableField label="Merchant" value={result?.merchant} onChange={(val: string) => setResult(prev => prev ? {...prev, merchant: val} : null)} />
                    <div className="grid grid-cols-2 gap-3">
                      <EditableField label="Date" value={result?.date} type="date" onChange={(val: string) => setResult(prev => prev ? {...prev, date: val} : null)} />
                      <EditableField label="Total" value={result?.total.toString()} type="number" onChange={(val: string) => setResult(prev => prev ? {...prev, total: Number(val)} : null)} />
                    </div>
                    <EditableField label="Category" value={result?.category} onChange={(val: string) => setResult(prev => prev ? {...prev, category: val} : null)} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t border-gray-50">
             <button 
              onClick={() => { setImage(null); setResult(null); setError(null); }}
              className="px-6 py-3 text-gray-500 hover:text-gray-900 font-bold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={scanning || !result}
              className="px-10 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95"
            >
              Verify & Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EditableField = ({ label, value, onChange, type = "text" }: any) => (
  <div className="group">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type}
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all group-hover:bg-gray-100"
    />
  </div>
);

export default ReceiptScanner;
