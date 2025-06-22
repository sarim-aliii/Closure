
import React from 'react';
import { Product } from '../types';

interface StoreScreenProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const StoreScreen: React.FC<StoreScreenProps> = ({ products, onAddToCart }) => {
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full pb-16">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 px-1">Store</h1>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">The store is currently empty.</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back later for new products!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
              <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover"/>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-2">{product.category}</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">₹{product.price.toFixed(2)}</p>
                <button
                  onClick={() => onAddToCart(product)}
                  className="mt-auto w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors text-sm font-medium"
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

export default StoreScreen;
