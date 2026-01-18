import React from 'react';

const Tag: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.593l6.202-2.073c1.154-.386 1.552-2.197.696-2.909L12.595 4.382a2.27 2.27 0 00-1.591-.66h-1.436z" />
    </svg>
);

export default Tag;