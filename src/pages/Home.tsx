import { useEffect, useState, useCallback, useRef } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { Link } from 'react-router-dom';

const LINE1_ORIGINAL = "DARIUS";
const LINE2_ORIGINAL = "ATSU";


interface CharPressure {
  scale: number;
  blur: number;
}

function Home(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [charPressures, setCharPressures] = useState<Map<string, CharPressure>>(new Map());
  

  const textContainerRef = useRef<HTMLElement | null>(null);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  // Time-aware theme detection (INVERTED: night = white bg, day = black bg)
  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      // Night hours: 6pm-6am = light theme, Day hours: 6am-6pm = dark theme
      const isNightTime = hour < 6 || hour >= 18;
      setTheme(isNightTime ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', isNightTime ? 'light' : 'dark');
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(() => setShowLinks(true), 1200);
    return () => clearTimeout(timer);
  }, []);



  // Cursor tracking for pressure effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      
      if (!textContainerRef.current) return;
      
      const container = textContainerRef.current;
      const chars = container.querySelectorAll('.pressure-char');
      const newPressures = new Map<string, CharPressure>();
      
      chars.forEach((char, index) => {
        const rect = char.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(e.clientX - charCenterX, 2) + 
          Math.pow(e.clientY - charCenterY, 2)
        );
        
        // Calculate pressure based on distance (closer = more pressure)
        const maxDistance = 300;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        
        // Scale: 1.0 to 1.3 based on proximity
        const scale = 1 + (1 - normalizedDistance) * 0.3;
        
        // Blur: 0 to 8px based on proximity (edges blur more)
        const blur = (1 - normalizedDistance) * 8;
        
        newPressures.set(`char-${index}`, { scale, blur });
      });
      
      setCharPressures(newPressures);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Pointer Events API for pressure (if supported)
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!textContainerRef.current || e.pressure === 0.5) return; // 0.5 is default mouse pressure
      
      const container = textContainerRef.current;
      const chars = container.querySelectorAll('.pressure-char');
      const newPressures = new Map<string, CharPressure>();
      
      chars.forEach((char, index) => {
        const rect = char.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(e.clientX - charCenterX, 2) + 
          Math.pow(e.clientY - charCenterY, 2)
        );
        
        const maxDistance = 300;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        
        // Combine distance and actual pressure
        const pressureFactor = e.pressure;
        const scale = 1 + (1 - normalizedDistance) * pressureFactor * 0.5;
        const blur = (1 - normalizedDistance) * pressureFactor * 12;
        
        newPressures.set(`char-${index}`, { scale, blur });
      });
      
      setCharPressures(newPressures);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);



  const links = [
    { href: 'https://github.com/mxdarius', label: 'GITHUB', isExternal: true },
    { href: 'mailto:webenquiry@dariusatsu.com', label: 'EMAIL', isExternal: true },
    { href: 'https://cv.dariusatsu.com', label: 'CV', isExternal: true },
  ];

  const isDark = theme === 'dark';

  const renderPressureText = (text: string, lineNumber: number) => {
    return text.split('').map((char, index) => {
      const globalIndex = lineNumber === 1 ? index : LINE1_ORIGINAL.length + index;
      const pressure = charPressures.get(`char-${globalIndex}`) || { scale: 1, blur: 0 };
      
      return (
        <span
          key={`line${lineNumber}-${index}`}
          className="pressure-char split-flap-char inline-block"
          style={{
            opacity: 1,
            transform: `scale(${pressure.scale})`,
            filter: `blur(${pressure.blur}px)`,
            transition: 'opacity 0.05s ease-in-out, transform 0.1s ease-out, filter 0.1s ease-out',
            display: 'inline-block',
            transformOrigin: 'center'
          }}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-color)' }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: isDark ? "#000000" : "#ffffff",
            },
          },
          particles: {
            number: {
              value: 60,
              density: {
                enable: true,
                area: 1500
              }
            },
            color: {
              value: isDark ? "#ffffff" : "#000000",
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.4,
              random: false
            },
            size: {
              value: 1,
              random: true
            },
            links: {
              enable: true,
              distance: 150,
              color: isDark ? "#ffffff" : "#000000",
              opacity: 0.3,
              width: 0.8
            },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              random: false,
              straight: false,
              outModes: {
                default: "bounce"
              },
              attract: {
                enable: false
              }
            }
          },
          interactivity: {
            detectsOn: "window",
            events: {
              onHover: {
                enable: true,
                mode: "grab"
              },
              onClick: {
                enable: true,
                mode: "push"
              },
              resize: true
            },
            modes: {
              grab: {
                distance: 200,
                links: {
                  opacity: 0.5
                }
              },
              push: {
                quantity: 3
              }
            }
          },
          detectRetina: true,
        }}
        className="!fixed !inset-0"
      />
      <div className="relative z-10 h-full flex items-center justify-center px-3">
        <div className="flex flex-col w-full max-w-[90vw] md:w-[80vw]">
            <div 
              ref={textContainerRef as any}
              className={`font-extrabold leading-[0.85] tracking-tight transition-all duration-1000 pb-6 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ 
                fontFamily: "'Cocogoose Pro', system-ui, sans-serif",
                color: 'var(--text-color)',
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: 'clamp(3rem, 12vw, 10rem)'
              }}
            >
              <div className="block">
                {renderPressureText(LINE1_ORIGINAL, 1)}
              </div>
              <div className="block">
                {renderPressureText(LINE2_ORIGINAL, 2)}
              </div>
            </div>
          
          <div className="relative h-[2px] mt-8 md:mt-16">
            <div className="flex flex-wrap gap-4 md:gap-8 absolute -top-8">
              {links.map((link, index) => (
                link.isExternal ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`transition-all duration-700 hover:opacity-100 ${
                      showLinks 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 -translate-y-[200px]'
                    }`}
                    style={{ 
                      fontFamily: "'Cocogoose Pro', system-ui, sans-serif",
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                      transitionDelay: `${index * 150 + 200}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
                      color: 'var(--text-secondary)'
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`transition-all duration-700 hover:opacity-100 ${
                      showLinks 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 -translate-y-[200px]'
                    }`}
                    style={{ 
                      fontFamily: "'Cocogoose Pro', system-ui, sans-serif",
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                      transitionDelay: `${index * 150 + 200}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
            <div 
              className={`h-full transition-all duration-1000 ${
                showLinks ? 'w-full opacity-100' : 'w-0 opacity-0'
              }`}
              style={{ 
                transitionDelay: '800ms',
                transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
                backgroundColor: 'var(--divider-color)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
