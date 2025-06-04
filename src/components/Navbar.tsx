import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, User, LogOut } from 'lucide-react';
import { useStore } from '../store';

function Navbar() {
  const { isDarkMode, toggleDarkMode, currentUser, setCurrentUser } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    window.location.href = '/';
  };

  return (
    <nav className={`${isDarkMode ? 'dark bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            JobPortal
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={`/${currentUser.role}/dashboard`}
                  className={`flex items-center space-x-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <User size={20} />
                  <span>{currentUser.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  } hover:text-gray-600 dark:hover:text-gray-300`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;