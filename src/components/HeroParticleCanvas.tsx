import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  computePointerDisplacement,
  generateParticleSeeds,
  getParticleThemePalette,
  type ParticleSeed,
} from '../three/particleFieldLogic';

interface HeroParticleCanvasProps {
  theme: 'light' | 'dark';
}

const PARTICLE_COUNT = 112;
const MAX_LINE_SEGMENTS = 180;
const LINK_DISTANCE = 2.05;
const LINK_DISTANCE_SQ = LINK_DISTANCE * LINK_DISTANCE;

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export function HeroParticleCanvas({ theme }: HeroParticleCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<'light' | 'dark'>(theme);
  const applyThemeRef = useRef<((nextTheme: 'light' | 'dark') => void) | null>(null);

  useEffect(() => {
    themeRef.current = theme;
    applyThemeRef.current?.(theme);
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const probeCanvas = document.createElement('canvas');
    const probeGl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!probeGl) return;

    const isSoftwareGl = (() => {
      const ext = probeGl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER;
      const gpu = String(probeGl.getParameter(param) || '');
      probeGl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const initialPalette = getParticleThemePalette(themeRef.current);
    scene.background = new THREE.Color(initialPalette.background);
    scene.fog = new THREE.FogExp2(initialPalette.fog, 0.038);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 40);
    camera.position.set(0, 0, 10.5);

    const hemiLight = new THREE.HemisphereLight(
      initialPalette.hemiSky,
      initialPalette.hemiGround,
      1.05
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(initialPalette.keyLight, 1.55);
    keyLight.position.set(5, 6, 7);
    scene.add(keyLight);

    // Low-poly icosahedron geometry (20 crisp facets per shard)
    const shardGeo = new THREE.IcosahedronGeometry(0.115, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.32,
      metalness: 0.35,
      flatShading: true,
    });

    const seeds: ParticleSeed[] = generateParticleSeeds({
      count: PARTICLE_COUNT,
      spreadX: 16.5,
      spreadY: 7.4,
      spreadZ: 5.5,
    });

    const instancedMesh = new THREE.InstancedMesh(shardGeo, shardMat, PARTICLE_COUNT);
    instancedMesh.frustumCulled = false;

    const applyColors = (palette: ReturnType<typeof getParticleThemePalette>) => {
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        _color.setHex(palette.colors[seeds[i].colorIndex]);
        instancedMesh.setColorAt(i, _color);
      }
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
      }
    };
    applyColors(initialPalette);
    scene.add(instancedMesh);

    // Fine constellation line segments connecting nearby low-poly nodes
    const linePositions = new Float32Array(MAX_LINE_SEGMENTS * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    const lineAttr = new THREE.BufferAttribute(linePositions, 3);
    lineAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute('position', lineAttr);
    lineGeo.setDrawRange(0, 0);

    const lineMat = new THREE.LineBasicMaterial({
      color: initialPalette.lineColor,
      transparent: true,
      opacity: initialPalette.lineOpacity,
      depthWrite: false,
    });
    const constellationLines = new THREE.LineSegments(lineGeo, lineMat);
    constellationLines.frustumCulled = false;
    scene.add(constellationLines);

    // Pre-allocated live positions for zero-GC constellation pairing
    const liveX = new Float32Array(PARTICLE_COUNT);
    const liveY = new Float32Array(PARTICLE_COUNT);
    const liveZ = new Float32Array(PARTICLE_COUNT);

    applyThemeRef.current = (nextTheme: 'light' | 'dark') => {
      const palette = getParticleThemePalette(nextTheme);
      scene.background = new THREE.Color(palette.background);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(palette.fog);
      }
      hemiLight.color.setHex(palette.hemiSky);
      hemiLight.groundColor.setHex(palette.hemiGround);
      keyLight.color.setHex(palette.keyLight);
      lineMat.color.setHex(palette.lineColor);
      lineMat.opacity = palette.lineOpacity;
      applyColors(palette);
    };

    let targetPointerX = 0;
    let targetPointerY = 0;
    let smoothPointerX = 0;
    let smoothPointerY = 0;
    let pointerActive = false;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      if (e.clientY > rect.bottom + 140 || e.clientY < rect.top - 100) {
        pointerActive = false;
        return;
      }
      pointerActive = true;
      targetPointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetPointerY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onWindowBlur = () => {
      pointerActive = false;
      targetPointerX = 0;
      targetPointerY = 0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', onWindowBlur);

    let contextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 320);
      const h = Math.max(container.clientHeight, 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (!contextLost) {
        renderer.render(scene, camera);
      }
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const updateParticles = (dt: number) => {
      const dampLambda = 5.2;
      const goalX = pointerActive ? targetPointerX : 0;
      const goalY = pointerActive ? targetPointerY : 0;
      smoothPointerX = THREE.MathUtils.damp(smoothPointerX, goalX, dampLambda, dt);
      smoothPointerY = THREE.MathUtils.damp(smoothPointerY, goalY, dampLambda, dt);

      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.position.z;
      const halfW = halfH * camera.aspect;
      const cursorWorldX = smoothPointerX * halfW;
      const cursorWorldY = smoothPointerY * halfH;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, smoothPointerX * 0.45, 4.0, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, smoothPointerY * 0.28, 4.0, dt);
      camera.lookAt(0, 0, 0);

      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const s = seeds[i];
        const driftX = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.45 + s.phase) * 0.34;
        const driftY = prefersReducedMotion ? 0 : Math.cos(elapsed * 0.38 + s.phase * 1.3) * 0.28;
        const driftZ = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.28 + s.phase * 0.7) * 0.22;

        const baseX = s.x + driftX;
        const baseY = s.y + driftY;
        const baseZ = s.z + driftZ;

        const { dx, dy, scaleBoost } =
          pointerActive && !prefersReducedMotion
            ? computePointerDisplacement(baseX, baseY, cursorWorldX, cursorWorldY, 3.4, 0.88)
            : { dx: 0, dy: 0, scaleBoost: 1 };

        const px = baseX + dx;
        const py = baseY + dy;
        const pz = baseZ;

        liveX[i] = px;
        liveY[i] = py;
        liveZ[i] = pz;

        _dummy.position.set(px, py, pz);
        _dummy.rotation.set(
          s.phase + elapsed * s.rotSpeedX + smoothPointerY * 0.25,
          s.phase * 0.7 + elapsed * s.rotSpeedY + smoothPointerX * 0.25,
          0
        );
        _dummy.scale.setScalar(s.scale * scaleBoost);
        _dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, _dummy.matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;

      let segCount = 0;
      for (let i = 0; i < PARTICLE_COUNT && segCount < MAX_LINE_SEGMENTS; i += 1) {
        const ax = liveX[i];
        const ay = liveY[i];
        const az = liveZ[i];
        for (let j = i + 1; j < PARTICLE_COUNT && segCount < MAX_LINE_SEGMENTS; j += 1) {
          const dx = ax - liveX[j];
          const dy = ay - liveY[j];
          const dz = az - liveZ[j];
          if (dx * dx + dy * dy + dz * dz < LINK_DISTANCE_SQ) {
            const offset = segCount * 6;
            linePositions[offset] = ax;
            linePositions[offset + 1] = ay;
            linePositions[offset + 2] = az;
            linePositions[offset + 3] = liveX[j];
            linePositions[offset + 4] = liveY[j];
            linePositions[offset + 5] = liveZ[j];
            segCount += 1;
          }
        }
      }
      lineAttr.needsUpdate = true;
      lineGeo.setDrawRange(0, segCount * 2);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      if (!prefersReducedMotion) {
        elapsed += delta;
      }

      if (!contextLost) {
        updateParticles(delta);
        renderer.render(scene, camera);
      }

      if (prefersReducedMotion) return;

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    updateParticles(0.016);
    if (isSoftwareGl) {
      renderer.render(scene, camera);
      if (!prefersReducedMotion) afterDraw(tick);
    } else if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onWindowBlur);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      shardGeo.dispose();
      shardMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      envTarget.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="hero-particle-canvas"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  );
}
