import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SceneProps {
  reducedMotion?: boolean;
}

export const JalWaterScene: React.FC<SceneProps> = ({ reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02172d, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Dynamic Oceanic Fluid Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(2.1, 4);
    // Keep original position backup for wave displacement
    const origPositions = Float32Array.from(sphereGeo.attributes.position.array);

    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8,
      emissive: 0x0f172a,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.85,
      transmission: 0.6,
      ior: 1.333
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    mainGroup.add(sphereMesh);

    // Inner Glowing Caustic Core
    const innerGeo = new THREE.IcosahedronGeometry(1.3, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // Concentric Ripple Ring
    const rippleGeo = new THREE.RingGeometry(2.8, 3.1, 64);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
    rippleMesh.rotation.x = Math.PI / 2.3;
    mainGroup.add(rippleMesh);

    // 2. Rising Bubble System
    const bubbleCount = 320;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePos = new Float32Array(bubbleCount * 3);
    const bubbleWobbles = new Float32Array(bubbleCount);
    const bubbleSpeeds = new Float32Array(bubbleCount);

    for (let i = 0; i < bubbleCount; i++) {
      bubblePos[i * 3] = (Math.random() - 0.5) * 14;
      bubblePos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      bubblePos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      bubbleWobbles[i] = Math.random() * Math.PI * 2;
      bubbleSpeeds[i] = 0.4 + Math.random() * 0.8;
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));

    // Custom Canvas Texture for Shimmering Aqua Bubbles
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 32;
    bCanvas.height = 32;
    const bCtx = bCanvas.getContext('2d');
    if (bCtx) {
      const grad = bCtx.createRadialGradient(16, 16, 2, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.3, 'rgba(96, 165, 250, 0.7)');
      grad.addColorStop(0.8, 'rgba(30, 58, 138, 0.2)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      bCtx.fillStyle = grad;
      bCtx.fillRect(0, 0, 32, 32);
    }
    const bubbleTexture = new THREE.CanvasTexture(bCanvas);

    const bubbleMat = new THREE.PointsMaterial({
      size: 0.22,
      map: bubbleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x93c5fd
    });
    const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubbles);

    // 3. Underwater Caustic Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
    scene.add(ambientLight);

    const surfaceLight = new THREE.DirectionalLight(0x38bdf8, 3.0);
    surfaceLight.position.set(0, 10, 4);
    scene.add(surfaceLight);

    const blueLight = new THREE.PointLight(0x2563eb, 4, 16);
    blueLight.position.set(-3, -2, 3);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 15);
    cyanLight.position.set(3, 2, 2);
    scene.add(cyanLight);

    // Mouse Parallax
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = normX * 0.4;
      mouseRef.current.targetY = normY * 0.3;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (!reducedMotion) {
        // Wave Vertex Displacement on Oceanic Sphere
        const positions = sphereGeo.attributes.position.array as Float32Array;
        const count = sphereGeo.attributes.position.count;
        for (let i = 0; i < count; i++) {
          const ox = origPositions[i * 3];
          const oy = origPositions[i * 3 + 1];
          const oz = origPositions[i * 3 + 2];
          const wave = Math.sin(ox * 2.5 + elapsed * 2.0) *
                       Math.cos(oy * 2.5 + elapsed * 1.8) *
                       Math.sin(oz * 2.5 + elapsed * 1.5) * 0.18;
          positions[i * 3] = ox * (1 + wave);
          positions[i * 3 + 1] = oy * (1 + wave);
          positions[i * 3 + 2] = oz * (1 + wave);
        }
        sphereGeo.attributes.position.needsUpdate = true;
        sphereGeo.computeVertexNormals();

        sphereMesh.rotation.y += 0.2 * delta;
        innerMesh.rotation.y -= 0.3 * delta;
        innerMesh.rotation.x += 0.2 * delta;

        rippleMesh.rotation.z += 0.15 * delta;
        const rippleScale = 1 + Math.sin(elapsed * 1.5) * 0.08;
        rippleMesh.scale.set(rippleScale, rippleScale, 1);

        // Rising Wobbling Bubbles
        const bPositions = bubbleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < bubbleCount; i++) {
          bubbleWobbles[i] += delta * 2.5;
          bPositions[i * 3 + 1] += bubbleSpeeds[i] * delta;
          bPositions[i * 3] += Math.sin(bubbleWobbles[i]) * 0.015;
          bPositions[i * 3 + 2] += Math.cos(bubbleWobbles[i]) * 0.015;
          if (bPositions[i * 3 + 1] > 6) {
            bPositions[i * 3 + 1] = -6;
            bPositions[i * 3] = (Math.random() - 0.5) * 14;
          }
        }
        bubbleGeo.attributes.position.needsUpdate = true;
      }

      mainGroup.rotation.y = mouseRef.current.x * 0.5;
      mainGroup.rotation.x = -mouseRef.current.y * 0.4;
      camera.position.x = mouseRef.current.x * 1.3;
      camera.position.y = mouseRef.current.y * 0.9;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      rippleGeo.dispose();
      rippleMat.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
      bubbleTexture.dispose();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
};
