import React from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-gray-200 py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left"
      >
        <span className="font-medium text-gray-700">{question}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && <p className="mt-2 text-sm text-gray-600 pr-4">{answer}</p>}
    </div>
  );
};

interface HelpSupportScreenProps {
  onStartSupportChat: () => void;
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ onStartSupportChat }) => {
  const faqs = [
    { question: "How do I reset my password?", answer: "You can reset your password from the login screen by clicking the 'Forgot Password?' link. If you still face issues, please contact support." },
    { question: "How can I update my profile information?", answer: "Navigate to the 'Profile' tab, then tap on the 'Edit' icon or relevant sections to update your details." },
    { question: "Where can I find my course materials?", answer: "Course materials can often be found within the 'Store' tab if they are for purchase, or 'Free Material' if provided by the institution." },
    { question: "Is my data secure?", answer: "Yes, we take data security seriously. Please refer to our Privacy Policy for more details." },
  ];


  return (
    <div className="p-1">
      <h4 className="text-md font-semibold text-gray-800 mb-3">Frequently Asked Questions</h4>
      <div className="space-y-1 mb-6">
        {faqs.map(faq => <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />)}
      </div>

      <h4 className="text-md font-semibold text-gray-800 mb-3">Still need help?</h4>
      <button
        onClick={onStartSupportChat}
        className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
      >
        Start a Chat with Support
      </button>
      <p className="text-xs text-gray-500 mt-3 text-center">Our support team is available Mon-Fri, 9am-5pm.</p>
    </div>
  );
};

export default HelpSupportScreen;