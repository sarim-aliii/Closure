import React, { useEffect, useState } from 'react';
import { PopupProps } from '../../types';
import CheckCircle from '../icons/CheckCircle'
import XCircle from '../icons/XCircle'
import InfoField from '../icons/InfoField'



const Popup: React.FC<PopupProps> = ({ message, type, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    const exitTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); 
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [onClose, duration]);

  const typeStyles = {
    success: "bg-green-500 border-green-600",
    error: "bg-red-500 border-red-600",
    info: "bg-blue-500 border-blue-600",
  };

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : InfoField;

  return (
    <div 
        className={`fixed top-4 right-4 z-[100] transform transition-all duration-300 ease-out ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
    >
        <div className={`${typeStyles[type]} flex items-center p-4 rounded-lg shadow-lg border text-white min-w-[300px] max-w-sm`}>
            <div className="flex-shrink-0 mr-3">
                <Icon />
            </div>
            <div className="flex-grow text-sm font-medium">
                {message}
            </div>
            <button 
                onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} 
                className="ml-4 text-white/80 hover:text-white transition-colors focus:outline-none"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
  );
};

export default Popup;