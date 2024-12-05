"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput: React.FC<{
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  error?: string | null;
}> = ({ id, placeholder, value, onChange, showPassword, setShowPassword, error }) => (
  <div className="mb-4">
    <div className="relative">
      <input
        className={`shadow appearance-none border ${error ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10`}
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-gray-400" />
        ) : (
          <Eye className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
);

const Settings: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const { toast } = useToast();

  const validatePasswords = () => {
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Your confirmation password doesn't match.");
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  const handleSubmit = async () => {
    setOldPasswordError(null);
    setConfirmPasswordError(null);

    if (!validatePasswords()) return;

    setIsLoading(true);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/change_password`,
        {
          old_password: currentPassword,
          new_password: newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        description: "Password successfully updated!",
        className: "bg-green-500 text-white border-0",
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setOldPasswordError("The password you entered is incorrect.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center p-2 bg-white">
          <div className="flex items-center gap-2">
            <label className="text-xl font-bold">
              Change Password
            </label>
          </div>
        </div>

        <div className="flex justify-center items-start p-4">
          <form className="w-full max-w-lg text-sm" onSubmit={(e) => e.preventDefault()}>
            <PasswordInput
              id="current-password"
              placeholder="Old Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              showPassword={showCurrentPassword}
              setShowPassword={setShowCurrentPassword}
              error={oldPasswordError}
            />
            <PasswordInput
              id="new-password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              showPassword={showNewPassword}
              setShowPassword={setShowNewPassword}
            />
            <PasswordInput
              id="confirm-password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
              error={confirmPasswordError}
            />
            <div className="flex items-center justify-center">
              <Button
                className="w-3/4 bg-[#F7D65D] hover:bg-[#F7D65D]/90 text-black py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleSubmit}
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              >
                Submit
              </Button>
            </div>
          </form>
        </div>

        <div className="p-4">
          <div className="fixed bottom-24 left-0 right-0 w-3/4 flex items-center justify-center max-w-lg mx-auto">
            <Button
              className="w-3/4 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default Settings;