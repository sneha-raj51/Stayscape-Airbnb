import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = FiSearch,
  title = 'No results found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-neutral-800 mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm mb-6 leading-relaxed">{description}</p>
      {actionText && (actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm transition-colors shadow-sm"
        >
          {actionText}
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="inline-flex items-center px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm transition-colors shadow-sm"
        >
          {actionText}
        </button>
      ))}
    </div>
  );
};

export default EmptyState;
