import React, { useState, useEffect } from 'react';
import { Store, Product, ModalType } from '../../types';
import { auth, db } from '../../firebase'; 
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import Plus from '../icons/Plus';


const getUserDomain = () => {
    const user = auth.currentUser;
    if (!user || !user.email) return null;
    return user.email.split('@')[1].toLowerCase();
};

const Store: React.FC<Store> = ({ onAddToCart, onOpenModal }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDomain, setUserDomain] = useState<string | null>(null);

  useEffect(() => {
    const domain = getUserDomain();
    setUserDomain(domain);

    if (domain) {
        const q = query(
            collection(db, "products"),
            where("collegeDomain", "==", domain),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            
            setProducts(fetchedProducts);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching store items:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, []);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full pb-16">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Campus Store</h1>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {userDomain ? `Marketplace for @${userDomain}` : 'Student Marketplace'}
            </p>
        </div>
        <button 
            onClick={() => onOpenModal(ModalType.ADD_PRODUCT)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-sm"
        >
            <Plus className="mr-2" />
            Sell Item
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
         <div className="flex justify-center pt-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
         </div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-dashed border-gray-300 dark:border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">The store is currently empty.</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Be the first to list a book, notes, or stationary!</p>
          <button 
            onClick={() => onOpenModal(ModalType.ADD_PRODUCT)}
            className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
          >
            List an Item Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700">
              <div className="relative h-40 w-full bg-gray-200 dark:bg-gray-700">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'; }}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-gray-800 dark:text-white">
                    ₹{product.price.toFixed(0)}
                  </div>
              </div>
              
              <div className="p-3 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-1">
                    <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10">
                        {product.category || 'General'}
                    </span>
                </div>
                
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-2 leading-tight min-h-[2.5em]">
                    {product.name}
                </h3>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                    Sold by: {product.sellerName || 'Student'}
                </p>
                
                <button
                  onClick={() => onAddToCart(product)}
                  className="mt-auto w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Store;