"use client";
import React, { useState } from 'react';
import FooterNav from '@/components/FooterNav';
import Inbox from '@/components/Inbox';
import Send from '@/components/Send';
import Settings from '@/components/Settings';
import { Email } from '@/types/email';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const emails: Email[] = [
      {
        id: 1,
        recipient: "",
        body: "",
        sender: "Google Gemini",
        subject: "Welcome to Gemini",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "Just now"
      },
      {
        id: 2,
        recipient: "",
        body: "",
        sender: "Google Play",
        subject: "You Google Play Order Receipt from Nov 11, 20...",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "2 Minutes ago"
      },
      {
        id: 3,
        recipient: "",
        body: "",
        sender: "Netflix",
        subject: "Selamat datang di Netflix, johny",
        preview: "Kamu siap untuk menikmati acara TV & film terbaru kami...",
        timestamp: "1 Hour ago"
      },
      {
        id: 4,
        recipient: "",
        body: "",
        sender: "DigitalOcean Support",
        subject: "[DigitalOcean] Your 2024-10 invoice for team: ...",
        preview: "Your 2024-10 invoice is now available for team: GameMar...",
        timestamp: "24 Hours ago"
      },
      {
        id: 5,
        recipient: "",
        body: "",
        sender: "Google Play",
        subject: "You Google Play Order Receipt from Nov 11, 20...",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "10 Sep 2024"
      },
      {
        id: 6,
        recipient: "",
        body: "",
        sender: "Google Gemini",
        subject: "Welcome to Gemini",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "Just now"
      },
      {
        id: 7,
        recipient: "",
        body: "",
        sender: "Google Play",
        subject: "You Google Play Order Receipt from Nov 11, 20...",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "2 Minutes ago"
      },
      {
        id: 8,
        recipient: "",
        body: "",
        sender: "Netflix",
        subject: "Selamat datang di Netflix, johny",
        preview: "Kamu siap untuk menikmati acara TV & film terbaru kami...",
        timestamp: "1 Hour ago"
      },
      {
        id: 9,
        recipient: "",
        body: "",
        sender: "DigitalOcean Support",
        subject: "[DigitalOcean] Your 2024-10 invoice for team: ...",
        preview: "Your 2024-10 invoice is now available for team: GameMar...",
        timestamp: "24 Hours ago"
      },
      {
        id: 10,
        recipient: "",
        body: "",
        sender: "Google Play",
        subject: "You Google Play Order Receipt from Nov 11, 20...",
        preview: "Learn more about what you can do with Gemini",
        timestamp: "10 Sep 2024"
      }
    ]

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('inbox');
  const router = useRouter();

  // const renderContent = () => {
  //   switch (currentPage) {
  //     case 'inbox':
  //       return <Inbox emails={emails} />;
  //     case 'send':
  //       return <Send />;
  //     case 'settings':
  //       return <Settings />;
  //     default:
  //       return <Inbox emails={emails} />;
  //   }
  // };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
      <div className="space-y-0.5">
      <div className="flex justify-between p-2 bg-[#F7D65D]">
        <h1 className="text-xl font-semibold tracking-tight">
          john@mailria.com
        </h1>
        <h1 className="text-sm font-semibold tracking-tight">
        Daily Send 0/3
        </h1>
      </div>
      {emails.map((email) => (
        <div
        key={email.id}
        className="p-4 hover:bg-gray-100 cursor-pointer"
        onClick={() => router.push(`/inbox/${email.id}`)}
      >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{email.sender}</h3>
              <span className="text-sm text-gray-500">{email.timestamp}</span>
            </div>
            <h4 className="font-medium">{email.subject}</h4>
            <p className="text-sm text-gray-500">{email.preview}</p>
          </div>
          <Separator className="mt-4" />
        </div>
      ))}
    </div>
      </div>
      <FooterNav />
    </div>
  );
};

export default Page;