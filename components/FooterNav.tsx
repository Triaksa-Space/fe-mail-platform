import React from 'react';
import { Mail, Send, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const FooterNav = () => {
  const router = useRouter();

  return (
    <div className="flex justify-around p-4 border-t bg-white">
      <Button
        variant="ghost"
        className="flex-1 flex flex-col items-center gap-1 hover:bg-[#F7D65D]/90 text-black"
        onClick={() => router.push('/inbox')}
      >
        <Mail className="h-6 w-6" />
        <span className="text-xs">INBOX</span>
      </Button>
      <Button
        variant="ghost"
        className="flex-1 flex flex-col items-center gap-1 hover:bg-[#F7D65D]/90 text-black"
        onClick={() => router.push('/inbox/send')}
      >
        <Send className="h-6 w-6" />
        <span className="text-xs">SEND</span>
      </Button>
      <Button
        variant="ghost"
        className="flex-1 flex flex-col items-center gap-1 hover:bg-[#F7D65D]/90 text-black"
        onClick={() => router.push('/inbox/setting')}
      >
        <Settings className="h-6 w-6" />
        <span className="text-xs">SETTINGS</span>
      </Button>
    </div>
  );
};

export default FooterNav;