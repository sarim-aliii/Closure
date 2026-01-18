import React, { useState, useEffect } from 'react';
import { FreeMaterialItem, ModalType, FreeMaterial } from '../../types';
import { auth, db } from '../../firebase'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Link from '../icons/Link'
import DocumentText from '../icons/DocumentText'


const getUserDomain = () => {
    const user = auth.currentUser;
    if (!user || !user.email) return null;
    return user.email.split('@')[1].toLowerCase();
};

const FreeMaterial: React.FC<FreeMaterial> = ({ onOpenModal }) => {
  const [items, setItems] = useState<FreeMaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDomain, setUserDomain] = useState<string | null>(null);

  // --- FETCH MATERIALS LOGIC ---
  useEffect(() => {
    const domain = getUserDomain();
    setUserDomain(domain);

    if (domain) {
        const q = query(
            collection(db, "free_materials"),
            where("collegeDomain", "==", domain) 
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMaterials = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FreeMaterialItem[];
            
            setItems(fetchedMaterials);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching materials:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, []);

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
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full">
      <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Free Material</h2>
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            Resources for {userDomain ? `@${userDomain}` : 'you'}
          </p>
      </div>

      {loading ? (
        <div className="flex justify-center pt-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-dashed border-gray-300">
            <DocumentText className="w-10 h-10 mx-auto text-gray-300 mb-2"/>
            <p className="text-gray-500 dark:text-gray-400">No free materials uploaded for your college yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(item => (
            <li key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-1">{item.title}</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide mb-1">
                        {item.type.replace('_', ' ')}
                    </p>
                  </div>
                  {/* Icon Badge */}
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500">
                    {item.type === 'article' ? <DocumentText /> : <Link />}
                  </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{item.description}</p>
              
              <button
                onClick={() => handleAccessMaterial(item)}
                className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center border border-indigo-200 dark:border-indigo-800"
              >
                {item.type === 'article' ? <DocumentText className="w-4 h-4 mr-2" /> : <Link className="w-4 h-4 mr-2" />}
                {item.type === 'video_link' ? 'Watch Video' : 'View Material'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FreeMaterial;