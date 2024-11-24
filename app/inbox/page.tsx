"use client";
import React, { useState } from 'react';
import FooterNav from '@/components/FooterNav';
import Inbox from '@/components/Inbox';
import Send from '@/components/Send';
import Settings from '@/components/Settings';
import { Email } from '@/types/email';

const emails: Email[] = [
      {
        id: "1",
        sender: "Google Gemini",
        subject: "Welcome to Gemini",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "Just now"
      },
      {
        id: "2",
        sender: "Google Play",
        subject: "You Google Play Order Receipt from Nov 11, 20...",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "2 Minutes ago"
      },
      {
        id: "3",
        sender: "Netflix",
        subject: "Selamat datang di Netflix, johny",
        preview: "Kamu siap untuk menikmati acara TV & film terbaru kami...",
        timestamp: "1 Hour ago"
      },
      {
        id: "4",
        sender: "DigitalOcean Support",
        subject: "[DigitalOcean] Your 2024-10 invoice for team: ...",
        preview: "Your 2024-10 invoice is now available for team: GameMar...",
        timestamp: "24 Hours ago"
      },
      {
        id: "5",
        sender: "Google Play",
        subject: "You Google Play Order Receipt from Nov 11, 20...",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "10 Sep 2024"
      },
      {
        id: "6",
        sender: "Google Gemini",
        subject: "Welcome to Gemini",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "Just now"
      },
      {
        id: "7",
        sender: "Google Play",
        subject: "You Google Play Order Receipt from Nov 11, 20...",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "2 Minutes ago"
      },
      {
        id: "8",
        sender: "Netflix",
        subject: "Selamat datang di Netflix, johny",
        preview: "Kamu siap untuk menikmati acara TV & film terbaru kami...",
        timestamp: "1 Hour ago"
      },
      {
        id: "9",
        sender: "DigitalOcean Support",
        subject: "[DigitalOcean] Your 2024-10 invoice for team: ...",
        preview: "Your 2024-10 invoice is now available for team: GameMar...",
        timestamp: "24 Hours ago"
      },
      {
        id: "10",
        sender: "Google Play",
        subject: "You Google Play Order Receipt from Nov 11, 20...",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "10 Sep 2024"
      }
    ]

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('inbox');

  const renderContent = () => {
    switch (currentPage) {
      case 'inbox':
        return <Inbox emails={emails} />;
      case 'send':
        return <Send />;
      case 'settings':
        return <Settings />;
      default:
        return <Inbox emails={emails} />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
      <FooterNav setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default Page;