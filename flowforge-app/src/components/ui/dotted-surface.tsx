"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// #18e299 = rgb(24, 226, 153) → normalized: (0.094, 0.886, 0.600)
const DOT_R = 0.094;
const DOT_G = 0.886;
const DOT_B = 0.600;

export function DottedSurface({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const { clientWidth: W, clientHeight: H } = container;
    renderer.setSize(W, H);
    container.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.set(0, 0, 30);

    // ── Dot grid ──────────────────────────────────────────────────────────────
    const COLS = 60;
    const ROWS = 30;
    const SPACING = 1.2;
    const count = COLS * ROWS;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        const idx = i * COLS + j;
        positions[idx * 3]     = (j - COLS / 2) * SPACING;
        positions[idx * 3 + 1] = (i - ROWS / 2) * SPACING;
        positions[idx * 3 + 2] = 0;

        colors[idx * 3]     = DOT_R;
        colors[idx * 3 + 1] = DOT_G;
        colors[idx * 3 + 2] = DOT_B;

        sizes[idx] = 3.5;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color",    new THREE.BufferAttribute(colors,    3));
    geometry.setAttribute("size",     new THREE.BufferAttribute(sizes,     1));

    const material = new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime:    { value: 0 },
        uOpacity: { value: 0.35 },
      },
      vertexShader: /* glsl */ `
        attribute float size;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;

        void main() {
          vColor = color;

          // Soft wave that shifts dot opacity
          float wave = sin(position.x * 0.3 + uTime * 0.8) * 0.5
                     + cos(position.y * 0.3 + uTime * 0.6) * 0.5;
          vAlpha = 0.3 + wave * 0.35;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position  = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying vec3  vColor;
        varying float vAlpha;

        void main() {
          // Round dot
          vec2  coord = gl_PointCoord - 0.5;
          float d     = length(coord);
          if (d > 0.5) discard;

          // Soft edge
          float alpha = smoothstep(0.5, 0.2, d) * vAlpha * uOpacity;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ── Mouse parallax ────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Animate ───────────────────────────────────────────────────────────────
    let rafId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      material.uniforms.uTime.value = t;

      // Gentle parallax tilt
      points.rotation.x = THREE.MathUtils.lerp(points.rotation.x, mouse.y * 0.08, 0.05);
      points.rotation.y = THREE.MathUtils.lerp(points.rotation.y, mouse.x * 0.08, 0.05);

      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
