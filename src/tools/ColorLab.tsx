import { Check, Copy, Palette } from 'lucide-react';
import { useMemo, useState } from 'react';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function calculateLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function calculateContrast(rgb: { r: number; g: number; b: number }, bgLum: number) {
  const lum = calculateLuminance(rgb.r, rgb.g, rgb.b);
  const bright = Math.max(lum, bgLum);
  const dark = Math.min(lum, bgLum);
  return Number(((bright + 0.05) / (dark + 0.05)).toFixed(2));
}

export function ColorLab() {
  const [hex, setHex] = useState('#0d6e52');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rgb = useMemo(() => hexToRgb(hex) || { r: 13, g: 110, b: 82 }, [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);

  // Approximate OKLCH conversion for fast zero-overhead preview
  const oklchString = useMemo(() => {
    const l = (hsl.l / 100).toFixed(2);
    const c = ((hsl.s / 100) * 0.2).toFixed(3);
    const h = hsl.h;
    return `oklch(${l} ${c} ${h})`;
  }, [hsl]);

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const contrastWhite = useMemo(() => calculateContrast(rgb, 1.0), [rgb]);
  const contrastBlack = useMemo(() => calculateContrast(rgb, 0.0), [rgb]);

  const copyValue = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  return (
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-card-bg)] p-4">
        <div className="relative flex items-center gap-3">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
          />
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-muted)]">
              Base Color
            </label>
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="block font-mono text-sm font-semibold uppercase text-[var(--brand-fg)] outline-none bg-transparent"
              maxLength={7}
            />
          </div>
        </div>

        {/* Color Swatch Preview */}
        <div
          className="ml-auto h-10 w-24 rounded-lg border border-[var(--brand-border)] shadow-xs"
          style={{ backgroundColor: hex }}
        />
      </div>

      {/* Conversion Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'HEX', value: hex.toUpperCase() },
          { label: 'RGB', value: rgbString },
          { label: 'HSL', value: hslString },
          { label: 'OKLCH (CSS)', value: oklchString },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-2)] p-3"
          >
            <div className="min-w-0 pr-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-muted)]">
                {item.label}
              </div>
              <div className="truncate font-mono text-xs font-semibold text-[var(--brand-fg)]">
                {item.value}
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyValue(item.label, item.value)}
              className="btn-icon h-7 w-7 shrink-0 text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
              title={`Copy ${item.label}`}
            >
              {copiedKey === item.label ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* WCAG Contrast Health Check */}
      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-muted)] mb-3">
          <Palette className="h-4 w-4 text-[var(--brand-accent)]" />
          WCAG Accessibility Contrast
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Against White */}
          <div className="flex items-center justify-between rounded-lg bg-white p-3 text-slate-900 border border-slate-200">
            <div>
              <span className="text-xs font-bold">vs White Background</span>
              <div className="font-mono text-sm font-semibold">{contrastWhite}:1</div>
            </div>
            <div className="flex gap-1.5">
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  contrastWhite >= 4.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                AA {contrastWhite >= 4.5 ? 'PASS' : 'FAIL'}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  contrastWhite >= 7.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                AAA {contrastWhite >= 7.0 ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {/* Against Dark */}
          <div className="flex items-center justify-between rounded-lg bg-slate-950 p-3 text-white border border-slate-800">
            <div>
              <span className="text-xs font-bold">vs Dark Background</span>
              <div className="font-mono text-sm font-semibold">{contrastBlack}:1</div>
            </div>
            <div className="flex gap-1.5">
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  contrastBlack >= 4.5 ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'
                }`}
              >
                AA {contrastBlack >= 4.5 ? 'PASS' : 'FAIL'}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  contrastBlack >= 7.0 ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                }`}
              >
                AAA {contrastBlack >= 7.0 ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
