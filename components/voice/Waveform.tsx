'use client';

import { useEffect, useRef } from 'react';

interface Props {
  level: number;
  active: boolean;
  bars?: number;
}

export function Waveform({ level, active, bars = 22 }: Props) {
  const heightsRef = useRef<number[]>(Array.from({ length: bars }, () => 0.15));
  const targetRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    targetRef.current = active ? Math.min(1, level * 4) : 0;
  }, [level, active]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const heights = heightsRef.current;
      const target = targetRef.current;
      // shift left and append a new bar derived from current target + jitter
      heights.shift();
      const noise = (Math.random() - 0.5) * 0.25;
      heights.push(Math.max(0.08, Math.min(1, target + noise)));
      // render
      const el = containerRef.current;
      if (el) {
        const children = el.children;
        for (let i = 0; i < children.length; i++) {
          const c = children[i] as HTMLElement;
          const h = heights[i];
          c.style.height = `${(h * 100).toFixed(1)}%`;
          c.style.opacity = (0.4 + h * 0.6).toString();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-7 items-center justify-center gap-[3px] px-1"
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="block w-[3px] rounded-full bg-orange-400 transition-all duration-100"
          style={{
            height: '15%',
            boxShadow: active ? '0 0 6px rgb(255 122 26 / 0.6)' : 'none',
          }}
        />
      ))}
    </div>
  );
}
