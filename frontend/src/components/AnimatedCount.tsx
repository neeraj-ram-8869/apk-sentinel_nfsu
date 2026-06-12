import React, { useState, useEffect, useRef } from "react";

const AnimatedCount = ({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{display}</>;
};

export default AnimatedCount;
