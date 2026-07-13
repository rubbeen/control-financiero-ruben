import { useEffect, useRef, useState } from 'react';

interface ViewportGeometry {
  width: number;
  height: number;
}

function readViewportGeometry(): ViewportGeometry {
  const viewport = window.visualViewport;
  return {
    width: Math.round(viewport?.width ?? document.documentElement.clientWidth ?? window.innerWidth),
    height: Math.round(viewport?.height ?? document.documentElement.clientHeight ?? window.innerHeight)
  };
}

export default function useViewportLayoutEpoch() {
  const [layoutEpoch, setLayoutEpoch] = useState(0);
  const previous = useRef<ViewportGeometry | null>(null);

  useEffect(() => {
    let mounted = true;
    let firstFrame = 0;
    let secondFrame = 0;
    previous.current = readViewportGeometry();

    const scheduleMeasurement = () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (!mounted) return;
          const next = readViewportGeometry();
          const current = previous.current;
          if (current && current.width === next.width && current.height === next.height) return;
          previous.current = next;
          setLayoutEpoch((value) => value + 1);
        });
      });
    };

    window.addEventListener('resize', scheduleMeasurement);
    window.addEventListener('orientationchange', scheduleMeasurement);
    window.visualViewport?.addEventListener('resize', scheduleMeasurement);

    return () => {
      mounted = false;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.removeEventListener('resize', scheduleMeasurement);
      window.removeEventListener('orientationchange', scheduleMeasurement);
      window.visualViewport?.removeEventListener('resize', scheduleMeasurement);
    };
  }, []);

  return layoutEpoch;
}
