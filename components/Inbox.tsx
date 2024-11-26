import React from 'react';
import { Separator } from "@/components/ui/separator";
import { Email } from "@/types/email";
import { useRouter } from 'next/navigation';

const Inbox: React.FC<{ emails: Email[] }> = ({ emails }) => {
  const router = useRouter();
  
  return (
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
  );
};

export default Inbox;