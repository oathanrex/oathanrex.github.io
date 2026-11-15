export type VitalName = 'TTFB' | 'FCP' | 'LCP' | 'CLS';
export type VitalRating = 'good' | 'needs-improvement' | 'poor';

export function rateVital(name: VitalName, value: number): VitalRating {
  if (name === 'CLS') {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }
  if (name === 'TTFB') {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }
  if (name === 'FCP') {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }
  // LCP
  if (value <= 2500) return 'good';
  if (value <= 4000) return 'needs-improvement';
  return 'poor';
}

export function formatVitalValue(name: VitalName, value: number): string {
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

function logVital(name: VitalName, value: number): void {
  const rating = rateVital(name, value);
  const formatted = formatVitalValue(name, value);
  const color =
    rating === 'good'
      ? '#16a34a'
      : rating === 'needs-improvement'
        ? '#d97706'
        : '#dc2626';

  console.info(
    `%c[WebVitals]%c ${name}: ${formatted} (${rating})`,
    `color:${color};font-weight:700`,
    'color:inherit;font-weight:500'
  );
}

export function initWebVitalsLogger(): void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return;
  }

  try {
    const navEntries = performance.getEntriesByType?.('navigation') as
      | PerformanceNavigationTiming[]
      | undefined;
    if (navEntries && navEntries[0]) {
      const ttfb = Math.max(0, navEntries[0].responseStart - navEntries[0].requestStart);
      logVital('TTFB', ttfb);
    }

    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          logVital('FCP', entry.startTime);
          paintObserver.disconnect();
        }
      }
    });
    paintObserver.observe({ type: 'paint', buffered: true });

    let latestLcp = 0;
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) latestLcp = last.startTime;
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<
        PerformanceEntry & { hadRecentInput?: boolean; value?: number }
      >) {
        if (!entry.hadRecentInput && typeof entry.value === 'number') {
          clsValue += entry.value;
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    let reported = false;
    const flush = () => {
      if (reported) return;
      reported = true;
      lcpObserver.disconnect();
      clsObserver.disconnect();
      if (latestLcp > 0) logVital('LCP', latestLcp);
      logVital('CLS', clsValue);
    };

    window.addEventListener('pagehide', flush, { once: true });
    setTimeout(flush, 3000);
  } catch {
    // PerformanceObserver entry types unsupported in older browsers
  }
}
