import React from 'react';
import { TestimonialScreenProps } from '../../types';
import UserCircleIcon from '../icons/UserCircle';



const TestimonialScreen: React.FC<TestimonialScreenProps> = ({ testimonials }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Student Testimonials</h2>
      {testimonials.length === 0 ? (
        <p className="text-gray-500">No testimonials available yet. Check back soon!</p>
      ) : (
        <div className="space-y-6">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-start mb-3">
                {testimonial.avatarUrl ? (
                  <img src={testimonial.avatarUrl} alt={testimonial.studentName} className="w-12 h-12 rounded-full mr-4 object-cover"/>
                ) : (
                  <UserCircleIcon className="w-12 h-12 text-gray-400 mr-4"/>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">{testimonial.studentName}</h3>
                  <p className="text-xs text-indigo-600">{testimonial.course}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic">"{testimonial.testimonialText}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialScreen;
