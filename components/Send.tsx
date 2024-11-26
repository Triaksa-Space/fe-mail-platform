"use client";
import React, { useState, useEffect } from 'react';
import { Upload, X, SendIcon, UploadIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';


// Mock function to get logged-in user's email
const getLoggedInUserEmail = () => {
  return "user@example.com"; // Replace with actual logic to get the logged-in user's email
};

const Send: React.FC = () => {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    // Set the "From" field with the logged-in user's email
    setFrom(getLoggedInUserEmail());
  }, []);

  // const isFormValid = from && to && subject && message;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center p-2 bg-white">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <X className="h-12 w-12" />
          </Button>
        </div>
        {/* <div className="flex items-center gap-2">
          <input
            className="hidden"
            id="attachments"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <label htmlFor="attachments">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Upload className="h-5 w-5" />
            </Button>
          </label>

          {attachments.length > 0 && (
            <div className="absolute top-16 left-0 right-0 bg-white p-4 border-b">
              <div className="flex gap-2 overflow-x-auto">
                {attachments.map((file, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`attachment-${index}`}
                      width={64}
                      height={64}
                      className="object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div> */}
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
              <Upload className="h-6 w-6" />
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="icon" className="h-8 w-8">
            <SendIcon className="h-12 w-12" />
          </Button>
        </div>
      </div>
      <div className="flex justify-center h-screen p-4">
        {/* <h1 className="text-2xl font-bold mb-4">Compose New Message</h1> */}
        <form className="w-full max-w-lg">
          <div className="flex bg-white text-sm">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 text-sm " htmlFor="from">
                From:
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="ml-4 text-gray-700 text-sm" htmlFor="from">
                {from}
              </label>
            </div>
          </div>
          <div className="flex bg-white text-sm">
            <div className="flex items-center gap-2">
              <label className="mt-4 text-gray-700 text-sm mb-2" htmlFor="to">
                To:
              </label>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <input
                className="ml-8 text-sm shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="to"
                type="text"
                placeholder=""
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-1 mt-8">
            <input
              className="text-sm shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          <div className="mt-4 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="relative">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`attachment-${index}`}
                    width={96} // 24 * 4 (tailwind w-24)
                    height={96} // 24 * 4 (tailwind h-24)
                    className="object-cover rounded"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
        </form>
      </div>
    </div>
  );
};

export default Send;