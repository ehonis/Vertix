'use client';

import { useNotification } from '../contexts/NotificationContext';
import clsx from 'clsx';

export default function Notification() {
  const { notification } = useNotification();

  if (!notification) return null;

  return (
    <div
      className={clsx(
        'w-72 rounded-md z-50 shadow-lg fixed bottom-4 left-4 flex items-center gap-2 p-2 ',

        'max-h-16 overflow-y-auto',
        notification.color === 'green' &&
          'bg-green-500/90 border border-green-400 ',
        notification.color === 'red' && 'bg-red-500/90 border border-red-400 '
      )}
    >
      <p className="text-white font-barlow text-sm font-bold w-full">
        {notification.message}
      </p>
    </div>
  );
}
