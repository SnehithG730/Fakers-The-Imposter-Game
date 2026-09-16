import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SceneProps {
  reducedMotion?: boolean;
}

export const VayuAirScene: React.FC<SceneProps> = ({ reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x042f2e, 0.035);

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

    // 1. Central Aerodynamic Vortex Knot
    const knotGeo = new THREE.TorusKnotGeometry(1.8, 0.35, 128, 32, 2, 3);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x0891b2,
      emissive: 0x0e7490,
      roughness: 0.15,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    mainGroup.add(knotMesh);

    // Outer Translucent Wind Cage
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(knotGeo, wireMat);
    wireMesh.scale.setScalar(1.04);
    mainGroup.add(wireMesh);

    // 2. Concentric Wind Rings
    const ringsGroup = new THREE.Group();
    mainGroup.add(ringsGroup);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa5f3fc,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.04, 16, 100), ringMat);
    ring1.rotation.x = Math.PI / 3;
    ringsGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.03, 16, 100), ringMat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = Math.PI / 6;
    ringsGroup.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.02, 16, 100), ringMat);
    ring3.rotation.z = Math.PI / 5;
    ringsGroup.add(ring3);

    // 3. Helical Streamline Swirl Particles
    const particleCount = 420;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    const particleHeights = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.2 + Math.random() * 4.5;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 8;
      particlePos[i * 3] = Math.cos(angle) * radius;
      particlePos[i * 3 + 1] = height;
      particlePos[i * 3 + 2] = Math.sin(angle) * radius;
      particleRadii[i] = radius;
      particleAngles[i] = angle;
      particleHeights[i] = height;
      particleSpeeds[i] = (0.8 + Math.random() * 1.5) * (1.5 / radius);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    // Custom Canvas Texture for Breezy Cyan Sparks
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(165, 243, 252, 1)');
      grad.addColorStop(0.3, 'rgba(6, 182, 212, 0.7)');
      grad.addColorStop(1, 'rgba(8, 145, 178, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xa5f3fc
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x083344, 2.0);
    scene.add(ambientLight);

    const cyanLight1 = new THREE.PointLight(0x06b6d4, 4, 18);
    cyanLight1.position.set(4, 3, 4);
    scene.add(cyanLight1);

    const tealLight2 = new THREE.PointLight(0x38bdf8, 3, 18);
    tealLight2.position.set(-4, -3, 3);
    scene.add(tealLight2);

    const whiteBackLight = new THREE.DirectionalLight(0xe0f2fe, 1.5);
    whiteBackLight.position.set(0, 5, -5);
    scene.add(whiteBackLight);

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
        // Vortex Swirl Motion
        knotMesh.rotation.x += 0.4 * delta;
        knotMesh.rotation.y += 0.6 * delta;
        wireMesh.rotation.x -= 0.3 * delta;
        wireMesh.rotation.z += 0.5 * delta;

        ring1.rotation.z += 0.3 * delta;
        ring2.rotation.x -= 0.25 * delta;
        ring3.rotation.y += 0.2 * delta;

        // Helical Particle Flow
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          particleAngles[i] += particleSpeeds[i] * delta * 0.8;
          particleHeights[i] += (0.4 + (i % 3) * 0.2) * delta;
          if (particleHeights[i] > 4.5) {
            particleHeights[i] = -4.5;
          }
          const r = particleRadii[i] + Math.sin(elapsed * 2 + i) * 0.15;
          positions[i * 3] = Math.cos(particleAngles[i]) * r;
          positions[i * 3 + 1] = particleHeights[i];
          positions[i * 3 + 2] = Math.sin(particleAngles[i]) * r;
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      mainGroup.rotation.y = mouseRef.current.x * 0.6;
      mainGroup.rotation.x = -mouseRef.current.y * 0.4;
      camera.position.x = mouseRef.current.x * 1.5;
      camera.position.y = mouseRef.current.y * 1.0;
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
      knotGeo.dispose();
      knotMat.dispose();
      wireMat.dispose();
      ringMat.dispose();
      ring1.geometry.dispose();
      ring2.geometry.dispose();
      ring3.geometry.dispose();
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
