"use client";
import React from 'react';
import Send from '@/components/Send';
import { theme } from "@/app/theme";

const Page: React.FC = () => {
  return (
    <div className="flex h-[100dvh] flex-col " style={{ backgroundColor: theme.colors.background }}>
      <Send />
    </div>
  );
};

export default Page;