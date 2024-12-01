"use client";
import React, { useState } from 'react';
import FooterNav from '@/components/FooterNav';
import Send from '@/components/Send';
import withAuth from "@/components/hoc/withAuth";

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

export default withAuth(Page);