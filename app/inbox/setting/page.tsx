"use client";
import React from 'react';
import FooterNav from '@/components/FooterNav';
import Settings from '@/components/Settings';
import withAuth from "@/components/hoc/withAuth";
import { theme } from '@/app/theme';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';

const SettingPage: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex h-[100dvh] flex-col" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto">
        <Settings />
      </div>
      <div className="w-full bg-white pl-4 pr-4">
        <div className="w-full max-w-lg mx-auto px-4 py-3">
          <Button
            className="w-3/4 max-w-md mx-auto bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-2"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
      <footer className="w-full z-10">
        <FooterNav />
      </footer>
    </div>
  );
};

export default withAuth(SettingPage);