import React, { useState, useEffect } from 'react';
import { TeamId } from '../../types';
import { PrudhviEarthScene } from './PrudhviEarthScene';
import { VayuAirScene } from './VayuAirScene';
import { JalWaterScene } from './JalWaterScene';
import { AakashCosmicScene } from './AakashCosmicScene';
import { AgniFireScene } from './AgniFireScene';

interface ElementalBackgroundProps {
  teamId: TeamId;
}

export const ElementalBackground: React.FC<ElementalBackgroundProps> = ({ teamId }) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detect WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setHasWebGL(gl);
    } catch {
      setHasWebGL(false);
    }

    // 2. Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const render3DScene = () => {
    if (!hasWebGL) {
      return (
        <div className="absolute inset-0 bg-radial-vignette opacity-50 pointer-events-none" />
      );
    }

    switch (teamId) {
      case 'prudhvi':
        return <PrudhviEarthScene reducedMotion={prefersReducedMotion} />;
      case 'vayu':
        return <VayuAirScene reducedMotion={prefersReducedMotion} />;
      case 'jal':
        return <JalWaterScene reducedMotion={prefersReducedMotion} />;
      case 'aakash':
        return <AakashCosmicScene reducedMotion={prefersReducedMotion} />;
      case 'agni':
        return <AgniFireScene reducedMotion={prefersReducedMotion} />;
      default:
        return <PrudhviEarthScene reducedMotion={prefersReducedMotion} />;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* 3D WebGL Canvas Layer */}
      {render3DScene()}

      {/* Atmospheric Vignette & Contrast Shroud (Ensures text/HUD legibility) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(3, 7, 18, 0.65) 75%, rgba(3, 7, 18, 0.95) 100%)'
        }}
      />
    </div>
  );
};
