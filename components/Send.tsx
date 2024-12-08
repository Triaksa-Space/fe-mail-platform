"use client";
import React, { useState } from 'react';
import { CircleXIcon, X, SendIcon, Paperclip } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { Toaster } from "@/components/ui/toaster";
import axios from "axios";
import { Input } from './ui/input';
import LoadingProcessingPage from './ProcessLoading';

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 10;

const Send: React.FC = () => {
  const router = useRouter();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const { toast } = useToast();
  const token = useAuthStore((state) => state.token);
  const email = useAuthStore((state) => state.email);
  const [isLoading, setIsLoading] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Handle sending email with FormData
  const handleSendEmail = async () => {
    if (!to || !subject || !message) {
      toast({
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (attachments.length > MAX_FILES) {
      toast({
        description: "You can only send up to 10 files.",
        variant: "destructive",
      });
      return;
    }

    for (const file of attachments) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({
          description: `The file "${file.name}" cannot be uploaded because it exceeds 10 MB.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    // setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('body', message);

      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/send`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          // onUploadProgress: (progressEvent) => {
          //   // const percentCompleted = Math.round(
          //   //   (progressEvent.loaded * 100) / (progressEvent.total || 1)
          //   // );
          //   // setUploadProgress(percentCompleted);
          // },
        }
      );

      toast({
        description: "Email sent successfully!",
        variant: "default",
      });

      router.push("/inbox?sent=success");
    } catch (error: any) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        toast({
          description: "Daily send email limit reached. Try again tomorrow.",
          variant: "destructive",
        });
      } else {
        const errorMessage = error.response?.data?.error || "Failed to send email. Please try again.";
        toast({
          description: `Failed to send email. ${errorMessage}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      // setUploadProgress(0);
    }
  };

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Check total number of files
      if (attachments.length + selectedFiles.length > MAX_FILES) {
        toast({
          description: "You can only send up to 10 files.",
          variant: "destructive",
        });
        return;
      }

      // Check each file size
      for (const file of selectedFiles) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          toast({
            description: `The file "${file.name}" cannot be uploaded because it exceeds 10 MB.`,
            variant: "destructive",
          });
          return;
        }
      }

      setAttachments([...attachments, ...selectedFiles]);
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center p-2 bg-white">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 [&_svg]:size-5 hover:bg-gray-100"
              onClick={() => router.push('/inbox')}
            >
              <CircleXIcon className="h-5 w-5" />
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
                accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.gif,.txt,.zip,.rar" // Optional: restrict file types
              />
              <label htmlFor="attachments" className="cursor-pointer flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                <Paperclip className="h-5 w-5" />
                {/* <span className="text-sm text-gray-700">Attach Files</span> */}
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 [&_svg]:size-5 hover:bg-gray-100"
              onClick={handleSendEmail}
              disabled={isLoading}
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Upload Progress */}
        {isLoading && (
          // <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          //   <div
          //     className="bg-blue-600 h-2.5 rounded-full"
          //     style={{ width: `${uploadProgress}%` }}
          //   ></div>
          // </div>
          <LoadingProcessingPage />
        )}

        <div className="flex justify-center h-screen pl-4 pr-4">
          <form className="w-full max-w-lg">
            <div className="flex bg-white text-sm">
              <div className="flex items-center gap-2 w-12">
                <label className="mt-3 text-gray-700 text-sm mb-2" htmlFor="from">
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
                <Input
                  className="text-sm shadow appearance-none border w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="to"
                  type="text"
                  placeholder=""
                  value={to}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTo(value.replace(/\s/g, '')); // Remove spaces
                  }}
                />
              </div>
            </div>
            <div className="mb-2 mt-2">
              <Input
                className="text-sm shadow appearance-none border w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="subject"
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <textarea
                className="text-sm shadow appearance-none border w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                  className="flex items-center justify-between p-2 bg-gray-50"
                >
                  <span className="text-sm text-gray-600 truncate">
                    {file.name}
                  </span>
                  <Button
                    type="button"
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