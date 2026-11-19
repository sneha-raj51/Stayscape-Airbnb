import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import {
  FiUsers,
  FiHome,
  FiCalendar,
  FiDollarSign,
  FiShield,
  FiTrash2,
  FiSearch,
  FiStar,
  FiRefreshCw,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'listings' | 'bookings'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab Data
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAdminStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrator statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch tab data when activeTab changes
  useEffect(() => {
    const fetchTabData = async () => {
      setTabLoading(true);
      try {
        if (activeTab === 'users') {
          const res = await adminService.getAllUsers({
            search: userSearch,
            role: userRoleFilter,
          });
          if (res.success && res.data?.users) {
            setUsers(res.data.users);
          }
        } else if (activeTab === 'listings') {
          const res = await adminService.getAllListings();
          if (res.success && res.data?.listings) {
            setListings(res.data.listings);
          }
        } else if (activeTab === 'bookings') {
          const res = await adminService.getAllBookings();
          if (res.success && res.data?.bookings) {
            setBookings(res.data.bookings);
          }
        }
      } catch (err) {
        toast.error(`Failed to load ${activeTab} data`);
      } finally {
        setTabLoading(false);
      }
    };

    if (activeTab !== 'overview') {
      fetchTabData();
    }
  }, [activeTab, userRoleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user permanently?')) {
      return;
    }

    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        toast.success('User account deleted');
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading Admin Console..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message={error} onRetry={fetchStats} />
      </div>
    );
  }

  const metrics = stats?.metrics || {};

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                Platform Administration
              </h1>
              <p className="text-neutral-500 text-sm">
                Global governance, accounts, listings, and platform metrics
              </p>
            </div>
          </div>

          <button
            onClick={fetchStats}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-neutral-300 hover:bg-white text-neutral-700 text-xs font-semibold transition-colors"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Stats</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-neutral-200 text-sm font-semibold">
          {[
            { id: 'overview', label: 'Platform Overview' },
            { id: 'users', label: 'Users Directory' },
            { id: 'listings', label: 'All Listings' },
            { id: 'bookings', label: 'All Bookings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Total Users
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FiUsers className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-neutral-900">
                  {metrics.totalUsers || 0}
                </div>
                <p className="text-xs text-neutral-400">
                  {metrics.userBreakdown?.guests || 0} Guests · {metrics.userBreakdown?.hosts || 0} Hosts · {metrics.userBreakdown?.admins || 0} Admins
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Properties Listed
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FiHome className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-neutral-900">
                  {metrics.totalListings || 0}
                </div>
                <p className="text-xs text-neutral-400">Total active & hosted stays</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Total Bookings
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FiCalendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-neutral-900">
                  {metrics.totalBookings || 0}
                </div>
                <p className="text-xs text-neutral-400">
                  {metrics.bookingBreakdown?.confirmed || 0} Confirmed · {metrics.bookingBreakdown?.cancelled || 0} Cancelled
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Platform Volume
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiDollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-emerald-600">
                  ${(metrics.totalRevenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-neutral-400">Collected booking payments</p>
              </div>
            </div>

            {/* Recent Registrations & Recent Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold text-neutral-900 text-base mb-4">
                  Recent User Registrations
                </h3>
                <div className="divide-y divide-neutral-100">
                  {(stats?.recentUsers || []).map((u) => (
                    <div key={u._id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-neutral-900">{u.name}</p>
                        <p className="text-xs text-neutral-500">{u.email}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold text-neutral-900 text-base mb-4">
                  Latest Platform Bookings
                </h3>
                <div className="divide-y divide-neutral-100">
                  {(stats?.recentBookings || []).map((b) => (
                    <div key={b._id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-neutral-900">{b.listing?.title || 'Stay'}</p>
                        <p className="text-xs text-neutral-500">By {b.guest?.name || 'Guest'}</p>
                      </div>
                      <span className="font-bold text-neutral-900 text-sm">
                        ${b.totalPrice?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-neutral-900 text-base">Users Directory</h3>
              <div className="flex items-center space-x-3">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="guest">Guests</option>
                  <option value="host">Hosts</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            {tabLoading ? (
              <div className="p-12 flex justify-center">
                <LoadingSpinner size="md" message="Loading users..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100">
                    <tr>
                      <th className="py-3 px-6">Name</th>
                      <th className="py-3 px-6">Email</th>
                      <th className="py-3 px-6">Role</th>
                      <th className="py-3 px-6">Joined</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-neutral-900">{u.name}</td>
                        <td className="py-4 px-6 text-neutral-600">{u.email}</td>
                        <td className="py-4 px-6">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-neutral-200 text-xs font-bold uppercase tracking-wider bg-white capitalize"
                          >
                            <option value="guest">Guest</option>
                            <option value="host">Host</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-xs text-neutral-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALL LISTINGS */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base">Platform Listings</h3>
            </div>

            {tabLoading ? (
              <div className="p-12 flex justify-center">
                <LoadingSpinner size="md" message="Loading listings..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100">
                    <tr>
                      <th className="py-3 px-6">Property Title</th>
                      <th className="py-3 px-6">Host</th>
                      <th className="py-3 px-6">Location</th>
                      <th className="py-3 px-6">Price / Night</th>
                      <th className="py-3 px-6">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {listings.map((l) => (
                      <tr key={l._id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-neutral-900 max-w-xs truncate">
                          {l.title}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-neutral-900">{l.host?.name || 'Host'}</div>
                          <div className="text-xs text-neutral-400">{l.host?.email}</div>
                        </td>
                        <td className="py-4 px-6 text-xs text-neutral-600">
                          {l.location?.city}, {l.location?.country}
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-900">
                          ${l.pricePerNight?.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-1 text-xs font-semibold">
                            <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{l.averageRating > 0 ? l.averageRating.toFixed(1) : 'New'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ALL BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base">Global Bookings</h3>
            </div>

            {tabLoading ? (
              <div className="p-12 flex justify-center">
                <LoadingSpinner size="md" message="Loading bookings..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100">
                    <tr>
                      <th className="py-3 px-6">Property</th>
                      <th className="py-3 px-6">Guest</th>
                      <th className="py-3 px-6">Host</th>
                      <th className="py-3 px-6">Dates</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-neutral-900 max-w-xs truncate">
                          {b.listing?.title || 'Listing'}
                        </td>
                        <td className="py-4 px-6 text-neutral-800 font-medium">
                          {b.guest?.name || 'Guest'}
                        </td>
                        <td className="py-4 px-6 text-neutral-600 text-xs">
                          {b.host?.name || 'Host'}
                        </td>
                        <td className="py-4 px-6 text-xs text-neutral-600">
                          {new Date(b.checkIn).toLocaleDateString()} -{' '}
                          {new Date(b.checkOut).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : b.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-neutral-900">
                          ${b.totalPrice?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
