'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';  // Changed from 'next/router'

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Please log in</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Welcome, {user.first_name || user.email}!</h2>
          <p className="text-gray-600">Email: {user.email}</p>
          {user.profile_picture && (
            <img 
              src={user.profile_picture} 
              alt="Profile" 
              className="w-20 h-20 rounded-full mt-4"
            />
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}