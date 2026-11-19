import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiCompass } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white text-center">
      <div className="max-w-md space-y-6">
        <div className="text-8xl font-extrabold text-neutral-200 select-none">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            The page you're searching for doesn't exist or may have been relocated.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors shadow-md shadow-brand-500/25"
          >
            <FiHome className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/listings"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full border border-neutral-300 hover:border-neutral-800 text-neutral-800 font-bold text-sm transition-colors"
          >
            <FiCompass className="w-4 h-4" />
            <span>Explore Stays</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
