'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function ElementLoadingAnimation({ size }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className={clsx(
        'size-10 border-4 border-gray-300 border-t-blue-500 rounded-full self-center place-self-center',
        size === 5 && 'size-5',
        size === 4 && 'size-4',
        size === 6 && 'size-6',
        size === 8 && 'size-8',
        size === 7 && 'size-7'
      )}
    />
  );
}
