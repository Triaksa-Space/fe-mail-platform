"use client";
import React from 'react';
import FooterNav from '@/components/FooterNav';
import Settings from '@/components/Settings';
import withAuth from "@/components/hoc/withAuth";

const SettingPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
      <Settings />
      </div>
      <FooterNav/>
    </div>
  );
};

export default withAuth(SettingPage);