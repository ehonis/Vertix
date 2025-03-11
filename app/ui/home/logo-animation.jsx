'use client';

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export default function HomeLogoAnimation() {
  const words = ['climb', 'track', 'boulder'];
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      if (charIndex > 0) {
        setTimeout(() => {
          setDisplayText(currentWord.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 100);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length); // Move to next word
      }
    } else {
      if (charIndex < currentWord.length) {
        setTimeout(() => {
          setDisplayText(currentWord.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 150);
      } else {
        setTimeout(() => setIsDeleting(true), 1900); // Pause before deleting
      }
    }
  }, [charIndex, isDeleting, wordIndex]);

  return (
    <div className="relative flex justify-center mt-8 md:mt-8 w-full text-white">
      {/* Purple glow in top left */}

      <div className="relative flex flex-col justify-center items-center md:w-3/5 w-4/5 h-40 bg-black rounded-md z-10 overflow-hidden">
        {/* Radial gradient with center at bottom right corner */}
        <div
          className="absolute inset-0 opacity-35"
          style={{
            background:
              'radial-gradient(circle at bottom right, #3B82F6 0%, transparent 45%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            background:
              'radial-gradient(circle at top left, #A78BFA 0%, transparent 45%)',
          }}
        />

        <p className="z-20 text-7xl text-[5rem] md:text-8xl font-bold font-tomorrow italic">
          Vertix
        </p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5,
            duration: 1,
            ease: 'easeInOut',
          }}
          className="z-20 text-xl md:text-2xl font-barlow font-bold text-center"
        >
          a new way to{' '}
          <span className="text-primary">
            {displayText}
            <span className="animate-flash-fast">|</span>
          </span>
        </motion.p>
      </div>
    </div>
  );
}
