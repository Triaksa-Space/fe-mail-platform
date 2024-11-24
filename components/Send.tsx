"use client";
import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import Image from 'next/image';

// Mock function to get logged-in user's email
const getLoggedInUserEmail = () => {
  return "user@example.com"; // Replace with actual logic to get the logged-in user's email
};

const Send: React.FC = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    // Set the "From" field with the logged-in user's email
    setFrom(getLoggedInUserEmail());
  }, []);

  const isFormValid = from && to && subject && message;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="flex justify-center h-screen p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Compose New Message</h1> */}
      <form className="w-full max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="from">
            From:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="from"
            type="text"
            value={from}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="to">
            To:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="to"
            type="text"
            placeholder="Recipient's email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
            Subject:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="subject"
            type="text"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
            Message:
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="message"
            rows={6}
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attachments">
            Attachments:
          </label>
          <input
            className="hidden"
            id="attachments"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <label htmlFor="attachments" className="cursor-pointer flex items-center gap-2 text-blue-500">
            <Upload className="h-6 w-6" />
            <span>Upload Images</span>
          </label>
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
        </div>
        <div className="flex items-center justify-center">
          <button
            className={`w-3/4 bg-[#F7D65D] hover:bg-[#F7D65D]/90 text-black py-2 px-4 rounded focus:outline-none focus:shadow-outline ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="button"
            disabled={!isFormValid}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Send;