import React, { useState, useEffect } from 'react';
import { FAQItemProps, HelpSupport as HelpSupportProps } from '../../types';
import { db } from '../../firebase'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore';


const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-3 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left focus:outline-none group"
      >
        <span className="font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {question}
        </span>
        <span className={`transform transition-transform duration-200 ml-2 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 pr-4 leading-relaxed bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
          {answer}
        </div>
      )}
    </div>
  );
};

const HelpSupport: React.FC<HelpSupportProps> = ({ onStartSupportChat }) => {
  const [faqs, setFaqs] = useState<FAQItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultFaqs: FAQItemProps[] = [
    { question: "How do I reset my password?", answer: "You can reset your password from the login screen by clicking the 'Forgot Password?' link. Check your email for the reset link." },
    { question: "How can I update my profile?", answer: "Navigate to the 'Profile' tab, then tap on the 'Edit' icon to update your name, bio, or profile picture." },
    { question: "Where are my course materials?", answer: "Course materials are located in the 'Free Material' section for institutional resources, or the 'Store' for purchased items." },
    { question: "Is my data secure?", answer: "Yes. We use industry-standard encryption for all data and secure Firebase authentication." },
  ];

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const q = query(collection(db, "faqs"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
             const fetchedData = snapshot.docs.map(doc => doc.data() as FAQItemProps);
             setFaqs(fetchedData);
        } else {
            setFaqs(defaultFaqs);
        }
      } catch (error) {
        console.warn("Could not fetch FAQs, using defaults.", error);
        setFaqs(defaultFaqs);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full pb-16">
      <div className="mb-6 px-1">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Help & Support</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Find answers or contact our team.</p>
      </div>

      {/* FAQs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-md mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </span>
            Frequently Asked Questions
        </h4>
        
        {loading ? (
             <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded opacity-50"></div>)}
             </div>
        ) : (
            <div className="space-y-1">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
            </div>
        )}
      </div>

      {/* Support Action Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
         <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
         </div>
         <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">Still need help?</h4>
         <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Can't find the answer you're looking for? Start a live chat with our support team.
         </p>
         
         <button
            onClick={onStartSupportChat}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors text-sm shadow-md flex items-center justify-center focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat with Support
         </button>
         <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            Support Available: Mon-Fri, 9am - 5pm
         </p>
      </div>
    </div>
  );
};

export default HelpSupport;