import React, { useEffect, useState } from 'react';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  useEffect(() => {
    // Start name animation immediately after mount
    requestAnimationFrame(() => setIsVisible(true));
    // Start links animation after name animation
    const timer = setTimeout(() => setShowLinks(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const links = [
    { href: 'https://linkedin.com', label: 'LINKEDIN' },
    { href: 'https://x.com', label: 'X' },
    { href: 'mailto:contact@example.com', label: 'EMAIL' },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="flex flex-col w-[80vw]">
        <h1 
          className={`text-white font-extrabold text-[min(20vw,180px)] leading-none tracking-tight transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ fontFamily: "'Druk Wide Bold', system-ui, sans-serif" }}
        >
          DARIUS ATSU
        </h1>
        
        <div className="relative h-[2px] mt-16">
          <div className="flex gap-8 absolute -top-8">
            {links.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-white/80 hover:text-white transition-all duration-700 ${
                  showLinks 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 -translate-y-[200px]'
                }`}
                style={{ 
                  fontFamily: "'Druk Wide Bold', system-ui, sans-serif",
                  fontSize: '0.875rem',
                  transitionDelay: `${index * 150 + 200}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)'
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div 
            className={`h-full bg-white/30 transition-all duration-1000 ${
              showLinks ? 'w-full opacity-100' : 'w-0 opacity-0'
            }`}
            style={{ 
              transitionDelay: '800ms',
              transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;