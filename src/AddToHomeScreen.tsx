import React, { useState } from 'react';

export const AddToHomeScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = ('matchMedia' in window) && window.matchMedia('(display-mode: standalone)').matches;

  if (!isIOS || isStandalone || !isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg text-white/80 text-sm flex items-center justify-between"
      style={{ 
        fontFamily: "'Druk Wide Bold', system-ui, sans-serif",
        fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
      }}
    >
      <span>Add to Home Screen</span>
      <button 
        onClick={() => setIsVisible(false)}
        className="ml-4 text-white/60 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
};