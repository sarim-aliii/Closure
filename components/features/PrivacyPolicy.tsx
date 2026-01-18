import React from 'react';


interface PrivacyPolicy {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicy> = ({ onClose }) => {
  return (
    <div className="p-1 space-y-3 text-sm text-gray-600 dark:text-gray-300">
      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">Our Commitment to Privacy</h4>
      <p>Closure ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the "Application").</p>
      
      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 pt-2">Information We Collect</h4>
      <p>We may collect information about you in a variety of ways. The information we may collect via the Application depends on the content and materials you use, and includes:</p>
      <ul className="list-disc list-inside pl-4 space-y-1">
        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and mobile number, that you voluntarily give to us when you register with the Application.</li>
        <li><strong>Usage Data:</strong> Information automatically collected when you access and use the Application, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Application.</li>
      </ul>

      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 pt-2">Use of Your Information</h4>
      <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
      <ul className="list-disc list-inside pl-4 space-y-1">
        <li>Create and manage your account.</li>
        <li>Email you regarding your account or order.</li>
        <li>Enable user-to-user communications.</li>
        <li>Improve the Application and services.</li>
      </ul>

      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 pt-2">Security of Your Information</h4>
      <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 pt-2">Contact Us</h4>
      <p>If you have questions or comments about this Privacy Policy, please contact us at: <span className="text-indigo-600 dark:text-indigo-400">support@closure.example.com</span></p>
      <p className="text-xs text-gray-500 dark:text-gray-500 pt-3 italic">This is a sample privacy policy for demonstration purposes.</p>

      {/* Close Button */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-4">
        <button
          onClick={onClose}
          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm border border-gray-300 dark:border-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;