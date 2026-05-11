import React, { useEffect, useState, useRef } from "react";

export function useCountdown(seconds, onEnd, deps = []) {
  const [t, setT] = useState(seconds);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    setT(seconds);
    const id = setInterval(() => {
      setT((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onEndRef.current && onEndRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, deps);

  return t;
}
