'use client';

import { useState, useEffect } from 'react';
import { Share2, X, Facebook, Linkedin, MessageCircle, Send } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url: string;
  text: string;
}

export default function ShareButton({ title, url, text }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(`${window.location.origin}${url}`);
  }, [url]);

  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copiato negli appunti!');
      setIsOpen(false);
    } catch (error) {
      console.error('Errore nella copia:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full text-zinc-900 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Condividi"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Overlay per chiudere il menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu di condivisione */}
          <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-2 min-w-[140px]">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
                Twitter
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
              >
                <Send className="h-4 w-4" />
                Telegram
              </button>
              <div className="border-t border-zinc-200 dark:border-zinc-600 my-1" />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Copia link
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
