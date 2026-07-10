export interface LocalPerformanceEntry {
  name: string;
  duration: number;
  at: string;
}

const measurements: LocalPerformanceEntry[] = [];

export async function perfMeasureAsync<T>(name: string, action: () => Promise<T>): Promise<T> {
  const start = `${name}:start:${crypto.randomUUID()}`;
  const end = `${name}:end:${crypto.randomUUID()}`;
  performance.mark(start);
  try {
    return await action();
  } finally {
    performance.mark(end);
    const measure = performance.measure(name, start, end);
    if (import.meta.env.DEV) measurements.push({ name, duration: measure.duration, at: new Date().toISOString() });
    performance.clearMarks(start);
    performance.clearMarks(end);
  }
}

export function getLocalPerformanceEntries() {
  return import.meta.env.DEV ? [...measurements] : [];
}

export function clearLocalPerformanceEntries() {
  measurements.length = 0;
}
