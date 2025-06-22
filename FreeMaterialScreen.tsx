
import React from 'react';
import { FreeMaterialItem, ModalType } from '../types'; // Import ModalType

interface FreeMaterialScreenProps {
  materials: FreeMaterialItem[];
  onOpenModal: (modalType: ModalType, data?: any) => void; // Added prop
}

const LinkIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
</svg>
);
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);


const FreeMaterialScreen: React.FC<FreeMaterialScreenProps> = ({ materials, onOpenModal }) => {
  const handleAccessMaterial = (item: FreeMaterialItem) => {
    if (item.type === 'article' && item.content) {
      onOpenModal(ModalType.VIEW_FREE_MATERIAL_CONTENT, { title: item.title, content: item.content });
    } else if (item.url) {
      window.open(item.url, '_blank');
    } else {
      alert(`Accessing: ${item.title}\n\nNo direct content preview or URL available.`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Free Material</h2>
      {materials.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No free materials available at the moment.</p>
      ) : (
        <ul className="space-y-3">
          {materials.map(item => (
            <li key={item.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">{item.type.replace('_', ' ')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{item.description}</p>
              <button
                onClick={() => handleAccessMaterial(item)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-700/50 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-600/50 transition-colors flex items-center"
              >
                {item.type === 'article' ? <DocumentTextIcon className="w-4 h-4 mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                Access Material
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FreeMaterialScreen;
