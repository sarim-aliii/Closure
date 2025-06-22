
import React from 'react';

interface ChevronRightIconProps {
  className?: string;
}

const ChevronRightIcon: React.FC<ChevronRightIconProps> = ({ className: propClassName = "" }) => {
  const baseClasses = "w-5 h-5"; // Default size
  const combinedClassName = `${baseClasses} ${propClassName}`.trim();

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={combinedClassName}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
};

export default ChevronRightIcon;
