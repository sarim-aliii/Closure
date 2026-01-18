import React from 'react';

const ChatBubble: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443h2.284M19.5 12.76c0-1.6-1.123-2.994-2.707-3.227A48.344 48.344 0 0013.5 9.185V6L9.424 9.924a1.526 1.526 0 00-1.037.443H6.113M15 9.75a3 3 0 110-6 3 3 0 010 6z" />
  </svg>
);

export default ChatBubble;