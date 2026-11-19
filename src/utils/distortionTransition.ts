import { flushSync } from 'react-dom';
import { distortionWave, warmupWave, type PaletteName, type Point } from 'distortion-wave';

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
}

/**
 * Triggers the signature WebGL2 Distortion Wave effect strictly on the toggle button itself
 * (exact same effect & palette as the Bookmark / Save button in LukyVj's UI Kit).
 *
 * @param targetElement The button element receiving the wave
 * @param updateCallback State update callback (e.g. toggling theme)
 * @param event Mouse or pointer event for focal wave origin
 * @param options Custom wave options (default palette is 'ocean' matching Save/Saved button)
 */
export function triggerThemeWave(
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
    palette = 'ocean', // Exact same palette as the Save / Saved button
    duration = 750,
    intensity = 1.0,
  } = options;

  // Extract focus coordinate or native mouse event
  let focusTarget: MouseEvent | Point | undefined = undefined;
  if (event) {
    if ('clientX' in event && typeof event.clientX === 'number') {
      focusTarget = { x: event.clientX, y: event.clientY };
    } else if ('nativeEvent' in event) {
      focusTarget = (event as React.MouseEvent<HTMLElement>).nativeEvent;
    }
  }

  try {
    distortionWave(
      targetElement, // STRICTLY on the toggle button itself
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
      }
    );
  } catch (err) {
    console.warn('DistortionWave fallback triggered:', err);
    updateCallback();
  }
}
