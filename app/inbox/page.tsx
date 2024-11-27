"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { Email } from "@/types/email";
import FooterNav from "@/components/FooterNav";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

const InboxPage: React.FC = () => {
  const [sentEmails, setSentEmails] = useState(0);
  const [email, setEmailLocal] = useState(0);
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const { setEmail } = useAuthStore();

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();

    const fetchCountSentEmails = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/sent/by_user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        if (response.data) {
          setSentEmails(response.data.SentEmails);
          setEmail(response.data.Email);
          setEmailLocal(response.data.Email);
        }
      } catch (err) {
        console.error('Failed to fetch sent emails count:', err);
      }
    };

    const fetchEmails = async () => {
      if (!token) {
        router.replace("/signin");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/by_user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (isSubscribed) {
          setEmails(response.data);
          setError(null);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Failed to fetch emails:", err);
          setError("Failed to load emails");
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchCountSentEmails();
    fetchEmails();

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [token, router]);

  return (
    <>
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <div className="space-y-0.5">
          <div className="flex justify-between p-2 bg-[#F7D65D]">
            <h1 className="text-xl font-semibold tracking-tight">
              {email}
            </h1>
            <h1 className="text-sm font-semibold tracking-tight">
              Daily Send {sentEmails}/3
            </h1>
          </div>
          {isLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center">{error}</div>
          ) : emails.length > 0 ? (
            <div className="divide-y">
              {emails.map((email) => (
                <div
                  key={email.ID}
                  className="p-4 hover:bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/inbox/${email.ID}`)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{email.SenderName}</h3>
                      <span className="text-sm text-gray-500">
                        {email.RelativeTime}
                      </span>
                    </div>
                    <h4 className="font-medium">{email.Subject}</h4>
                    <p className="text-sm text-gray-500">{email.Preview}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">No emails found.</div>
          )}
        </div>
      </div>
      <FooterNav />
    </div>
    <Toaster />
    </>
  );
};

export default InboxPage;