import React, { useState, useEffect, useMemo } from 'react';
import { StoreProps, Product, ModalType } from '../../types';
import { db } from '../../firebase'; 
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import Plus from '../icons/Plus';
import Tag from '../icons/Tag'; // Assuming Tag icon exists, or fallback to SVG
import { useUser } from '../../contexts/UserContext'; // Integrated Context

const Store: React.FC<StoreProps> = ({ onAddToCart, onOpenModal }) => {
  const { user } = useUser(); // Access global user state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive domain from user context
  const userDomain = useMemo(() => {
    return user?.email ? user.email.split('@')[1].toLowerCase() : null;
  }, [user]);

  useEffect(() => {
    if (userDomain) {
        const q = query(
            collection(db, "products"),
            where("collegeDomain", "==", userDomain),
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
  }, [userDomain]);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full pb-20 transition-colors duration-200">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Campus Store</h1>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                {userDomain ? `Marketplace for @${userDomain}` : 'Student Marketplace'}
            </p>
        </div>
        <button 
            onClick={() => onOpenModal(ModalType.ADD_PRODUCT)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
            <Plus className="mr-2 w-5 h-5" />
            Sell Item
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
         <div className="flex justify-center pt-10">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         </div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
          <Tag className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">The store is currently empty.</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Be the first to list a book, notes, or stationary!</p>
          <button 
            onClick={() => onOpenModal(ModalType.ADD_PRODUCT)}
            className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline focus:outline-none"
          >
            List an Item Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700">
              <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-700">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'; }}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                    ₹{product.price.toFixed(0)}
                  </div>
              </div>
              
              <div className="p-3 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-1.5">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-500/20">
                        {product.category || 'General'}
                    </span>
                </div>
                
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-2 leading-tight min-h-[2.5em]">
                    {product.name}
                </h3>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1 truncate">
                    By: {product.sellerName || 'Student'}
                </p>
                
                <button
                  onClick={() => onAddToCart(product)}
                  className="mt-auto w-full bg-indigo-600 text-white py-2 px-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors text-xs sm:text-sm font-semibold flex items-center justify-center shadow-sm"
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