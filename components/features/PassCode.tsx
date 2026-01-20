import React, { useState, useEffect } from 'react';
import { Lock, Delete, ShieldCheck, Settings, X, RefreshCw, Trash2 } from 'lucide-react';

interface PassCodeProps {
  children: React.ReactNode;
}

type LockMode = 'LOCKED' | 'SETUP' | 'IDLE' | 'SETTINGS' | 'VERIFY_TO_CHANGE' | 'VERIFY_TO_REMOVE' | 'ENTER_NEW';

export const PassCode: React.FC<PassCodeProps> = ({ children }) => {
  const [savedPin, setSavedPin] = useState<string | null>(localStorage.getItem('app_pin'));
  const [mode, setMode] = useState<LockMode>(savedPin ? 'LOCKED' : 'IDLE');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Auto-lock when app goes to background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && savedPin) {
        setMode('LOCKED');
        setPin(''); 
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [savedPin]);

  const handleNumClick = (num: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleAction = () => {
    // 1. UNLOCKING
    if (mode === 'LOCKED') {
      if (pin === savedPin) {
        setMode('IDLE');
        setPin('');
      } else {
        triggerError();
      }
    }
    // 2. SETUP NEW PIN
    else if (mode === 'SETUP' || mode === 'ENTER_NEW') {
        localStorage.setItem('app_pin', pin);
        setSavedPin(pin);
        setMode('IDLE'); // Done
        setPin('');
        // alert('Passcode Set!'); 
    }
    // 3. VERIFY TO REMOVE
    else if (mode === 'VERIFY_TO_REMOVE') {
        if (pin === savedPin) {
            localStorage.removeItem('app_pin');
            setSavedPin(null);
            setMode('IDLE');
            setPin('');
        } else {
            triggerError();
        }
    }
    // 4. VERIFY TO CHANGE
    else if (mode === 'VERIFY_TO_CHANGE') {
        if (pin === savedPin) {
            setMode('ENTER_NEW'); // Proceed to enter new pin
            setPin('');
        } else {
            triggerError();
        }
    }
  };

  const triggerError = () => {
    setError(true);
    setPin('');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  // Auto-submit when 4 digits reached
  useEffect(() => {
    if (pin.length === 4) {
        setTimeout(handleAction, 100);
    }
  }, [pin]);

  // --- RENDER HELPERS ---

  if (mode === 'IDLE') {
     return (
         <>
            {children}
            
            {/* Manage Lock Trigger */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 group">
                {savedPin ? (
                    <button 
                        onClick={() => setMode('SETTINGS')}
                        className="bg-zinc-900/50 hover:bg-zinc-900 text-zinc-600 hover:text-white p-3 rounded-full backdrop-blur-md border border-zinc-800 shadow-xl transition-all"
                        title="Lock Settings"
                    >
                        <Settings size={18} />
                    </button>
                ) : (
                    <button 
                        onClick={() => setMode('SETUP')}
                        className="bg-nothing-red text-white p-2 rounded-full shadow-xl flex items-center gap-2 px-4 text-xs font-mono uppercase tracking-widest animate-pulse hover:animate-none"
                    >
                        <ShieldCheck size={14} /> Setup Lock
                    </button>
                )}
            </div>
         </>
     )
  }

  // --- KEYPAD / INTERFACE RENDER ---
  
  const getTitle = () => {
      switch(mode) {
          case 'LOCKED': return 'BlurChat Locked';
          case 'SETUP': return 'Create Passcode';
          case 'SETTINGS': return 'Security Settings';
          case 'VERIFY_TO_REMOVE': return 'Enter Current PIN';
          case 'VERIFY_TO_CHANGE': return 'Enter Old PIN';
          case 'ENTER_NEW': return 'Enter New PIN';
          default: return '';
      }
  }

  // Settings Menu View
  if (mode === 'SETTINGS') {
      return (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-6 backdrop-blur-xl">
            <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative">
                <button onClick={() => setMode('IDLE')} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
                
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 bg-zinc-800 rounded-full mb-4 text-white"><ShieldCheck size={32} /></div>
                    <h2 className="text-xl font-bold text-white">Security</h2>
                    <p className="text-zinc-500 text-sm mt-1">Manage your access code</p>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={() => setMode('VERIFY_TO_CHANGE')}
                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-4 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                    >
                        <RefreshCw size={20} /> Change Passcode
                    </button>
                    <button 
                        onClick={() => setMode('VERIFY_TO_REMOVE')}
                        className="w-full p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex items-center gap-4 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all"
                    >
                        <Trash2 size={20} /> Remove Passcode
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // Keypad View (Locked, Setup, Verify, New)
  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center text-white">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full ${error ? 'bg-red-500/20 text-red-500' : 'bg-zinc-900 text-indigo-500'} transition-colors duration-300`}>
            {error ? <Lock size={48} className="animate-shake" /> : <ShieldCheck size={48} />}
        </div>
        <h2 className="text-xl font-mono tracking-widest uppercase animate-in fade-in slide-in-from-bottom-2">
            {getTitle()}
        </h2>
        <div className="flex gap-4 mt-4 h-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-white scale-110' : 'bg-zinc-800'}`} />
            ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumClick(num)}
            className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold hover:bg-zinc-800 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <div className="w-16 h-16"></div> {/* Spacer */}
        <button
            onClick={() => handleNumClick(0)}
            className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold hover:bg-zinc-800 active:scale-95 transition-all"
          >
            0
        </button>
        <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full flex items-center justify-center text-zinc-500 hover:text-white active:scale-95 transition-all"
          >
            <Delete size={24} />
        </button>
      </div>
      
      {/* Cancel button for non-critical modes */}
      {mode !== 'LOCKED' && (
          <button 
            onClick={() => {
                setPin('');
                setMode(savedPin ? 'IDLE' : 'IDLE'); 
            }} 
            className="mt-10 text-zinc-500 text-xs uppercase tracking-widest hover:text-white"
          >
              Cancel
          </button>
      )}
    </div>
  );
};