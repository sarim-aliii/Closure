import React from 'react';


interface AcknowledgementsProps {
  onClose: () => void;
}

const Acknowledgements: React.FC<AcknowledgementsProps> = ({ onClose }) => {
  return (
    <div className="p-1 space-y-3 text-sm text-gray-700 dark:text-gray-300">
      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">Acknowledgements</h4>
      
      <p>Closure utilizes several open-source libraries and technologies. We are grateful to the developers and communities behind these projects.</p>

      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100 pt-2">Key Technologies:</h5>
      <ul className="list-disc list-inside pl-4 space-y-1">
        <li>
          <strong>React:</strong> A JavaScript library for building user interfaces.
          <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-2">Visit React</a>
        </li>
        <li>
          <strong>Tailwind CSS:</strong> A utility-first CSS framework for rapid UI development.
          <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-2">Visit Tailwind CSS</a>
        </li>
        <li>
          <strong>Heroicons:</strong> Beautiful hand-crafted SVG icons, by the makers of Tailwind CSS.
          <a href="https://heroicons.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-2">Visit Heroicons</a>
        </li>
         <li>
          <strong>Picsum Photos:</strong> Placeholder images.
          <a href="https://picsum.photos/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-2">Visit Picsum Photos</a>
        </li>
      </ul>

      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100 pt-2">Special Thanks:</h5>
      <p>We would also like to thank the broader open-source community for their continuous contributions that make projects like Closure possible.</p>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 pt-3">This list is representative and may not be exhaustive. For any queries regarding licensing or attributions, please contact us.</p>

      {/* Close Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
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

export default Acknowledgements;