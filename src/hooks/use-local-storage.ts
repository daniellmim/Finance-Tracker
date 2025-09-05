"use client";

import { useState, useEffect, useCallback } from 'react';

// Hook
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item, (k, v) => {
        // Attempt to parse dates
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)) {
          return new Date(v);
        }
        return v;
      }) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch storage event to sync tabs
        window.dispatchEvent(new StorageEvent('storage', { key }));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  
  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === key || (event.key === null && typeof window !== 'undefined')) {
         try {
            const item = window.localStorage.getItem(key);
            setStoredValue(item ? JSON.parse(item, (k, v) => {
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)) {
                    return new Date(v);
                }
                return v;
            }) : initialValue);
        } catch (error) {
            console.log(error);
            setStoredValue(initialValue);
        }
    }
  }, [key, initialValue]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }
  }, [handleStorageChange]);


  return [storedValue, setValue];
}

export default useLocalStorage;
