
import React from 'react';
import { DownloadableItem, UserProfile } from '../types';

interface OfflineDownloadsScreenProps {
  items: DownloadableItem[];
  user: UserProfile | null;
  onDownload: (item: DownloadableItem) => void; // Triggers download simulation + popup
  onViewDownloaded: () => void; // Future: view already downloaded files
}

const DownloadIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const OfflineDownloadsScreen: React.FC<OfflineDownloadsScreenProps> = ({ items, user, onDownload }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Offline Downloads</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">No downloadable content available at the moment.</p>
      ) : (
        <ul className="space-y-3">
          {items.map(item => {
            const isDownloaded = user?.downloadedItemIds?.includes(item.id);
            return (
              <li key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-700">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.type} - {item.size}</p>
                </div>
                <button
                  onClick={() => !isDownloaded && onDownload(item)}
                  disabled={isDownloaded}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-colors ${
                    isDownloaded 
                      ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  <DownloadIcon className="w-4 h-4 mr-2"/>
                  {isDownloaded ? 'Downloaded' : 'Download'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default OfflineDownloadsScreen;
