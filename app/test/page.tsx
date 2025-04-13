"use client";

import { useNotification } from "@/app/contexts/NotificationContext";

export default function Test() {
  const { showNotification } = useNotification();
  return (
    <div>
      <button
        onClick={() => showNotification({ message: "lorem ipsum dolor sit amet", color: "green" })}
      >
        Show Notification
      </button>
    </div>
  );
}
