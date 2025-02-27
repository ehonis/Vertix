'use client';

import { useNotification } from '../contexts/NotificationContext';

export default function Notification() {
  const { notification } = useNotification();

  if (!notification) return null;

  return (
    <div className="w-72 bg-bg2 rounded-lg z-50 shadow-lg fixed bottom-4 left-4 flex items-center gap-2 h-12">
      <div
        className={`${
          notification.color === 'green'
            ? 'bg-green-400'
            : notification.color === 'red'
            ? 'bg-red-400'
            : 'bg-gray-400'
        } rounded-l-lg w-12 h-12`}
      ></div>
      <p className="text-white font-barlow font-bold w-48">
        {notification.message}
      </p>
    </div>
  );
}
