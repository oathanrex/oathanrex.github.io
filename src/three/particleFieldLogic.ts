export interface ParticleSeed {
  x: number;
  y: number;
  z: number;
  phase: number;
  rotSpeedX: number;
  rotSpeedY: number;
  scale: number;
  colorIndex: number;
}

export interface ParticleSeedOptions {
  count: number;
  spreadX: number;
  spreadY: number;
  spreadZ: number;
}

export interface ParticleThemePalette {
  background: number;
  fog: number;
  hemiSky: number;
  hemiGround: number;
  keyLight: number;
  colors: readonly [number, number, number, number];
  lineColor: number;
  lineOpacity: number;
}

function seededUnit(index: number, salt: number): number {
  const x = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function generateParticleSeeds({
  count,
  spreadX,
  spreadY,
  spreadZ,
}: ParticleSeedOptions): ParticleSeed[] {
  const seeds: ParticleSeed[] = [];
  for (let i = 0; i < count; i += 1) {
    // Bias particles subtly toward the right half so left-side hero typography stays crisp
    const rawX = seededUnit(i, 1);
    const x = (rawX * 1.15 - 0.35) * spreadX * 0.5;
    const y = (seededUnit(i, 2) - 0.5) * spreadY;
    const z = (seededUnit(i, 3) - 0.5) * spreadZ - 0.4;
    const phase = seededUnit(i, 4) * Math.PI * 2;
    const rotSpeedX = (seededUnit(i, 5) - 0.5) * 0.45;
    const rotSpeedY = (seededUnit(i, 6) - 0.5) * 0.45;
    const scale = 0.65 + seededUnit(i, 7) * 0.85;
    const colorIndex = Math.floor(seededUnit(i, 8) * 4) % 4;

    seeds.push({
      x,
      y,
      z,
      phase,
      rotSpeedX,
      rotSpeedY,
      scale,
      colorIndex,
    });
  }
  return seeds;
}

export function computePointerDisplacement(
  px: number,
  py: number,
  cursorX: number,
  cursorY: number,
  radius: number,
  strength: number
): { dx: number; dy: number; scaleBoost: number } {
  const diffX = px - cursorX;
  const diffY = py - cursorY;
  const distSq = diffX * diffX + diffY * diffY;
  const radiusSq = radius * radius;

  if (distSq >= radiusSq || distSq < 1e-6) {
    return { dx: 0, dy: 0, scaleBoost: 1 };
  }

  const dist = Math.sqrt(distSq);
  const falloff = 1 - dist / radius;
  const eased = falloff * falloff;
  const nx = diffX / dist;
  const ny = diffY / dist;

  return {
    dx: nx * strength * eased,
    dy: ny * strength * eased,
    scaleBoost: 1 + eased * 0.42,
  };
}

export function getParticleThemePalette(theme: 'light' | 'dark'): ParticleThemePalette {
  if (theme === 'dark') {
    return {
      background: 0x08090d,
      fog: 0x08090d,
      hemiSky: 0xd1fae5,
      hemiGround: 0x0f172a,
      keyLight: 0xffffff,
      colors: [0x34d399, 0x10b981, 0x94a3b8, 0xfbbf24],
      lineColor: 0x34d399,
      lineOpacity: 0.22,
    };
  }

  return {
    background: 0xf8fafc,
    fog: 0xf8fafc,
    hemiSky: 0xffffff,
    hemiGround: 0xcbd5e1,
    keyLight: 0xf8fafc,
    colors: [0x0d9488, 0x059669, 0x64748b, 0x94a3b8],
    lineColor: 0x0f766e,
    lineOpacity: 0.16,
  };
}
