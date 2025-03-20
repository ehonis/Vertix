"use client";

import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = ({ message, color }) => {
    setNotification({ message, color });
    console.log("Notification triggered:", { message, color });
    // Optional: auto-hide the notification after a set time
    setTimeout(() => setNotification(null), 7000);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
