'use client';
import { motion } from 'framer-motion';

export default function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center h-screen-offset">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full"
      />
    </div>
  );
}
