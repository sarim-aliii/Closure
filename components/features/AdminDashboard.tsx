import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { UserProfile, Announcement, Event, Testimonial } from '../../types';
import XCircle from '../icons/XCircle';
import Plus from '../icons/Plus';

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'announcements' | 'events'>('overview');
  const [stats, setStats] = useState({ users: 0, revenue: 0, feedback: 0 });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [feedbacks, setFeedbacks] = useState<Testimonial[]>([]);

  // Form States
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch Users Count
      const usersSnap = await getDocs(collection(db, "users"));
      const usersList = usersSnap.docs.map(doc => doc.data() as UserProfile);
      
      // Calculate Revenue (Mock calculation from orders)
      const ordersSnap = await getDocs(collection(db, "orders"));
      const totalRevenue = ordersSnap.docs.reduce((acc, doc) => acc + (doc.data().totalAmount || 0), 0);

      // Fetch Feedbacks/Testimonials
      const feedbackSnap = await getDocs(collection(db, "testimonials"));
      const feedbackList = feedbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));

      setStats({
        users: usersSnap.size,
        revenue: totalRevenue,
        feedback: feedbackSnap.size
      });
      setUsers(usersList.slice(0, 5)); // Show recent 5
      setFeedbacks(feedbackList.slice(0, 5));
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title: announcementTitle,
        content: announcementContent,
        date: new Date().toLocaleDateString(),
        timestamp: new Date()
      });
      setMessage('Announcement published successfully!');
      setAnnouncementTitle('');
      setAnnouncementContent('');
    } catch (error) {
      setMessage('Failed to publish announcement.');
    }
    setIsSubmitting(false);
  };

  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "events"), {
        title: eventTitle,
        date: eventDate,
        location: eventLocation,
        timestamp: new Date()
      });
      setMessage('Event published successfully!');
      setEventTitle('');
      setEventDate('');
      setEventLocation('');
    } catch (error) {
      setMessage('Failed to publish event.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
          <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 border-b dark:border-gray-700 pb-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Overview & Stats
          </button>
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'announcements' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Manage Announcements
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'events' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Manage Events
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-lg flex justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')}><XCircle className="w-5 h-5"/></button>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.users}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">₹{stats.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Feedback Received</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.feedback}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users Table */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Recent Users</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Email</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {users.map((u, i) => (
                        <tr key={i} className="border-b dark:border-gray-700 last:border-0">
                          <td className="py-3 text-gray-800 dark:text-gray-200">{u.name}</td>
                          <td className="py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

               {/* Recent Feedback */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Recent Feedback</h3>
                <div className="space-y-4">
                  {feedbacks.map((f, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{f.studentName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">"{f.testimonialText}"</p>
                    </div>
                  ))}
                  {feedbacks.length === 0 && <p className="text-gray-500 text-sm">No feedback yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Publish New Announcement</h2>
            <form onSubmit={handlePublishAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input 
                  type="text" 
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                <textarea 
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  rows={4}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Publish Upcoming Event</h2>
            <form onSubmit={handlePublishEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
                <input 
                  type="text" 
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input 
                  type="text" 
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g. University Hall"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Event'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;