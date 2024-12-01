"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CircleX, Reply, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import FooterNav from "@/components/FooterNav";

interface EmailDetail {
  ID: number;
  SenderEmail: string;
  SenderName: string;
  Subject: string;
  Body: string;
  BodyEml: string;
  RelativeTime: string;
  ListAttachments: { Filename: string; FileUrl: string }[];
}

export default function EmailDetailPage() {
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchEmailDetail = async () => {
      if (!token) {
        router.replace("/signin");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch email");
        }

        const data = await response.json();
        setEmail(data);
      } catch (err) {
        console.error("Failed to fetch email:", err);
        setError("Failed to load email");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmailDetail();
  }, [params.id, token, router]);

  const handleReply = () => {
    if (!email) return;

    const replyParams = new URLSearchParams({
      to: email.SenderEmail,
      subject: `Re: ${email.Subject}`,
    }).toString();

    router.push(`/inbox/send?${replyParams}`);
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!email) return <div className="p-4">Email not found</div>;

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 space-y-4 flex-1 overflow-auto">
        <div className="flex justify-between items-center bg-white">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 [&_svg]:size-5"
            onClick={() => router.push("/inbox")}
          >
            <CircleX className="h-12 w-12" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 [&_svg]:size-5"
            onClick={handleReply}
          >
            <Reply className="h-12 w-12" />
          </Button>
        </div>

        <div className="space-y-2 text-xs p-1">
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-gray-500">From</span>
            <span className="font-medium">
              {email.SenderName} - {email.SenderEmail}
            </span>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-gray-500">Subject</span>
            <span className="font-medium">{email.Subject}</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="font-medium">{email.RelativeTime}</span>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: email.Body }}
          />
        </div>

        {/* Attachments Section */}
        {email.ListAttachments && email.ListAttachments.length > 0 && (
          <div className="mt-4">
            <h5 className="font-medium">Attachments:</h5>
            <div className="space-y-1">
              {email.ListAttachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {attachment.Filename}
                  </span>
                  <a
                    href={attachment.FileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Download ${attachment.Filename}`}
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* End of Attachments Section */}
      </div>
      <FooterNav />
    </div>
  );
}