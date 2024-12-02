"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { CircleX, Download } from 'lucide-react';
import FooterAdminNav from '@/components/FooterAdminNav';
import { useAuthStore } from '@/stores/useAuthStore';
import axios from "axios";

interface EmailDetail {
  ID: number;
  SenderEmail: string;
  SenderName: string;
  Subject: string;
  Body: string;
  RelativeTime: string;
  Attachments: { Name: string; URL: string }[];
}

export default function UserDetail() {
  const router = useRouter();
  const userEmail = useAuthStore((state) => state.email);
  const params = useParams()
  const searchParams = useSearchParams();
  // console.log("emailId", params.id)
  const token = useAuthStore((state) => state.token);
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmailDetail = async () => {
      if (!token) return;

      try {

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/by_user/detail/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          setEmail(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch email details:", err);
        setError("Failed to load email details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmailDetail();
  }, [token]);

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;
  if (!email) return <div className="p-4 text-center">Email not found</div>;

  return (
    <>
    <div className="flex flex-col h-screen">
      <div className=" space-y-4 flex-1 overflow-auto">
        <div className="flex justify-between items-center bg-white p-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 [&_svg]:size-5"
              onClick={() => router.back()}
            >
              <CircleX className="h-12 w-12" />
            </Button>
          </div>
          <h1 className="text-sm font-semibold tracking-tight">
                {searchParams.get('email')}
              </h1>
        </div>

        <div className="space-y-2 text-xs p-4">
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-gray-500">From</span>
            <span className="font-medium">{email.SenderName} - {email.SenderEmail}</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-gray-500">Subject</span>
            <span className="font-medium">{email.Subject}</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="font-medium">{email.RelativeTime}</span>
          </div>
        </div>

        <div className="border rounded-lg text-sm">
          <div dangerouslySetInnerHTML={{ __html: email.Body }} />
        </div>

        {/* {email.Attachments && email.Attachments.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Attachments</h3>
            <div className="space-y-2">
              {email.Attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span>{attachment.Name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(attachment.URL, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
    <FooterAdminNav />
    </>
  );
}