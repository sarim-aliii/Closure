import React from 'react';

interface UsersIconProps {
  className?: string;
  isActive?: boolean;
}

const UsersIcon: React.FC<UsersIconProps> = ({ className = "w-6 h-6", isActive }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill={isActive ? "currentColor" : "none"} 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.334M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 3a9 9 0 11-18 0 9 9 0 0118 0zM12.75 5.106a8.217 8.217 0 012.122.092M5.25 5.106a8.217 8.217 0 002.122.092m0 0A8.194 8.194 0 0112 3c1.095 0 2.134.215 3.078.602m-6.156 0A8.194 8.194 0 0012 3c-1.095 0-2.134.215-3.078.602m0 0A12.023 12.023 0 004.5 7.575m0 0a12.023 12.023 0 0115 0m-15 0S4.5 12 7.5 12s3-4.425 3-4.425M7.5 12S4.5 16.5 7.5 16.5s3 4.425 3 4.425m-3-4.425h3M16.5 12S19.5 7.5 16.5 7.5s-3 4.425-3 4.425M16.5 12s1.5 4.5-1.5 4.5s-3-4.425-3-4.425m3 4.425h-3" />
</svg>
);

export default UsersIcon;