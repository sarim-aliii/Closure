import React from 'react';

const Gender: React.FC<{ className?: string }> = ({ className="w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.293 4.293a1 1 0 011.414 0L12 10.586l6.293-6.293a1 1 0 111.414 1.414L13.414 12l6.293 6.293a1 1 0 01-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 01-1.414-1.414L10.586 12 4.293 5.707a1 1 0 010-1.414zM14 18v2m-4-2v2m4-15a3 3 0 013 3v2a3 3 0 01-3 3h-4a3 3 0 01-3-3V6a3 3 0 013-3h4z" /></svg>;

export default Gender;