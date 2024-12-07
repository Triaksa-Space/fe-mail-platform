"use client";
import React from 'react';
import FooterAdminNav from '@/components/FooterAdminNav';
import Settings from '@/components/Settings';
import withAuth from "@/components/hoc/withAuth";

const AccountPage: React.FC = () => {
  return (
    <div className="space-y-2">
      <div className="flex-1 overflow-auto pb-20">
        <Settings />
      </div>
      <FooterAdminNav />
    </div>
  );
};

export default withAuth(AccountPage);