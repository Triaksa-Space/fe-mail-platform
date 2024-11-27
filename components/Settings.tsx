import React, { useState } from 'react';
import { Button } from './ui/button';

const Settings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isFormValid = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleLogout = () => {
    console.log('User logged out');
    window.location.href = '/signin';
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center p-2 bg-white">
        <div className="flex items-center gap-2">
          <label className="text-xl font-bold">
            Change Password
          </label>
        </div>
      </div>

      <div className="flex justify-center items-start p-4">
        <form className="w-full max-w-lg text-sm">
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="current-password"
              type="password"
              placeholder="Old Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="new-password"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirm-password"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-center">
            <Button
              className={`w-3/4 bg-[#F7D65D] hover:bg-[#F7D65D]/90 text-black py-2 px-4 rounded focus:outline-none focus:shadow-outline ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="button"
              disabled={!isFormValid}
            >
              Submit
            </Button>
          </div>
        </form>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-center max-w-lg mx-auto">
          <Button
            className="w-3/4 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;