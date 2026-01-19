import React, { useState, useEffect, useMemo } from 'react';
import { OfflineDownloadsProps, DownloadableItem } from '../../types';
import { db } from '../../firebase'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Download from '../icons/Download';
import CheckBadge from '../icons/CheckBadge';
import Document from '../icons/Document';
import { useUser } from '../../contexts/UserContext'; // Integrated Context

const OfflineDownloads: React.FC<OfflineDownloadsProps> = ({ onDownload, onViewDownloaded }) => {
  const { user } = useUser(); // Access global user state
  const [items, setItems] = useState<DownloadableItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive domain from user context
  const userDomain = useMemo(() => {
    return user?.email ? user.email.split('@')[1].toLowerCase() : null;
  }, [user]);

  useEffect(() => {
    if (userDomain) {
        const q = query(
            collection(db, "offline_downloads"),
            where("collegeDomain", "==", userDomain) 
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DownloadableItem[];
            
            setItems(fetchedItems);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching downloads:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, [userDomain]);

  const handleDownloadClick = (item: DownloadableItem) => {
      if (item.url) {
          // Open URL in system browser (for Capacitor/Mobile)
          window.open(item.url, '_system');
      }

      if (onDownload) {
          onDownload(item);
      }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full transition-colors duration-200">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Offline Downloads</h2>
        <p className="text-xs text-indigo-600 dark:text-indigo-400">
             Study materials for {userDomain ? `@${userDomain}` : 'you'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center pt-10">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
             <Document className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2"/>
             <p className="text-gray-500 dark:text-gray-400">No downloads available yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(item => {
            // Check if item is already downloaded using Context data
            const isDownloaded = user?.downloadedItemIds?.includes(item.id);
            
            return (
              <li key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex items-center">
                   <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
                       <Document className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                   </div>
                   <div>
                       <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base">{item.name}</h3>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                           {item.type} • {item.size}
                       </p>
                   </div>
                </div>
                
                <button
                  onClick={() => !isDownloaded && handleDownloadClick(item)}
                  disabled={isDownloaded}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md flex items-center transition-colors shadow-sm ${
                    isDownloaded 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-default border border-green-200 dark:border-green-800' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900'
                  }`}
                >
                  {isDownloaded ? (
                      <>
                        <CheckBadge className="w-4 h-4 mr-1.5"/>
                        Saved
                      </>
                  ) : (
                      <>
                        <Download className="w-4 h-4 mr-1.5"/>
                        Download
                      </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default OfflineDownloads;