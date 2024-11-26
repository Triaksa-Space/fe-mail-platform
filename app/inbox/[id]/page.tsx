"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Email } from "@/types/email";
import { X, Reply, DownloadIcon } from 'lucide-react';
import FooterNav from '@/components/FooterNav';
import { useParams, useRouter } from 'next/navigation';



const DetailInbox: React.FC<{ emails: Email[] }> = ({ emails }) => {
    console.log(emails);
    const router = useRouter();
    // const [currentPage, setCurrentPage] = useState('default');
    // const { id } = useParams();
    // const numericId = Number(id);
    //   const email = emails.find((e) => e.id === numericId);

    //   if (!email) {
    //     return <div>Email not found.</div>;
    //   }

    const email: Email = {
        id: 1,
        recipient: "bamas@mailria.com",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="align: center;">
              <img 
                src="https://www.annualreports.com/HostedData/CompanyLogos/digitalocean.png" 
                alt="DigitalOcean Logo" 
                style="width: 200px; height: auto;"
              />
            </div>
            
            <div style="border-radius: 8px; padding: 10px; margin: 10px 0;">
              <p style="color: #2563eb; font-size: 16px; margin-bottom: 20px;">
                Thanks for using DigitalOcean
              </p>
              
              <p style="color: #374151; line-height: 1.2;">
                Your 2024-10 invoice is now available for team:<br/>
                <strong>GameMarket</strong>. The balance was automatically charged<br/>
                to your credit card, so you don't need to do anything.<br/>
                Happy Coding!
              </p>
            </div>
          </div>
        `,
        sender: "DigitalOcean Sup - support@digitalocean.com",
        subject: "[DigitalOcean] Your 2024-10 invoice for team: GameMarket",
        preview: "Your 2024-10 invoice is now available for team: GameMarket...",
        timestamp: "Just now",
        attachments: [
            {
                name: "Invoice_Oct_2024.pdf",
                url: "https://example.com/attachments/Invoice_Oct_2024.pdf"
            }
        ]
    };

    const downloadAttachment = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center p-2 bg-white">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                        <X className="h-12 w-12" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="default" size="icon" className="h-8 w-8">
                        <Reply className="h-12 w-12" />
                    </Button>
                </div>
            </div>
            <div className="border p-2 text-sm">
                <div className="space-y-1 text-sm">
                    <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="text-gray-500">From</span>
                        <span className="font-medium">{email.sender}</span>
                    </div>
                    <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="text-gray-500">To</span>
                        <span className="font-medium">{email.recipient}</span>
                    </div>
                    <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="text-gray-500">Received</span>
                        <span className="font-medium">{email.timestamp}</span>
                    </div>
                </div>
            </div>
            <div className="border p-4">
                <div>
                <h2 className="text-sm font-semibold mb-2">{email.subject}</h2>
                </div>
                <div className="text-sm">
                    <div dangerouslySetInnerHTML={{ __html: email.body }} />
                </div>
            </div>
            {email.attachments && email.attachments.length > 0 && (
                <div className="pl-2">
                    <ul>
                        {email.attachments.map((attachment, index) => (
                            <li key={index} className="flex items-center justify-between text-sm">
                                <span>{attachment.name}
                                <Button variant="ghost" onClick={() => downloadAttachment(attachment.url)}>
                                    <DownloadIcon className="h-12 w-12" />
                                </Button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {/* <FooterNav setCurrentPage={setCurrentPage} /> */}
        </div>        
    );
};

export default DetailInbox;