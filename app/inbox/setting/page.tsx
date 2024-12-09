"use client";
import React from 'react';
import FooterNav from '@/components/FooterNav';
import Settings from '@/components/Settings';
import withAuth from "@/components/hoc/withAuth";
import { theme } from '@/app/theme';

const SettingPage: React.FC = () => {
  return (
    <div className="flex h-[100dvh] flex-col " style={{ backgroundColor: theme.colors.background }}>
      <Settings />
      <FooterNav />
    </div>
  );
};

export default withAuth(SettingPage);