import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiSearch,
  FiGlobe,
  FiMenu,
  FiUser,
  FiHeart,
  FiLogOut,
  FiCalendar,
  FiPlusCircle,
  FiGrid,
  FiSliders,
  FiShield,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, isHost, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-500 font-sans">
              Stay<span className="text-neutral-900">Scape</span>
            </span>
          </Link>

          {/* Compact Pill Search (for medium and large viewports) */}
          <Link
            to="/listings"
            className="hidden md:flex items-center space-x-4 px-4 py-2 border border-neutral-200 rounded-full shadow-sm hover:shadow-md transition-shadow text-sm text-neutral-800"
          >
            <span className="font-semibold text-neutral-900 pl-2">Anywhere</span>
            <span className="w-px h-4 bg-neutral-200" />
            <span className="font-semibold text-neutral-900">Any week</span>
            <span className="w-px h-4 bg-neutral-200" />
            <span className="text-neutral-500">Add guests</span>
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white ml-2">
              <FiSearch className="w-4 h-4" />
            </div>
          </Link>

          {/* Right Navigation Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Explore Button */}
            <Link
              to="/listings"
              className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 px-3 py-2 rounded-full hover:bg-neutral-100 transition-colors hidden sm:block"
            >
              Explore
            </Link>

            {/* Host CTA */}
            {(!isAuthenticated || !isHost) ? (
              <Link
                to={isAuthenticated ? "/profile" : "/register"}
                className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 px-3 py-2 rounded-full hover:bg-neutral-100 transition-colors hidden lg:block"
              >
                Become a Host
              </Link>
            ) : (
              <Link
                to="/host/dashboard"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 px-3 py-2 rounded-full hover:bg-brand-50 transition-colors hidden lg:block"
              >
                Host Dashboard
              </Link>
            )}

            {/* User Dropdown Menu Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-1.5 sm:px-3 sm:py-1.5 border border-neutral-200 rounded-full hover:shadow-md transition-all text-neutral-700 bg-white"
                aria-label="User navigation menu"
              >
                <FiMenu className="w-4 h-4 ml-1 text-neutral-600" />
                {isAuthenticated && user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-700 text-white flex items-center justify-center text-xs font-semibold">
                    {isAuthenticated && user?.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <FiUser className="w-4 h-4" />
                    )}
                  </div>
                )}
              </button>

              {/* Dropdown Card */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-dropdown border border-neutral-100 py-2 z-50 text-sm">
                  {isAuthenticated ? (
                    <>
                      {/* Authenticated user greeting */}
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="font-semibold text-neutral-900 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {user?.email}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/my-bookings"
                          className="flex items-center space-x-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        >
                          <FiCalendar className="w-4 h-4 text-neutral-400" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        >
                          <FiUser className="w-4 h-4 text-neutral-400" />
                          <span>Account Profile</span>
                        </Link>
                        <Link
                          to="/listings"
                          className="flex items-center space-x-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        >
                          <FiSearch className="w-4 h-4 text-neutral-400" />
                          <span>Explore Stays</span>
                        </Link>
                      </div>

                      {/* Host Section */}
                      <div className="border-t border-neutral-100 py-1">
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center space-x-3 px-4 py-2.5 text-neutral-900 font-bold hover:bg-neutral-100"
                          >
                            <FiShield className="w-4 h-4 text-neutral-900" />
                            <span>Admin Console</span>
                          </Link>
                        )}
                        {isHost ? (
                          <>
                            <Link
                              to="/host/dashboard"
                              className="flex items-center space-x-3 px-4 py-2.5 text-brand-600 font-medium hover:bg-brand-50"
                            >
                              <FiGrid className="w-4 h-4 text-brand-500" />
                              <span>Host Dashboard</span>
                            </Link>
                            <Link
                              to="/host/listings"
                              className="flex items-center space-x-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50"
                            >
                              <FiPlusCircle className="w-4 h-4 text-neutral-400" />
                              <span>Manage Listings</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50"
                          >
                            <FiPlusCircle className="w-4 h-4 text-neutral-400" />
                            <span>Become a Host</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-neutral-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 text-left"
                        >
                          <FiLogOut className="w-4 h-4 text-rose-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-2.5 font-semibold text-neutral-900 hover:bg-neutral-50"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center px-4 py-2.5 text-neutral-700 hover:bg-neutral-50"
                      >
                        Sign up
                      </Link>
                      <div className="border-t border-neutral-100 my-1" />
                      <Link
                        to="/listings"
                        className="flex items-center px-4 py-2.5 text-neutral-700 hover:bg-neutral-50"
                      >
                        Explore properties
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center px-4 py-2.5 text-neutral-700 hover:bg-neutral-50"
                      >
                        Host your home
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
