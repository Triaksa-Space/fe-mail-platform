"use client";
import React, { useState } from 'react';
import FooterNav from '@/components/FooterNav';
import Send from '@/components/Send';

const Page: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
      <Send />
      </div>
      <FooterNav/>
    </div>
  );
};

export default Page;