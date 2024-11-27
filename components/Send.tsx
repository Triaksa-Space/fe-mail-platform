"use client";
import React, { useState, useEffect } from 'react';
import { CircleXIcon, X, SendIcon, Paperclip } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { Toaster } from "@/components/ui/toaster";
import axios from "axios";

// // Mock function to get logged-in user's email
// const getLoggedInUserEmail = () => {
//   return "user@example.com"; // Replace with actual logic to get the logged-in user's email
// };

const Send: React.FC = () => {
  const router = useRouter();
  // const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const { toast } = useToast();
  const token = useAuthStore((state) => state.token);
  const email = useAuthStore((state) => state.email);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!to || !subject || !message) {
      toast({
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert all attachments to base64
      const attachmentPromises = attachments.map(async (file) => ({
        name: file.name,
        type: file.type,
        content: await fileToBase64(file)
      }));

      const processedAttachments = await Promise.all(attachmentPromises);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/send`,
        {
          to,
          subject,
          body: message,
          attachments: processedAttachments,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        description: "Send email successful!",
        className: "bg-green-500 text-white border-0",
      });

      router.push("/inbox");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        toast({
          description: "Daily send email limit reached. Try again tomorrow.",
          variant: "destructive",
        });
      } else {
        toast({
          description: "Failed to send email. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    //   // Set the "From" field with the logged-in user's email
    //   setFrom(getLoggedInUserEmail());
    const params = new URLSearchParams(window.location.search);
    setTo(params.get('to') || '');
    setSubject(params.get('subject') || '');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Add new function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data:image/jpeg;base64, prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        }
      };
      reader.onerror = reject;
    });
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center p-2 bg-white">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 [&_svg]:size-5" onClick={() => router.push('/inbox')}>
              <CircleXIcon className="h-16 w-16" />
            </Button>
          </div>
          <div className='flex items-center gap-2'>
            <div>
              <input
                className="hidden"
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="attachments" className="cursor-pointer flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 [&_svg]:size-5"
              onClick={handleSendEmail}
              disabled={isLoading}
            >
              <SendIcon className="h-16 w-16" />
            </Button>
          </div>
        </div>
        <div className="flex justify-center h-screen pl-4 pr-4">
          <form className="w-full max-w-lg">
            <div className="flex bg-white text-sm">
              <div className="flex items-center gap-2">
                <label className="text-gray-700 text-sm " htmlFor="from">
                  From:
                </label>
              </div>
              <div className="flex items-center gap-2">
                <label className="ml-4 text-gray-700 text-sm" htmlFor="from">
                  {email}
                </label>
              </div>
            </div>
            <div className="flex bg-white text-sm w-full">
              <div className="flex items-center gap-2 w-12">
                <label className="mt-3 text-gray-700 text-sm mb-2" htmlFor="to">
                  To:
                </label>
              </div>
              <div className="mt-2 flex-1">
                <input
                  className="text-sm shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="to"
                  type="text"
                  placeholder=""
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-1 mt-2">
              <input
                className="text-sm shadow appearance-none border rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="subject"
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <textarea
                className="text-sm shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="message"
                rows={14}
                placeholder="Compose email"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-600 truncate">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default Send;