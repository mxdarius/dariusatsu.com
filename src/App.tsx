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
    { href: 'https://www.linkedin.com/in/dariusatsu/', label: 'LINKEDIN' },
    { href: 'https://github.com/mxdarius', label: 'GITHUB' },
    { href: 'https://x.com/dariusatsu', label: 'X' },
    { href: 'mailto:webenquiry@dariusatsu.com', label: 'EMAIL' },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-3">
      <div className="flex flex-col w-full max-w-[90vw] md:w-[80vw]">
        <h1 
          className={`text-white font-extrabold text-[12vw] md:text-[min(20vw,180px)] leading-none tracking-tight transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ fontFamily: "'Druk Wide Bold', system-ui, sans-serif" }}
        >
          DARIUS ATSU
        </h1>
        
        <div className="relative h-[2px] mt-8 md:mt-16">
          <div className="flex flex-wrap gap-4 md:gap-8 absolute -top-8">
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
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
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