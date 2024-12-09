import React from 'react';
import { Mail, Send, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from 'next/navigation';
import { theme } from '@/app/theme';

const FooterNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isInboxActive = pathname === '/inbox' || /^\/inbox\/\d+$/.test(pathname);

  return (
    <footer className="border-t bg-background">
        <div className="grid grid-cols-3 p-2">
      <Button
        variant="ghost"
        className={`flex-1 flex flex-col items-center gap-1 text-black ${isInboxActive ? 'bg-[#ffeeac] hover:bg-[#ffeeac]' : 'hover:bg-[#F7D65D]/90'}`}
        onClick={() => router.push('/inbox')}
        style={{ borderRadius: theme.borders.radius }}
      >
        <Mail className="h-6 w-6" />
        <span className="text-xs">INBOX</span>
      </Button>
      <Button
        variant="ghost"
        className={`flex-1 flex flex-col items-center gap-1 text-black ${pathname === '/inbox/send' ? 'bg-[#ffeeac] hover:bg-[#ffeeac]' : 'hover:bg-[#F7D65D]/90'}`}
        onClick={() => router.push('/inbox/send')}
        style={{ borderRadius: theme.borders.radius }}
      >
        <Send className="h-6 w-6" />
        <span className="text-xs">SEND</span>
      </Button>
      <Button
        variant="ghost"
        className={`flex-1 flex flex-col items-center gap-1 text-black ${pathname === '/inbox/setting' ? 'bg-[#ffeeac] hover:bg-[#ffeeac]' : 'hover:bg-[#F7D65D]/90'}`}
        onClick={() => router.push('/inbox/setting')}
        style={{ borderRadius: theme.borders.radius }}
      >
        <Settings className="h-6 w-6" />
        <span className="text-xs">SETTINGS</span>
      </Button>
      </div>
    </footer>
  );
};

export default FooterNav;