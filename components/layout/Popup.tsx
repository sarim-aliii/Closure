import React, { useEffect } from 'react';
import { PopupProps } from '../../types'


const Popup: React.FC<PopupProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white text-sm z-[100]";
  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {message}
      <button onClick={onClose} className="ml-4 font-bold text-lg leading-none">&times;</button>
    </div>
  );
};

export default Popup;
