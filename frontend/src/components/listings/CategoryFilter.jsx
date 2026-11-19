import React from 'react';
import {
  MdOutlineBeachAccess,
  MdOutlineCabin,
  MdOutlineApartment,
  MdOutlineVilla,
} from 'react-icons/md';
import {
  TbMountain,
  TbTrendingUp,
  TbBuildingCastle,
  TbCampfire,
  TbTrees,
  TbPool,
} from 'react-icons/tb';
import { FiHome } from 'react-icons/fi';

export const CATEGORIES = [
  { id: 'all', label: 'All Stays', icon: FiHome, propertyType: '' },
  { id: 'apartment', label: 'Apartments', icon: MdOutlineApartment, propertyType: 'apartment' },
  { id: 'house', label: 'Houses', icon: FiHome, propertyType: 'house' },
  { id: 'villa', label: 'Luxury Villas', icon: MdOutlineVilla, propertyType: 'villa' },
  { id: 'cabin', label: 'Cabins', icon: MdOutlineCabin, propertyType: 'cabin' },
  { id: 'beachfront', label: 'Beachfront', icon: MdOutlineBeachAccess, keyword: 'beach' },
  { id: 'mountains', label: 'Mountains', icon: TbMountain, keyword: 'mountain' },
  { id: 'countryside', label: 'Countryside', icon: TbTrees, keyword: 'countryside' },
  { id: 'trending', label: 'Trending', icon: TbTrendingUp, sort: '-averageRating' },
];

const CategoryFilter = ({ selectedCategory = 'all', onSelectCategory }) => {
  return (
    <div className="relative border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8 overflow-x-auto no-scrollbar py-4">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category)}
                className={`flex flex-col items-center space-y-2 shrink-0 pb-2 border-b-2 transition-all group ${
                  isSelected
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                }`}
              >
                <Icon
                  className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                    isSelected ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-800'
                  }`}
                />
                <span className="text-xs font-semibold whitespace-nowrap tracking-tight">
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
