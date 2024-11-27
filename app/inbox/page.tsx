"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { Email } from "@/types/email";
import FooterNav from "@/components/FooterNav";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

const InboxPage: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const token = useAuthStore((state) => state.token);
  const token = useAuthStore.getState().getStoredToken()
  const router = useRouter();

  useEffect(() => {
    // Guard against double loading
    let isSubscribed = true;
    const controller = new AbortController();

    const fetchEmails = async () => {
      if (!token) {
        router.replace("/signin");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/by_user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal
          }
        );

        if (!isSubscribed) return;

        if (!response.ok) {
          throw new Error("Failed to fetch emails");
        }

        const data = await response.json();
        setEmails(data);
        setError(null);
      } catch (err) {
        if (!isSubscribed) return;
        console.error("Failed to fetch emails:", err);
        setError("Failed to load emails");
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchEmails();

    // Cleanup function
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [token]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <div className="space-y-0.5">
          <div className="flex justify-between p-2 bg-[#F7D65D]">
            <h1 className="text-xl font-semibold tracking-tight">
              Your Inbox
            </h1>
            <h1 className="text-sm font-semibold tracking-tight">
              Daily Send 0/3
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
                      <h3 className="font-semibold">{email.Sender}</h3>
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
  );
};

export default InboxPage;
