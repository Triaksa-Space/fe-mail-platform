import React from 'react';
import { Mail, Send, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from 'next/navigation';

const FooterNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isInboxActive = pathname === '/inbox' || /^\/inbox\/\d+$/.test(pathname);

  return (
    <div className="flex justify-around p-4 border-t bg-white fixed bottom-0 left-0 right-0">
      <Button
        variant="ghost"
        className={`flex-1 flex flex-col items-center gap-1 hover:bg-[#F7D65D]/90 text-black ${isInboxActive ? 'bg-[#ffeeac]' : ''}`}
        onClick={() => router.push('/inbox')}
      >
        <Mail className="h-6 w-6" />
        <span className="text-xs">INBOX</span>
      </Button>
      <Button
        variant="ghost"
        className={`flex-1 flex flex-col items-center gap-1 hover:bg-[#F7D65D]/90 text-black ${pathname === '/inbox/send' ? 'bg-[#ffeeac]' : ''}`}
        onClick={() => router.push('/inbox/send')}
      >
        <Send className="h-6 w-6" />
        <span className="text-xs">SEND</span>
      </Button>
      <Button
        variant="ghost"
        className={`flex-1 flex flex-col items-center gap-1 hover:bg-[#F7D65D]/90 text-black ${pathname === '/inbox/setting' ? 'bg-[#ffeeac]' : ''}`}
        onClick={() => router.push('/inbox/setting')}
      >
        <Settings className="h-6 w-6" />
        <span className="text-xs">SETTINGS</span>
      </Button>
    </div>
  );
};

export default FooterNav;