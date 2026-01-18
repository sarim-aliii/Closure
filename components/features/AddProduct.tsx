import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { auth, db, storage } from '../../firebase'; 
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";


interface AddProduct {
  onClose: () => void;
}

const getDomainFromEmail = (email: string | null | undefined) => {
    if (!email) return 'general';
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : 'general';
};

const AddProduct: React.FC<AddProduct> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'stationary' | 'book'>('stationary');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageBase64(result);
        setImagePreview(result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validation
    if (!name.trim() || !price || !imageBase64) {
      setError("Please fill in all required fields and upload an image.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
        setError("You must be logged in to add a product.");
        return;
    }

    setIsSubmitting(true);

    try {
      // 2. Upload Image to Firebase Storage
      const imageName = `${Date.now()}_product`;
      const storageRef = ref(storage, `product_images/${user.uid}/${imageName}`);
      
      // Upload the Base64 string
      await uploadString(storageRef, imageBase64, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);

      // 3. Extract College Domain (For Isolation)
      const collegeDomain = getDomainFromEmail(user.email);

      // 4. Save Product to Firestore
      await addDoc(collection(db, "products"), {
        name: name.trim(),
        price: parseFloat(price),
        category: category,
        description: description.trim(),
        imageUrl: downloadUrl,   
        collegeDomain: collegeDomain,
        sellerId: user.uid,  
        sellerName: user.displayName || "Anonymous Student",
        createdAt: serverTimestamp(),
        status: "available" 
      });

      // 5. Success
      onClose();

    } catch (err) {
      console.error("Error adding product: ", err);
      setError("Failed to add product. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-2 text-sm text-red-600 bg-red-100 rounded dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
          placeholder="e.g. Engineering Mathematics"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-4">
        {/* Price */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
            placeholder="0.00"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Category */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'stationary' | 'book')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
            disabled={isSubmitting}
          >
            <option value="stationary">Stationary</option>
            <option value="book">Book</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
          placeholder="Product details..."
          disabled={isSubmitting}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Product Image <span className="text-red-500">*</span>
        </label>
        
        <div className="flex items-center space-x-4">
          {imagePreview ? (
            <div className="relative h-20 w-20">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-full w-full object-cover rounded-md border border-gray-300 dark:border-gray-600" 
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageBase64(undefined);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={isSubmitting}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ) : (
            <div className="w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                />
                <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 2MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
             <>
               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Adding...
             </>
          ) : 'Add Product'}
        </button>
      </div>
    </form>
  );
};

export default AddProduct;