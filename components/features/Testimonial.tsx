import React from 'react';
import { TestimonialProps } from '../../types';
import UserCircle from '../icons/UserCircle';

const TestimonialList: React.FC<TestimonialProps> = ({ testimonials }) => {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl transition-colors duration-200">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 px-1">Student Testimonials</h2>
      
      {testimonials.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50">
            <p className="text-gray-500 dark:text-gray-400">No testimonials available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map(testimonial => (
            <div 
                key={testimonial.id} 
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center mb-4">
                {testimonial.avatarUrl ? (
                  <img 
                    src={testimonial.avatarUrl} 
                    alt={testimonial.studentName} 
                    className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                  />
                ) : (
                  <UserCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mr-4"/>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{testimonial.studentName}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide">
                    {testimonial.course}
                  </p>
                </div>
              </div>
              
              <div className="relative">
                  {/* Decorative Quote Mark */}
                  <span className="absolute -top-2 -left-1 text-4xl text-gray-100 dark:text-gray-700 font-serif select-none pointer-events-none">
                    &ldquo;
                  </span>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed italic relative z-10 pl-2">
                    {testimonial.testimonialText}
                  </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialList;