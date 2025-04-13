"use client";

import { createContext, useContext, useState } from "react";

type Notification = {
  message: string;
  color: string;
};

const NotificationContext = createContext<{
  notification: Notification | null;
  showNotification: (notification: Notification) => void;
}>({ notification: null, showNotification: () => {} });

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = ({ message, color }: Notification) => {
    setNotification({ message, color });
    console.log("notification triggered");
    setTimeout(() => setNotification(null), 7000);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
