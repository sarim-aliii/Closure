import React, { useState, useEffect } from 'react';
import { FAQItemProps, HelpSupport as HelpSupportProps } from '../../types';
import { db } from '../../firebase'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import ChevronDown from '../icons/ChevronDown';
import QuestionMarkCircle from '../icons/QuestionMarkCircle';
import Chat from '../icons/Chat';

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
        <span className={`transform transition-transform duration-200 ml-2 text-gray-400 dark:text-gray-500 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5" />
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 pr-4 leading-relaxed bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
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
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full pb-16 transition-colors duration-200">
      <div className="mb-6 px-1">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Help & Support</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Find answers or contact our team.</p>
      </div>

      {/* FAQs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-100 dark:border-gray-700">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-md mr-2">
                <QuestionMarkCircle className="h-5 w-5" />
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center border border-gray-100 dark:border-gray-700">
         <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Chat className="h-6 w-6 text-green-600 dark:text-green-400" />
         </div>
         <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">Still need help?</h4>
         <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Can't find the answer you're looking for? Start a live chat with our support team.
         </p>
         
         <button
           onClick={onStartSupportChat}
           className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors text-sm shadow-md flex items-center justify-center focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
         >
            <Chat className="h-5 w-5 mr-2" />
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