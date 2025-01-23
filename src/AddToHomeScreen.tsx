import { useState, useEffect } from 'react';

export const AddToHomeScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    // Check for iOS and standalone mode only on client-side
    const checkDeviceCompatibility = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches;
      
      setCanShow(
        isIOS && 
        !isStandalone && 
        typeof window !== 'undefined'
      );
    };

    checkDeviceCompatibility();
  }, []);

  if (!canShow || !isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg text-white/80 text-sm"
      style={{ 
        fontFamily: "'Druk Wide Bold', system-ui, sans-serif",
        fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
      }}
    >
      {!showInstructions ? (
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowInstructions(true)} 
            className="cursor-pointer hover:text-white transition-colors"
            aria-label="Show installation instructions"
          >
            Add to Home Screen
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="ml-4 text-white/60 hover:text-white transition-colors"
            aria-label="Close add to home screen prompt"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowInstructions(false)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Back to main prompt"
              >
                ←
              </button>
              <span>How to install:</span>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="ml-4 text-white/60 hover:text-white transition-colors"
              aria-label="Close add to home screen prompt"
            >
              ✕
            </button>
          </div>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Tap the share button <span className="inline-block">⬆️</span></li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" to confirm</li>
          </ol>
        </div>
      )}
    </div>
  );
export default AddToHomeScreen;
} // Close AddToHomeScreen component
