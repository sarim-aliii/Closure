
import React from 'react';

interface StoreIconProps {
  className?: string;
  isActive?: boolean;
}

const StoreIcon: React.FC<StoreIconProps> = ({ className = "w-6 h-6", isActive }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A2.25 2.25 0 0011.25 11.25H10.5V7.5h3V11.25a2.25 2.25 0 002.25 2.25H16.5v7.5m0-7.5h-1.5m1.5 0H18M10.5 7.5H6m4.5 0v3.75m0-3.75c0-1.125-.938-2.25-2.25-2.25S6 6.375 6 7.5m4.5 0c0 .095-.004.19-.012.283M6 7.5L4.5 3m1.5 4.5l1.5-4.5M13.5 7.5l1.5-4.5m0 0L16.5 3M13.5 7.5L15 11.25m-1.5-3.75H12m0 0V11.25" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18" />
  </svg>
);

export default StoreIcon;
