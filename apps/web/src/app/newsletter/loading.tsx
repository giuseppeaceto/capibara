'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';

const loadingMessages = [
  "Collettivizzando le rubriche...",
  "Distribuendo equamente i contenuti...",
  "I capibara stanno nuotando nelle acque del giornalismo critico...",
  "Organizzando il soviet dei contenuti...",
  "Abbattendo i paywall del capitalismo editoriale...",
  "I capibara preparano la rivoluzione informativa...",
  "Condividendo i mezzi di produzione delle notizie...",
  "Costruendo la coscienza di classe, una riga alla volta...",
  "I capibara meditano sulla prassi rivoluzionaria...",
  "Smantellando l'egemonia culturale neoliberista...",
  "Caricando il materiale dialettico...",
  "I capibara studiano Gramsci sotto un albero...",
  "Sincronizzando la solidarietà internazionale...",
  "Decolonizzando il feed delle notizie...",
  "I capibara organizzano un'assemblea popolare...",
  "Recuperando le storie nascoste dal mainstream...",
  "Preparando l'analisi di classe del giornalismo...",
  "I capibara praticano il mutuo appoggio kropotkiniano...",
  "Caricando la controegemonia culturale...",
  "Distribuendo informazione dal basso...",
];

const FADE_DURATION = 300;
const MESSAGE_INTERVAL = 3000;
const DOTS_INTERVAL = 500;
const PROGRESS_INTERVAL = 50;

const THEME_COLORS = {
  dark: {
    container: '#27272a',
    bar: 'linear-gradient(to right, #ef4444, #f87171)',
    text: '#ffffff',
    dot: '#71717a',
  },
  light: {
    container: '#e4e4e7',
    bar: 'linear-gradient(to right, #dc2626, #ef4444)',
    text: '#000000',
    dot: '#a1a1aa',
  },
};

const getProgressIncrement = (current: number): number => {
  if (current >= 95) return 0.1;
  if (current >= 80) return 0.3;
  if (current >= 50) return 0.8;
  return 1.2;
};

export default function NewsletterLoading() {
  const [message, setMessage] = useState(loadingMessages[0]);
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const checkTheme = () => {
      if (typeof window !== 'undefined') {
        const theme = document.documentElement.getAttribute('data-theme');
        setIsDark(theme === 'dark');
      }
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class'],
      });
    }

    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    setMessage(randomMessage);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, DOTS_INTERVAL);

    const messageInterval = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        const newMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
        setMessage(newMessage);
        setOpacity(1);
      }, FADE_DURATION);
    }, MESSAGE_INTERVAL);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = getProgressIncrement(prev);
        return Math.min(prev + increment, 95);
      });
    }, PROGRESS_INTERVAL);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      observer.disconnect();
    };
  }, []);

  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center space-y-6 max-w-md px-4 w-full">
          <p
            className="text-lg font-medium transition-opacity duration-300 ease-in-out"
            style={{ color: colors.text, opacity }}
          >
            {message}{dots}
          </p>

          <div
            className="relative w-full max-w-md mx-auto rounded-full overflow-hidden"
            style={{
              height: '20px',
              backgroundColor: colors.container,
              minHeight: '20px',
            }}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-75 ease-linear"
              style={{
                width: `${progress}%`,
                background: colors.bar,
                minWidth: progress > 0 ? '4px' : '0px',
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            {[0, 150, 300].map((delay) => (
              <div
                key={delay}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  animationDelay: `${delay}ms`,
                  backgroundColor: colors.dot,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
