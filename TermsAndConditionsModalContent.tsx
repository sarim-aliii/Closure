
import React from 'react';

const TermsAndConditionsModalContent: React.FC = () => {
  return (
    <div className="p-1 space-y-3 text-sm text-gray-700 dark:text-gray-300">
      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">Terms and Conditions</h4>
      <p>Welcome to Closure!</p>
      <p>These terms and conditions outline the rules and regulations for the use of Closure's Application.</p>
      <p>By accessing this application we assume you accept these terms and conditions. Do not continue to use Closure if you do not agree to take all of the terms and conditions stated on this page.</p>
      
      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100 pt-2">Cookies:</h5>
      <p>The Application may use cookies to help personalize your online experience. By accessing Closure, you agreed to use the required cookies.</p>

      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100 pt-2">License:</h5>
      <p>Unless otherwise stated, Closure and/or its licensors own the intellectual property rights for all material on Closure. All intellectual property rights are reserved. You may access this from Closure for your own personal use subjected to restrictions set in these terms and conditions.</p>
      <p>You must not:</p>
      <ul className="list-disc list-inside pl-4 space-y-1">
        <li>Republish material from Closure</li>
        <li>Sell, rent or sub-license material from Closure</li>
        <li>Reproduce, duplicate or copy material from Closure</li>
        <li>Redistribute content from Closure</li>
      </ul>
      <p>This Agreement shall begin on the date hereof.</p>

      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100 pt-2">User Comments:</h5>
       <p>Parts of this application offer an opportunity for users to post and exchange opinions and information. Closure does not filter, edit, publish or review Comments prior to their presence on the application. Comments do not reflect the views and opinions of Closure, its agents and/or affiliates. Comments reflect the views and opinions of the person who posts their views and opinions.</p>

      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100 pt-2">Disclaimer:</h5>
      <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our application and the use of this application. Nothing in this disclaimer will limit or exclude our or your liability for death or personal injury; limit or exclude our or your liability for fraud or fraudulent misrepresentation...</p>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 pt-3">This is a sample Terms & Conditions for demonstration purposes. Last updated: [Current Date].</p>
    </div>
  );
};

export default TermsAndConditionsModalContent;