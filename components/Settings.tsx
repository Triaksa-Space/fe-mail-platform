"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import PasswordInput from './PasswordInput';

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
        variant: "default",
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setOldPasswordError("The password you entered is incorrect.");
        } else if (err.response?.data?.error) {
          toast({
            description: `Failed to update password. ${err.response.data.error}`,
            variant: "destructive",
          });
        } else {
          toast({
            description: `Failed to update password. ${err.message}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          description: "Failed to update password. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center p-2" >
        <div className="flex items-center gap-2">
          <label className="text-xl font-bold">
            Change Password
          </label>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-center items-start p-4">
          <form className="w-full max-w-lg text-sm p-4" onSubmit={(e) => e.preventDefault()}>
            <PasswordInput
              id="current-password"
              placeholder="Old Password"
              value={currentPassword}
              onChange={(e) => {
                const value = e.target.value;
                setCurrentPassword(value.replace(/\s/g, '')); // Remove spaces
              }}
              showPassword={showCurrentPassword}
              setShowPassword={setShowCurrentPassword}
              error={oldPasswordError}
            />
            <PasswordInput
              id="new-password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                const value = e.target.value;
                setNewPassword(value.replace(/\s/g, '')); // Remove spaces
              }}
              showPassword={showNewPassword}
              setShowPassword={setShowNewPassword}
            />
            <PasswordInput
              id="confirm-password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                const value = e.target.value;
                setConfirmPassword(value.replace(/\s/g, '')); // Remove spaces
              }}
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
              error={confirmPasswordError}
            />
            <div className="flex items-center justify-center">
              <Button
                // className="w-3/4 bg-[#F7D65D] font-bold hover:bg-[#F7D65D]/90 text-black py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                className={`w-3/4 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading || !currentPassword || !newPassword || !confirmPassword
                  ? 'bg-gray-300 text-black cursor-not-allowed'
                  : 'bg-[#ffeeac] hover:bg-yellow-300 text-black'
                  }`}
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
      </main>
      <Toaster />
    </>
  );
};

export default Settings;