"use client";
import React from 'react';
import FooterNav from '@/components/FooterNav';
import Send from '@/components/Send';
import withAuth from "@/components/hoc/withAuth";
import { theme } from "@/app/theme";

const Page: React.FC = () => {
  return (
    <div className="space-y-2" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-auto pb-20">
        <Send />
      </div>
      <FooterNav />
    </div>
  );
};

export default withAuth(Page);