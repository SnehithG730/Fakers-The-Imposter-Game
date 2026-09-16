import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SceneProps {
  reducedMotion?: boolean;
}

export const AgniFireScene: React.FC<SceneProps> = ({ reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a0505, 0.035);

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

    // 1. Central Incandescent Magma Core
    const magmaGeo = new THREE.IcosahedronGeometry(2.1, 3);
    const origPositions = Float32Array.from(magmaGeo.attributes.position.array);

    const magmaMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      emissive: 0xef4444,
      roughness: 0.5,
      metalness: 0.4,
      flatShading: true
    });
    const magmaMesh = new THREE.Mesh(magmaGeo, magmaMat);
    mainGroup.add(magmaMesh);

    // Fiery Plasma Wireframe Cage
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const wireMesh = new THREE.Mesh(magmaGeo, wireMat);
    wireMesh.scale.setScalar(1.04);
    mainGroup.add(wireMesh);

    // Inner Radiant Star Core
    const innerGeo = new THREE.OctahedronGeometry(1.2, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 2. Orbiting Volcanic Obsidian Shards
    const shardGroup = new THREE.Group();
    mainGroup.add(shardGroup);
    const shardCount = 12;
    const shards: { mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; yOffset: number }[] = [];

    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x450a0a,
      emissive: 0xb91c1c,
      roughness: 0.6,
      metalness: 0.7,
      flatShading: true
    });

    for (let i = 0; i < shardCount; i++) {
      const sGeo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.3, 0);
      const sMesh = new THREE.Mesh(sGeo, shardMat);
      const orbitRadius = 3.6 + Math.random() * 2.0;
      const angle = (i / shardCount) * Math.PI * 2;
      const speed = (0.4 + Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1);
      const yOffset = (Math.random() - 0.5) * 3;
      shardGroup.add(sMesh);
      shards.push({ mesh: sMesh, orbitRadius, speed, angle, yOffset });
    }

    // 3. Rising Incandescent Ember Storm
    const emberCount = 380;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    const emberSpeeds = new Float32Array(emberCount);
    const emberTurbulence = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      emberPos[i * 3] = (Math.random() - 0.5) * 14;
      emberPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      emberPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      emberSpeeds[i] = 0.6 + Math.random() * 1.4;
      emberTurbulence[i] = Math.random() * Math.PI * 2;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));

    // Custom Canvas Texture for Glowing Fiery Sparks
    const eCanvas = document.createElement('canvas');
    eCanvas.width = 32;
    eCanvas.height = 32;
    const eCtx = eCanvas.getContext('2d');
    if (eCtx) {
      const grad = eCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 200, 1)');
      grad.addColorStop(0.3, 'rgba(251, 146, 60, 0.9)');
      grad.addColorStop(0.7, 'rgba(239, 68, 68, 0.4)');
      grad.addColorStop(1, 'rgba(69, 10, 10, 0)');
      eCtx.fillStyle = grad;
      eCtx.fillRect(0, 0, 32, 32);
    }
    const emberTexture = new THREE.CanvasTexture(eCanvas);

    const emberMat = new THREE.PointsMaterial({
      size: 0.19,
      map: emberTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xfca5a5
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x450a0a, 2.0);
    scene.add(ambientLight);

    const flameGlow1 = new THREE.PointLight(0xf43f5e, 5, 20);
    flameGlow1.position.set(3, 3, 3);
    scene.add(flameGlow1);

    const orangeGlow2 = new THREE.PointLight(0xf97316, 4, 18);
    orangeGlow2.position.set(-3, -3, 3);
    scene.add(orangeGlow2);

    const yellowBack = new THREE.DirectionalLight(0xfef08a, 2.0);
    yellowBack.position.set(0, 8, -5);
    scene.add(yellowBack);

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
        // Magma Solar Flare Pulsing
        const positions = magmaGeo.attributes.position.array as Float32Array;
        const count = magmaGeo.attributes.position.count;
        for (let i = 0; i < count; i++) {
          const ox = origPositions[i * 3];
          const oy = origPositions[i * 3 + 1];
          const oz = origPositions[i * 3 + 2];
          const flare = Math.sin(ox * 4 + elapsed * 3.5) *
                        Math.cos(oy * 4 + elapsed * 3.0) * 0.12;
          positions[i * 3] = ox * (1 + flare);
          positions[i * 3 + 1] = oy * (1 + flare);
          positions[i * 3 + 2] = oz * (1 + flare);
        }
        magmaGeo.attributes.position.needsUpdate = true;
        magmaGeo.computeVertexNormals();

        magmaMesh.rotation.y += 0.3 * delta;
        wireMesh.rotation.y -= 0.2 * delta;
        wireMesh.rotation.x += 0.15 * delta;
        innerMesh.rotation.y += 0.5 * delta;

        const pulse = 1 + Math.sin(elapsed * 2.5) * 0.04;
        mainGroup.scale.set(pulse, pulse, pulse);

        // Orbiting Volcanic Shards
        shards.forEach((s) => {
          s.angle += s.speed * delta;
          s.mesh.position.x = Math.cos(s.angle) * s.orbitRadius;
          s.mesh.position.z = Math.sin(s.angle) * s.orbitRadius;
          s.mesh.position.y = s.yOffset + Math.sin(elapsed * 2.5 + s.orbitRadius) * 0.35;
          s.mesh.rotation.x += 1.5 * delta;
          s.mesh.rotation.y += 1.0 * delta;
        });

        // Ascending Ember Sparks
        const ePositions = emberGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < emberCount; i++) {
          emberTurbulence[i] += delta * 3.0;
          ePositions[i * 3 + 1] += emberSpeeds[i] * delta;
          ePositions[i * 3] += Math.sin(emberTurbulence[i]) * 0.025;
          ePositions[i * 3 + 2] += Math.cos(emberTurbulence[i]) * 0.025;
          if (ePositions[i * 3 + 1] > 6) {
            ePositions[i * 3 + 1] = -6;
            ePositions[i * 3] = (Math.random() - 0.5) * 14;
          }
        }
        emberGeo.attributes.position.needsUpdate = true;
      }

      mainGroup.rotation.y = mouseRef.current.x * 0.6;
      mainGroup.rotation.x = -mouseRef.current.y * 0.4;
      camera.position.x = mouseRef.current.x * 1.4;
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
      magmaGeo.dispose();
      magmaMat.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      shardMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      emberTexture.dispose();
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
