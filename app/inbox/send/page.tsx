"use client";
import React, { Suspense} from 'react';
import Send from '@/components/Send';
import { theme } from "@/app/theme";
import LoadingProcessingPage from '@/components/ProcessLoading';

const Page: React.FC = () => {
  return (
    <Suspense fallback={<LoadingProcessingPage />}>
    <div className="flex h-[100dvh] flex-col " style={{ backgroundColor: theme.colors.background }}>
      <Send />
    </div>
    </Suspense>
  );
};

export default Page;