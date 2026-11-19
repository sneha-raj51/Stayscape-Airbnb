import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FiSearch, FiCalendar, FiUsers, FiMapPin, FiX } from 'react-icons/fi';

const SearchBar = ({ initialValues = {}, onSearchSubmit, isCompact = false }) => {
  const navigate = useNavigate();

  const [location, setLocation] = useState(initialValues.city || initialValues.keyword || '');
  const [checkIn, setCheckIn] = useState(initialValues.checkIn ? new Date(initialValues.checkIn) : null);
  const [checkOut, setCheckOut] = useState(initialValues.checkOut ? new Date(initialValues.checkOut) : null);
  const [guests, setGuests] = useState(initialValues.guests ? parseInt(initialValues.guests, 10) : 1);
  const [guestPickerOpen, setGuestPickerOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();

    const searchParams = new URLSearchParams();
    if (location.trim()) {
      searchParams.set('keyword', location.trim());
      searchParams.set('city', location.trim());
    }
    if (checkIn) {
      searchParams.set('checkIn', checkIn.toISOString().split('T')[0]);
    }
    if (checkOut) {
      searchParams.set('checkOut', checkOut.toISOString().split('T')[0]);
    }
    if (guests > 1) {
      searchParams.set('guests', guests.toString());
    }

    if (onSearchSubmit) {
      onSearchSubmit({
        keyword: location.trim(),
        city: location.trim(),
        checkIn,
        checkOut,
        guests,
      });
    } else {
      navigate(`/listings?${searchParams.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white rounded-3xl md:rounded-full border border-neutral-200/90 shadow-card hover:shadow-card-hover transition-all p-2 flex flex-col md:flex-row items-stretch md:items-center relative z-20 ${
        isCompact ? 'max-w-3xl mx-auto' : 'max-w-4xl mx-auto'
      }`}
    >
      {/* 1. Destination Input */}
      <div className="flex-1 px-4 py-2 hover:bg-neutral-50 rounded-full transition-colors relative">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
          Where
        </label>
        <div className="flex items-center space-x-2 mt-0.5">
          <FiMapPin className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search destinations, cities..."
            className="w-full bg-transparent text-sm font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none"
          />
          {location && (
            <button
              type="button"
              onClick={() => setLocation('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="hidden md:block w-px h-8 bg-neutral-200 mx-1" />

      {/* 2. Check-in Date Picker */}
      <div className="flex-1 px-4 py-2 hover:bg-neutral-50 rounded-full transition-colors">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
          Check in
        </label>
        <div className="flex items-center space-x-2 mt-0.5">
          <FiCalendar className="w-4 h-4 text-neutral-400 shrink-0" />
          <DatePicker
            selected={checkIn}
            onChange={(date) => {
              setCheckIn(date);
              if (checkOut && date && date >= checkOut) {
                const nextDay = new Date(date);
                nextDay.setDate(nextDay.getDate() + 1);
                setCheckOut(nextDay);
              }
            }}
            selectsStart
            startDate={checkIn}
            endDate={checkOut}
            minDate={new Date()}
            placeholderText="Add dates"
            className="w-full bg-transparent text-sm font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      <div className="hidden md:block w-px h-8 bg-neutral-200 mx-1" />

      {/* 3. Check-out Date Picker */}
      <div className="flex-1 px-4 py-2 hover:bg-neutral-50 rounded-full transition-colors">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
          Check out
        </label>
        <div className="flex items-center space-x-2 mt-0.5">
          <FiCalendar className="w-4 h-4 text-neutral-400 shrink-0" />
          <DatePicker
            selected={checkOut}
            onChange={(date) => setCheckOut(date)}
            selectsEnd
            startDate={checkIn}
            endDate={checkOut}
            minDate={checkIn || new Date()}
            placeholderText="Add dates"
            className="w-full bg-transparent text-sm font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      <div className="hidden md:block w-px h-8 bg-neutral-200 mx-1" />

      {/* 4. Guests Selector */}
      <div className="relative flex-1 px-4 py-2 hover:bg-neutral-50 rounded-full transition-colors">
        <div
          onClick={() => setGuestPickerOpen(!guestPickerOpen)}
          className="cursor-pointer"
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 cursor-pointer">
            Who
          </label>
          <div className="flex items-center space-x-2 mt-0.5">
            <FiUsers className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="text-sm font-medium text-neutral-800">
              {guests === 1 ? '1 guest' : `${guests} guests`}
            </span>
          </div>
        </div>

        {/* Guest dropdown popover */}
        {guestPickerOpen && (
          <div className="absolute top-full mt-3 right-0 sm:left-0 w-72 bg-white rounded-2xl shadow-dropdown border border-neutral-100 p-4 z-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-900 text-sm">Guests</p>
                <p className="text-xs text-neutral-500">Ages 13 or above</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  disabled={guests <= 1}
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-neutral-800 transition-colors"
                >
                  -
                </button>
                <span className="font-semibold text-neutral-800 w-4 text-center">
                  {guests}
                </span>
                <button
                  type="button"
                  disabled={guests >= 16}
                  onClick={() => setGuests(guests + 1)}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 disabled:opacity-40 hover:border-neutral-800 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setGuestPickerOpen(false)}
                className="text-xs font-semibold text-neutral-800 hover:underline"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Submit Button */}
      <div className="p-1">
        <button
          type="submit"
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-semibold rounded-full transition-all shadow-md shadow-brand-500/25"
        >
          <FiSearch className="w-4 h-4 stroke-[2.5]" />
          <span className="md:inline text-sm">Search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
