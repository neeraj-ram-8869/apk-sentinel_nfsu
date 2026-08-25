import React, { useState, useEffect, useRef } from "react";

const AnimatedCount = ({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    const start = prevRef.current;
    const end = value;

    // rAF is frozen while the tab is hidden. Without this, a scan finished in a
    // background tab renders its score card as 0 until the user comes back.
    const snap = () => {
      setDisplay(end);
      prevRef.current = end;
    };
    if (typeof document !== "undefined" && document.hidden) {
      snap();
      return;
    }

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

    const onVisibilityChange = () => { if (document.hidden) snap(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [value, duration]);
  return <>{display}</>;
};

export default AnimatedCount;
