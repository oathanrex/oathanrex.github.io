import { flushSync } from 'react-dom';
import { distortionWave, warmupWave, type PaletteName, type Point, type Effect } from 'distortion-wave';
import { electricBorder, type ElectricBorder, type ElectricBorderOptions } from 'distortion-wave/electric';
import { pixel } from 'distortion-wave/pixel';

// Warm up WebGL shaders ahead of time on client
if (typeof window !== 'undefined') {
  try {
    warmupWave();
  } catch {
    // Graceful fallback if WebGL is unavailable
  }
}

export interface WaveOptions {
  palette?: PaletteName | string[];
  duration?: number;
  intensity?: number;
  effect?: 'wave' | Effect;
}

/**
 * Helper to extract focal coordinates from a React MouseEvent, Native MouseEvent, or element
 */
function extractFocus(event?: React.MouseEvent<HTMLElement> | MouseEvent): Point | undefined {
  if (!event) return undefined;
  if ('clientX' in event && typeof event.clientX === 'number') {
    return { x: event.clientX, y: event.clientY };
  }
  return undefined;
}

/**
 * Base wave transition wrapper with React 19 flushSync support.
 */
export function triggerWave(
  targetElement: HTMLElement | null,
  updateCallback: () => void,
  event?: React.MouseEvent<HTMLElement> | MouseEvent,
  options: WaveOptions = {}
) {
  if (typeof window === 'undefined' || !targetElement) {
    updateCallback();
    return;
  }

  const {
    palette = 'ocean',
    duration = 750,
    intensity = 1.0,
    effect = 'wave',
  } = options;

  const focusTarget = extractFocus(event);

  try {
    distortionWave(
      targetElement,
      () => {
        // flushSync ensures React 19 synchronously commits DOM changes before the 'after' snapshot
        flushSync(() => {
          updateCallback();
        });
      },
      {
        focus: focusTarget,
        palette,
        duration,
        intensity,
        effect,
      }
    );
  } catch (err) {
    console.warn('DistortionWave fallback triggered:', err);
    updateCallback();
  }
}

/**
 * 1. Theme Toggle Wave (Ocean Cyan palette)
 */
export function triggerThemeWave(
  targetElement: HTMLElement | null,
  updateCallback: () => void,
  event?: React.MouseEvent<HTMLElement> | MouseEvent
) {
  triggerWave(targetElement, updateCallback, event, {
    palette: 'ocean',
    duration: 750,
    intensity: 1.0,
  });
}

/**
 * 2. Copy Action Wave (Fresh Mint Emerald palette)
 */
export function triggerCopyWave(
  targetElement: HTMLElement | null,
  updateCallback: () => void,
  event?: React.MouseEvent<HTMLElement> | MouseEvent
) {
  triggerWave(targetElement, updateCallback, event, {
    palette: 'mint',
    duration: 600,
    intensity: 0.9,
  });
}

/**
 * 3. DevTools Tab Switcher (8-bit Digital Pixel Dissolve)
 */
export function triggerPixelWave(
  targetElement: HTMLElement | null,
  updateCallback: () => void,
  event?: React.MouseEvent<HTMLElement> | MouseEvent
) {
  triggerWave(targetElement, updateCallback, event, {
    effect: pixel,
    duration: 650,
    intensity: 1.0,
    palette: 'pixel',
  });
}

/**
 * 4. Projects Category Filter Wave (Aurora Purple/Violet palette)
 */
export function triggerCategoryWave(
  targetElement: HTMLElement | null,
  updateCallback: () => void,
  event?: React.MouseEvent<HTMLElement> | MouseEvent
) {
  triggerWave(targetElement, updateCallback, event, {
    palette: 'aurora',
    duration: 650,
    intensity: 0.85,
  });
}

/**
 * 5. Live Electric Border for Flagship Project Cards on Hover/Focus
 */
export function attachElectricBorder(
  element: HTMLElement | null,
  options?: ElectricBorderOptions
): (() => void) | undefined {
  if (typeof window === 'undefined' || !element) return undefined;

  try {
    const border: ElectricBorder = electricBorder(element, {
      trigger: 'hover',
      color: '#38bdf8',
      thickness: 1.4,
      glow: 10,
      chaos: 4,
      ...options,
    });

    return () => {
      try {
        border.destroy();
      } catch {
        // Silent cleanup
      }
    };
  } catch (err) {
    console.warn('ElectricBorder initialization skipped:', err);
    return undefined;
  }
}
