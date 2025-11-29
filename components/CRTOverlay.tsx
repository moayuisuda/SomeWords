import React from 'react';

const CRTOverlay: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-lg">
      {/* Scanlines */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 2px, 3px 100%',
        }}
      />
      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)'
        }}
      />
    </div>
  );
};

export default CRTOverlay;
