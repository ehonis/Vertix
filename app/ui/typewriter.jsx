'use client';

import { useState, useEffect, useCallback } from 'react';

const words = ['climbing', 'bouldering', 'tracking'];

function TypewriterText() {
  const [index, setIndex] = useState(0); // Current word index
  const [text, setText] = useState(''); // Text to display
  const [isDeleting, setIsDeleting] = useState(false); // Deleting or typing
  const [typingSpeed, setTypingSpeed] = useState(150); // Typing speed

  const handleTyping = useCallback(() => {
    const currentWord = words[index];
    if (!isDeleting) {
      // Typing the word
      const updatedText = currentWord.slice(0, text.length + 1);
      setText(updatedText);
      setTypingSpeed(150);
      if (updatedText === currentWord) {
        // Pause at the end of the word
        setTimeout(() => setIsDeleting(true), 3000);
      }
    } else {
      // Deleting the word
      const updatedText = currentWord.slice(0, text.length - 1);
      setText(updatedText);
      setTypingSpeed(50);
      if (updatedText === '') {
        setIsDeleting(false);
        setIndex((prevIndex) => (prevIndex + 1) % words.length);
        setTypingSpeed(150);
      }
    }
  }, [text, isDeleting, index]);

  useEffect(() => {
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [text, typingSpeed, handleTyping]);

  return <span className="text-green-500">{text}</span>;
}

export default TypewriterText;
