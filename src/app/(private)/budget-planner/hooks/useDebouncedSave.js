import { useRef } from "react";

export default function useDebouncedSave(saveFn, delay = 700) {
  const timers = useRef({});

  return (key, ...args) => {
    // clear previous for same key
    if (timers.current[key]) clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(async () => {
      try {
        await saveFn(key, ...args);
      } catch (err) {
        console.error("Debounced save failed", err);
      } finally {
        delete timers.current[key];
      }
    }, delay);
  };
}