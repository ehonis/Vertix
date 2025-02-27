'use client';

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export default function HomeLogoAnimation() {
  const [textCount, setTextCount] = useState(9); // Default to largest size
  const speedFactor = 0.05;
  const baseDelay = textCount * speedFactor + 0.3;

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
        setTimeout(() => setIsDeleting(true), 2000); // Pause before deleting
      }
    }
  }, [charIndex, isDeleting, wordIndex]);

  useEffect(() => {
    const updateTextCount = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setTextCount(5); // Small screens
      } else if (width < 1024) {
        setTextCount(7); // Medium screens
      } else {
        setTextCount(9); // Large screens
      }
    };

    updateTextCount(); // Set initial value
    window.addEventListener('resize', updateTextCount); // Listen for resizes

    return () => window.removeEventListener('resize', updateTextCount);
  }, []);
  return (
    <div className="relative flex justify-center mt-20 md:mt-32">
      <div className="relative flex">
        {/* Sequential Animated Text */}
        {Array(textCount)
          .fill('Vertix')
          .map((text, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * speedFactor, duration: 0.3 }}
              className={`text-white font-tomorrow text-3xl md:text-5xl font-bold italic  ${
                index === 0 ? '' : '-ml-10' // No margin on the first element, negative margin on the rest
              }`}
              style={{ rotate: '-60deg' }}
            >
              {text}
            </motion.p>
          ))}

        {/* White Overlay */}
        <motion.div
          initial={{ clipPath: 'inset(0% 0% 0% 100%)' }} // Start fully hidden on the right
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }} // Reveal from right to left
          transition={{ delay: baseDelay, duration: 1, ease: 'easeInOut' }}
          className="absolute flex flex-col left-[-1rem] top-[-3.5rem] md:left-[-3rem] md:top-[-4.5rem] justify-center items-center w-[110%] h-[400%] bg-white rounded-md z-10"
        >
          {/* Main Logo Animation */}
          <motion.p
            initial={{ opacity: 0, y: 0 }}
            animate={[
              {
                opacity: 1,
                y: 0,
                transition: { delay: baseDelay + 0.3, duration: 0.3 },
              }, // Appear in the center
              {
                y: -5,
                transition: { delay: 4, duration: 0.5, ease: 'easeInOut' },
              }, // Move up after 2 seconds
            ]}
            className="z-20 text-7xl md:text-8xl font-bold font-tomorrow italic"
          >
            Vertix
          </motion.p>

          {/* Subtext Appears After Logo Moves Up */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 4.2, // Appears after the logo moves up
              duration: 1,
              ease: 'easeInOut',
            }}
            className="z-20 text-xl md:text-2xl font-bold font-barlow font-bold text-center"
          >
            a new way to{' '}
            <span className="text-primary">
              {displayText}
              <span className="">|</span>
            </span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
