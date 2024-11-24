"use client";
import React, { useState } from 'react';

const Send: React.FC = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const isFormValid = to && subject && message;

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Compose New Message</h1>
      <form className="w-full max-w-lg">
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