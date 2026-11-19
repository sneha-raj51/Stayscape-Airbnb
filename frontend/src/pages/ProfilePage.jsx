import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import uploadService from '../services/uploadService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiLock,
  FiCamera,
  FiCheck,
  FiSave,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState('guest');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getUserProfile();
        if (response.success && response.data?.user) {
          const u = response.data.user;
          setName(u.name || '');
          setPhone(u.phone || '');
          setAvatar(u.avatar || '');
          setRole(u.role || 'guest');
        }
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await userService.updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar.trim(),
        role: role === 'host' ? 'host' : undefined,
      });

      if (response.success) {
        toast.success('Profile updated successfully');
        updateUser(response.data.user);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const response = await uploadService.uploadImage(file);
      if (response.success && response.data?.url) {
        setAvatar(response.data.url);
        toast.success('Avatar uploaded! Click "Save Changes" to apply.');
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed. You can paste an image URL instead.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error('Please enter your current and new passwords');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await userService.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your account..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Account Profile
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage your personal information, contact details, and account security
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Summary Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm text-center space-y-4">
              <div className="relative w-28 h-28 mx-auto">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-neutral-800 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                    {name ? name.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                )}

                {/* Upload overlay button */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white cursor-pointer shadow-md transition-transform hover:scale-110"
                  title="Upload avatar"
                >
                  <FiCamera className="w-4 h-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadingAvatar && (
                <p className="text-xs text-brand-600 font-semibold animate-pulse">
                  Uploading image...
                </p>
              )}

              <div>
                <h3 className="font-bold text-neutral-900 text-lg">{name || 'Guest User'}</h3>
                <p className="text-xs text-neutral-500">{user?.email}</p>
                <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold uppercase tracking-wider">
                  <FiShield className="w-3.5 h-3.5" />
                  <span>{user?.role}</span>
                </div>
              </div>

              {user?.role === 'guest' && (
                <div className="pt-4 border-t border-neutral-100 text-left">
                  <p className="text-xs font-semibold text-neutral-800 mb-1">
                    Ready to host guests?
                  </p>
                  <p className="text-xs text-neutral-500 mb-3">
                    Upgrade to a host account and start earning with your extra space.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('host');
                      toast('Click "Save Changes" to activate your host status', { icon: '✨' });
                    }}
                    className="w-full py-2 rounded-xl border border-brand-500 text-brand-600 hover:bg-brand-50 font-bold text-xs transition-colors"
                  >
                    Switch to Host
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Profile & Password Forms */}
          <div className="md:col-span-2 space-y-8">
            {/* 1. Personal Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                Personal Details
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Legal Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-500 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Change Password */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                Security & Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
                  >
                    <span>{passwordLoading ? 'Updating...' : 'Change Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
