"use client";
import React from 'react';
import FooterNav from '@/components/FooterNav';
import Send from '@/components/Send';
import withAuth from "@/components/hoc/withAuth";
import { theme } from "@/app/theme";

const Page: React.FC = () => {
  return (
    <div className="flex h-[100dvh] flex-col " style={{ backgroundColor: theme.colors.background }}>
      <Send />
      <FooterNav />
    </div>
  );
};

export default withAuth(Page);