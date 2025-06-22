import React from 'react';
import { Announcement, Event, ModalType } from '../types';

// Placeholder Star Icon - No longer used on this card directly
// const StarIcon: React.FC<{ className?: string, filled?: boolean }> = ({ className = "w-5 h-5", filled }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
//   </svg>
// );

const CalendarIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
);

const LocationIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);


interface HomeScreenProps {
  onOpenModal: (modalType: ModalType, data?: any) => void;
  announcements: Announcement[];
  events: Event[];
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenModal, announcements, events }) => {
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-full pb-16"> {/* Dark mode background for consistency */}
      {/* Create Post Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-4 md:mb-0 md:mr-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Create a Post</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Share your thoughts, questions, or updates with the community.</p>
            <button 
              onClick={() => onOpenModal(ModalType.CREATE_POST)}
              className="bg-indigo-600 text-white border border-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors text-sm"
            >
              Create Post
            </button>
          </div>
          {/* Image and star rating removed */}
        </div>
      </div>

      {/* Announcements Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 px-1">Announcements</h3>
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map(announcement => (
              <div key={announcement.id} onClick={() => onOpenModal(ModalType.ANNOUNCEMENT_DETAIL, announcement)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-1">{announcement.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{announcement.date}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{announcement.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">No new announcements.</p>
        )}
      </div>

      {/* Upcoming Events Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 px-1">Upcoming Events</h3>
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} onClick={() => onOpenModal(ModalType.EVENT_DETAIL, event)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">{event.title}</h4>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5 space-x-3">
                  <span className="flex items-center"><CalendarIcon className="mr-1 text-gray-400 dark:text-gray-500"/> {event.date} at {event.time}</span>
                  <span className="flex items-center"><LocationIcon className="mr-1 text-gray-400 dark:text-gray-500"/> {event.location}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{event.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">No upcoming events scheduled.</p>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;