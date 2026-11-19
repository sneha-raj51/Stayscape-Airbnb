import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-[20/19] bg-neutral-200 rounded-2xl" />

      {/* Content Skeleton */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-neutral-200 rounded w-2/3" />
          <div className="h-4 bg-neutral-200 rounded w-8" />
        </div>
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
        <div className="h-4 bg-neutral-200 rounded w-1/3 pt-1" />
      </div>
    </div>
  );
};

export default SkeletonCard;
