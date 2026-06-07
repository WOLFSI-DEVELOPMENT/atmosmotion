import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate, spring } from 'remotion';

export const WatermarkEndScene: React.FC<{ fps?: number, logoSrc?: string, title?: string, subtitle?: string }> = ({ fps = 30, logoSrc, title = "Generated with Atmos", subtitle = "atmos.ai" }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 12,
    },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', opacity }}>
      <div style={{ transform: `scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {logoSrc ? (
          <img src={logoSrc} style={{ width: '150px', height: '150px', marginBottom: '20px', objectFit: 'contain' }} alt="Logo" />
        ) : (
          <div style={{ width: '100px', height: '100px', backgroundColor: '#333', borderRadius: '20px', marginBottom: '20px' }}></div>
        )}
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '40px', fontWeight: 'bold', color: '#111', margin: '0' }}>{title}</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '24px', color: '#666', marginTop: '10px' }}>{subtitle}</p>
      </div>
    </AbsoluteFill>
  );
};
