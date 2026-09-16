import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SceneProps {
  reducedMotion?: boolean;
}

export const AakashCosmicScene: React.FC<SceneProps> = ({ reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090514, 0.03);

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

    // 1. Central Cosmic Planetoid Core
    const planetGeo = new THREE.SphereGeometry(2.0, 48, 48);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x3b0764,
      emissive: 0x1e1b4b,
      roughness: 0.3,
      metalness: 0.7,
      flatShading: false
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    mainGroup.add(planetMesh);

    // Glowing Astral Lattice Cage
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(planetGeo, wireMat);
    wireMesh.scale.setScalar(1.03);
    mainGroup.add(wireMesh);

    // 2. Dual Tilted Holographic Planetary Rings
    const ringGroup = new THREE.Group();
    mainGroup.add(ringGroup);

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(2.8, 3.8, 64), ringMat1);
    ring1.rotation.x = Math.PI / 2.6;
    ring1.rotation.y = Math.PI / 8;
    ringGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xe879f9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(4.1, 4.4, 64), ringMat2);
    ring2.rotation.x = Math.PI / 2.3;
    ring2.rotation.y = -Math.PI / 7;
    ringGroup.add(ring2);

    // 3. Orbiting Stellar Satellites
    const moonsGroup = new THREE.Group();
    mainGroup.add(moonsGroup);
    const moonCount = 3;
    const moons: { mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; yOffset: number }[] = [];

    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xe879f9,
      emissive: 0xa855f7,
      roughness: 0.2,
      metalness: 0.8
    });

    for (let i = 0; i < moonCount; i++) {
      const mGeo = new THREE.OctahedronGeometry(0.28, 0);
      const mMesh = new THREE.Mesh(mGeo, moonMat);
      const orbitRadius = 4.8 + i * 0.8;
      const angle = (i / moonCount) * Math.PI * 2;
      const speed = 0.4 + i * 0.15;
      const yOffset = (i - 1) * 0.8;
      moonsGroup.add(mMesh);
      moons.push({ mesh: mMesh, orbitRadius, speed, angle, yOffset });
    }

    // 4. Multi-Layered Starfield Nebula Particles
    const starCount = 550;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 22;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

    // Custom Canvas Texture for Twinkling Astral Stars
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 32;
    sCanvas.height = 32;
    const sCtx = sCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(192, 132, 252, 0.8)');
      grad.addColorStop(0.7, 'rgba(107, 33, 168, 0.3)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 32, 32);
    }
    const starTexture = new THREE.CanvasTexture(sCanvas);

    const starMat = new THREE.PointsMaterial({
      size: 0.15,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xf0abfc
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0x2e1065, 2.0);
    scene.add(ambientLight);

    const purpleGlow = new THREE.PointLight(0xa855f7, 5, 20);
    purpleGlow.position.set(4, 4, 3);
    scene.add(purpleGlow);

    const magentaLight = new THREE.PointLight(0xe879f9, 4, 18);
    magentaLight.position.set(-4, -3, 3);
    scene.add(magentaLight);

    const blueBack = new THREE.DirectionalLight(0x6366f1, 2.0);
    blueBack.position.set(0, 6, -6);
    scene.add(blueBack);

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
        // Celestial Core Spin
        planetMesh.rotation.y += 0.15 * delta;
        wireMesh.rotation.y -= 0.12 * delta;
        wireMesh.rotation.z += 0.08 * delta;

        // Ring Precession
        ringGroup.rotation.z += 0.1 * delta;
        ringGroup.rotation.y = Math.sin(elapsed * 0.4) * 0.15;

        // Orbiting Moons
        moons.forEach((m) => {
          m.angle += m.speed * delta;
          m.mesh.position.x = Math.cos(m.angle) * m.orbitRadius;
          m.mesh.position.z = Math.sin(m.angle) * m.orbitRadius;
          m.mesh.position.y = m.yOffset + Math.sin(elapsed * 2 + m.orbitRadius) * 0.3;
          m.mesh.rotation.x += 1.2 * delta;
          m.mesh.rotation.y += 0.8 * delta;
        });

        // Drift Starfield
        stars.rotation.y += 0.02 * delta;
        stars.rotation.x = Math.sin(elapsed * 0.2) * 0.03;
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
      planetGeo.dispose();
      planetMat.dispose();
      wireMat.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      ring1.geometry.dispose();
      ring2.geometry.dispose();
      moonMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      starTexture.dispose();
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
