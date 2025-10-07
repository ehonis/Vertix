"use client";

import { createContext, useContext, useState, useEffect } from "react";

const RouteCompletionContext = createContext<{
  isFlash: boolean;
  toggleIsFlash: () => void;
  date: Date;
  toggleIsToday: () => void;
  isToday: boolean;
  setDate: (date: Date) => void;
  getEffectiveDate: () => Date;
}>({
  isFlash: false,
  toggleIsFlash: () => {},
  date: new Date(),
  toggleIsToday: () => {},
  isToday: false,
  setDate: () => {},
  getEffectiveDate: () => new Date(),
});

export function RouteCompletionProvider({ children }: { children: React.ReactNode }) {
  const [isToday, setIsToday] = useState<boolean>(true);
  const [isFlash, setIsFlash] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());

  // Load initial values from localStorage
  useEffect(() => {
    const storedIsToday = localStorage.getItem("isToday");
    if (storedIsToday !== null) {
      setIsToday(JSON.parse(storedIsToday));
    }
    const storedFlash = localStorage.getItem("isFlash");
    if (storedFlash !== null) {
      setIsFlash(JSON.parse(storedFlash));
    }
    const storedDate = localStorage.getItem("date");
    if (storedDate !== null) {
      setDate(new Date(storedDate));
    }
  }, []);

  // Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem("isToday", JSON.stringify(isToday));
  }, [isToday]);

  useEffect(() => {
    localStorage.setItem("isFlash", JSON.stringify(isFlash));
  }, [isFlash]);

  useEffect(() => {
    localStorage.setItem("date", date.toISOString());
  }, [date]);

  const toggleIsToday = () => {
    setIsToday(prev => !prev);
    // If switching to "today", update the date to today
    if (!isToday) {
      setDate(new Date());
    }
  };

  const toggleIsFlash = () => {
    setIsFlash(prev => !prev);
  };

  const handleSetDate = (newDate: Date) => {
    setDate(newDate);
    // If setting a date manually, turn off "isToday" mode
    setIsToday(false);
  };

  // Get the effective date based on isToday flag
  const getEffectiveDate = () => {
    return isToday ? new Date() : date;
  };

  return (
    <RouteCompletionContext.Provider
      value={{
        isToday,
        toggleIsToday,
        isFlash,
        toggleIsFlash,
        date,
        setDate: handleSetDate,
        getEffectiveDate,
      }}
    >
      {children}
    </RouteCompletionContext.Provider>
  );
}

export const useRouteCompletion = () => useContext(RouteCompletionContext);
