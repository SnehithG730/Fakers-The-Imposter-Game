import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SceneProps {
  reducedMotion?: boolean;
}

export const PrudhviEarthScene: React.FC<SceneProps> = ({ reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x021a12, 0.035);

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
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Core Group for Parallax
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Ancient Monolithic Geode
    const monolithGeo = new THREE.DodecahedronGeometry(2.3, 1);
    // Perturb vertices slightly for organic mineral look
    const posAttr = monolithGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const noise = 1 + (Math.sin(vx * 3 + vy * 2) * 0.08);
      posAttr.setXYZ(i, vx * noise, vy * noise, vz * noise);
    }
    monolithGeo.computeVertexNormals();

    const monolithMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      emissive: 0x022c22,
      roughness: 0.7,
      metalness: 0.3,
      flatShading: true
    });
    const monolithMesh = new THREE.Mesh(monolithGeo, monolithMat);
    mainGroup.add(monolithMesh);

    // Monolith Wireframe Crystal Lattice Overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(monolithGeo, wireMat);
    wireMesh.scale.setScalar(1.02);
    mainGroup.add(wireMesh);

    // Inner Glowing Core
    const innerGeo = new THREE.IcosahedronGeometry(1.4, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 2. Orbiting Mineral Shards / Runes
    const shardGroup = new THREE.Group();
    mainGroup.add(shardGroup);
    const shardCount = 14;
    const shards: { mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; yOffset: number }[] = [];

    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x047857,
      roughness: 0.4,
      metalness: 0.5,
      flatShading: true
    });

    for (let i = 0; i < shardCount; i++) {
      const sGeo = new THREE.TetrahedronGeometry(0.25 + Math.random() * 0.35, 0);
      const sMesh = new THREE.Mesh(sGeo, shardMat);
      const orbitRadius = 3.6 + Math.random() * 2.2;
      const angle = (i / shardCount) * Math.PI * 2 + Math.random();
      const yOffset = (Math.random() - 0.5) * 3;
      const speed = (0.3 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1);

      sMesh.position.set(
        Math.cos(angle) * orbitRadius,
        yOffset,
        Math.sin(angle) * orbitRadius
      );
      shardGroup.add(sMesh);
      shards.push({ mesh: sMesh, orbitRadius, speed, angle, yOffset });
    }

    // 3. Sediment & Spore Particle Cloud
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 16;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    // Custom Canvas Texture for Glowing Dust Flecks
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(52, 211, 153, 1)');
      grad.addColorStop(0.4, 'rgba(16, 185, 129, 0.6)');
      grad.addColorStop(1, 'rgba(6, 78, 59, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x6ee7b7
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x064e3b, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 2.5);
    sunLight.position.set(6, 8, 5);
    scene.add(sunLight);

    const emeraldGlow = new THREE.PointLight(0x10b981, 4, 15);
    emeraldGlow.position.set(0, 0, 2);
    scene.add(emeraldGlow);

    const bottomAmber = new THREE.PointLight(0xd97706, 2.5, 12);
    bottomAmber.position.set(0, -4, 2);
    scene.add(bottomAmber);

    // Mouse Parallax
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = normX * 0.4;
      mouseRef.current.targetY = normY * 0.3;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize Observer
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

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth Parallax Lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (!reducedMotion) {
        // Monolith Rotation & Breathing
        monolithMesh.rotation.y += 0.15 * delta;
        monolithMesh.rotation.x = Math.sin(elapsed * 0.4) * 0.15;
        wireMesh.rotation.y -= 0.1 * delta;
        wireMesh.rotation.z = Math.cos(elapsed * 0.3) * 0.1;
        innerMesh.rotation.y += 0.3 * delta;

        const breathe = 1 + Math.sin(elapsed * 1.2) * 0.03;
        mainGroup.scale.set(breathe, breathe, breathe);

        // Orbiting Shards
        shards.forEach((s) => {
          s.angle += s.speed * delta * 0.6;
          s.mesh.position.x = Math.cos(s.angle) * s.orbitRadius;
          s.mesh.position.z = Math.sin(s.angle) * s.orbitRadius;
          s.mesh.position.y = s.yOffset + Math.sin(elapsed * 1.5 + s.orbitRadius) * 0.4;
          s.mesh.rotation.x += 0.8 * delta;
          s.mesh.rotation.y += 0.6 * delta;
        });

        // Drift Particles
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += (0.15 + (i % 5) * 0.05) * delta;
          positions[i * 3] += Math.sin(elapsed + i) * 0.02 * delta;
          if (positions[i * 3 + 1] > 6) {
            positions[i * 3 + 1] = -6;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      // Parallax Camera / Group Tilt
      mainGroup.rotation.y = mouseRef.current.x * 0.5;
      mainGroup.rotation.x = -mouseRef.current.y * 0.4;
      camera.position.x = mouseRef.current.x * 1.2;
      camera.position.y = mouseRef.current.y * 0.8;
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
      monolithGeo.dispose();
      monolithMat.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      shardMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
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
