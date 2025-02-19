'use client';

import { motion } from 'framer-motion';

export default function ElementLoadingAnimation() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="size-10 border-4 border-gray-300 border-t-blue-500 rounded-full self-center place-self-center"
    />
  );
}
