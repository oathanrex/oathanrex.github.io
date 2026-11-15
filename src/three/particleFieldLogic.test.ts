import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computePointerDisplacement,
  generateParticleSeeds,
  getParticleThemePalette,
} from './particleFieldLogic.ts';

test('generateParticleSeeds builds deterministic particle layout within bounds', () => {
  const first = generateParticleSeeds({ count: 32, spreadX: 16, spreadY: 8, spreadZ: 5 });
  const second = generateParticleSeeds({ count: 32, spreadX: 16, spreadY: 8, spreadZ: 5 });

  assert.equal(first.length, 32);
  assert.deepEqual(first, second);

  for (const seed of first) {
    assert.ok(seed.y >= -4 && seed.y <= 4);
    assert.ok(seed.colorIndex >= 0 && seed.colorIndex <= 3);
    assert.ok(seed.scale > 0);
  }
});

test('computePointerDisplacement applies smooth magnetic offset inside radius and zero outside', () => {
  const outside = computePointerDisplacement(10, 10, 0, 0, 3.0, 0.8);
  assert.deepEqual(outside, { dx: 0, dy: 0, scaleBoost: 1 });

  const inside = computePointerDisplacement(1, 0, 0, 0, 3.0, 0.9);
  assert.ok(inside.dx > 0);
  assert.equal(inside.dy, 0);
  assert.ok(inside.scaleBoost > 1);
});

test('getParticleThemePalette matches canvas backgrounds to light and dark modes', () => {
  const light = getParticleThemePalette('light');
  const dark = getParticleThemePalette('dark');

  assert.notEqual(light.background, dark.background);
  assert.equal(light.colors.length, 4);
  assert.equal(dark.colors.length, 4);
});
