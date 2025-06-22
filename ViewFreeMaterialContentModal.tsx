
import React from 'react';

interface ViewFreeMaterialContentModalProps {
  title: string; // Title is passed but typically displayed by the main Modal component
  content: string;
}

const ViewFreeMaterialContentModal: React.FC<ViewFreeMaterialContentModalProps> = ({ title, content }) => {
  return (
    <div className="p-1 space-y-3 text-sm text-gray-700 dark:text-gray-300">
      {/* The title is usually part of the Modal component's header, 
          but you could re-display it here if needed, or use it for ARIA attributes. 
          For now, focusing on displaying content.
      */}
      {/* <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">{title}</h4> */}
      
      <div 
        className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded-md leading-relaxed"
        // Using dangerouslySetInnerHTML can be risky if content isn't sanitized.
        // For simple text with newlines, whitespace-pre-wrap is safer.
        // If HTML content is expected, ensure it's sanitized before rendering.
      >
        {content}
      </div>
    </div>
  );
};

export default ViewFreeMaterialContentModal;
