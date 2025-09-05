'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io();

export default function Home() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('qr', (url) => {
      setQrCodeUrl(url);
    });

    socket.on('ready', () => {
      setIsReady(true);
      setQrCodeUrl('');
    });

    return () => {
      socket.off('qr');
      socket.off('ready');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit('sendMessage', { to, message });
    setTo('');
    setMessage('');
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">WhatsApp Messenger</h1>
        {!isReady && !qrCodeUrl && <p>Loading...</p>}
        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
        {isReady && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient (e.g., 1234567890@c.us)"
              className="p-2 border rounded"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              className="p-2 border rounded"
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded">
              Send Message
            </button>
          </form>
        )}
      </main>
    </div>
  );
}