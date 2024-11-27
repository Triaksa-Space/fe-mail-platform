"use client";
import React, { useState, useEffect } from 'react';
import { CircleXIcon, SendIcon, Paperclip } from 'lucide-react';
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
          <Button variant="ghost" size="icon" className="h-8 w-8 [&_svg]:size-5">
            <SendIcon className="h-16 w-16" />
          </Button>
        </div>
      </div>
      <div className="flex justify-center h-screen pl-4 pr-4">
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