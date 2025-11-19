import { useEffect, useState, useCallback, useRef } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

const LINE1_ORIGINAL = "DARIUS";
const LINE2_ORIGINAL = "ATSU";
const LINE1_TARGET = "GXMBY";
const LINE2_TARGET = "////";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/";
const ANIMATION_COOLDOWN = 7000;

interface CharPressure {
  scale: number;
  blur: number;
}

function App(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isHovering, setIsHovering] = useState(false);
  const [line1Text, setLine1Text] = useState(LINE1_ORIGINAL);
  const [line2Text, setLine2Text] = useState(LINE2_ORIGINAL);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flickerChars, setFlickerChars] = useState<{line: number, index: number}[]>([]);
  const [lastAnimationTime, setLastAnimationTime] = useState(0);
  const [charPressures, setCharPressures] = useState<Map<string, CharPressure>>(new Map());
  
  const hoverTimeoutRef = useRef<number | null>(null);
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

  // Safety: Ensure "DARIUS ATSU" is always the natural default
  useEffect(() => {
    // On mount, guarantee the text is set to original
    if (line1Text !== LINE1_ORIGINAL || line2Text !== LINE2_ORIGINAL) {
      if (!isAnimating) {
        console.log('⚠️ Restoring to default: DARIUS ATSU');
        setLine1Text(LINE1_ORIGINAL);
        setLine2Text(LINE2_ORIGINAL);
      }
    }
  }, []); // Only run once on mount

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
  }, [line1Text, line2Text]);

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
  }, [line1Text, line2Text]);

  const animateSplitFlap = useCallback((toTarget: boolean) => {
    setIsAnimating(true);
    setFlickerChars([]);

    const flickerCount = 6;
    let currentFlicker = 0;
    
    const flickerInterval = setInterval(() => {
      if (currentFlicker < flickerCount) {
        const chars: {line: number, index: number}[] = [];
        for (let i = 0; i < LINE1_ORIGINAL.length; i++) {
          if (Math.random() > 0.5) chars.push({line: 1, index: i});
        }
        for (let i = 0; i < LINE2_ORIGINAL.length; i++) {
          if (Math.random() > 0.5) chars.push({line: 2, index: i});
        }
        setFlickerChars(chars);
        currentFlicker++;
      } else {
        clearInterval(flickerInterval);
        setFlickerChars([]);
        
        if (toTarget) {
          // Transform to GXMBY ////
          let currentLine1 = LINE1_ORIGINAL;
          let currentLine2 = LINE2_ORIGINAL;

          for (let i = 0; i < Math.max(LINE1_ORIGINAL.length, LINE1_TARGET.length); i++) {
            setTimeout(() => {
              if (i < LINE1_TARGET.length && i < LINE1_ORIGINAL.length) {
                let cycles = 0;
                const cycleInterval = setInterval(() => {
                  if (cycles < 2) {
                    const randomChar = CHARS[Math.floor(Math.random() * (CHARS.length - 1))];
                    const chars = currentLine1.split('');
                    chars[i] = randomChar;
                    currentLine1 = chars.join('');
                    setLine1Text(currentLine1);
                    cycles++;
                  } else {
                    clearInterval(cycleInterval);
                    const chars = currentLine1.split('');
                    chars[i] = LINE1_TARGET[i];
                    currentLine1 = chars.join('');
                    setLine1Text(currentLine1);
                  }
                }, 60);
              } else if (i >= LINE1_TARGET.length) {
                currentLine1 = currentLine1.slice(0, -1);
                setLine1Text(currentLine1);
              }
            }, i * 80);
          }

          for (let i = 0; i < Math.max(LINE2_ORIGINAL.length, LINE2_TARGET.length); i++) {
            setTimeout(() => {
              if (i < LINE2_TARGET.length && i < LINE2_ORIGINAL.length) {
                let cycles = 0;
                const cycleInterval = setInterval(() => {
                  if (cycles < 2) {
                    const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
                    const chars = currentLine2.split('');
                    chars[i] = randomChar;
                    currentLine2 = chars.join('');
                    setLine2Text(currentLine2);
                    cycles++;
                  } else {
                    clearInterval(cycleInterval);
                    const chars = currentLine2.split('');
                    chars[i] = LINE2_TARGET[i];
                    currentLine2 = chars.join('');
                    setLine2Text(currentLine2);
                    
                    if (i === LINE2_TARGET.length - 1) {
                      setIsAnimating(false);
                    }
                  }
                }, 60);
              } else if (i >= LINE2_TARGET.length) {
                currentLine2 = currentLine2.slice(0, -1);
                setLine2Text(currentLine2);
                if (i === LINE2_ORIGINAL.length - 1) {
                  setIsAnimating(false);
                }
              }
            }, (LINE1_ORIGINAL.length + i) * 80);
          }
        } else {
          // RESTORE TO "DARIUS ATSU" - Guaranteed restoration
          const targetLine1 = LINE1_ORIGINAL; // "DARIUS"
          const targetLine2 = LINE2_ORIGINAL; // "ATSU"

          // Build strings character by character to ensure proper restoration
          const line1Chars: string[] = [];
          const line2Chars: string[] = [];

          // Animate line 1 back to DARIUS
          for (let i = 0; i < targetLine1.length; i++) {
            setTimeout(() => {
              const targetChar = targetLine1[i];
              let cycles = 0;
              
              const cycleInterval = setInterval(() => {
                if (cycles < 2) {
                  // Flicker with random character
                  const randomChar = CHARS[Math.floor(Math.random() * (CHARS.length - 1))];
                  line1Chars[i] = randomChar;
                  
                  // Pad with existing chars or spaces
                  const displayChars = [...line1Chars];
                  while (displayChars.length < targetLine1.length) {
                    displayChars.push('');
                  }
                  setLine1Text(displayChars.join('').substring(0, i + 1).padEnd(i + 1, ' '));
                  cycles++;
                } else {
                  // Set final character
                  clearInterval(cycleInterval);
                  line1Chars[i] = targetChar;
                  setLine1Text(line1Chars.join(''));
                }
              }, 60);
            }, i * 80);
          }

          // Animate line 2 back to ATSU  
          for (let i = 0; i < targetLine2.length; i++) {
            setTimeout(() => {
              const targetChar = targetLine2[i];
              let cycles = 0;
              
              const cycleInterval = setInterval(() => {
                if (cycles < 2) {
                  // Flicker with random character
                  const randomChar = CHARS[Math.floor(Math.random() * (CHARS.length - 1))];
                  line2Chars[i] = randomChar;
                  
                  // Pad with existing chars or spaces
                  const displayChars = [...line2Chars];
                  while (displayChars.length < targetLine2.length) {
                    displayChars.push('');
                  }
                  setLine2Text(displayChars.join('').substring(0, i + 1).padEnd(i + 1, ' '));
                  cycles++;
                } else {
                  // Set final character
                  clearInterval(cycleInterval);
                  line2Chars[i] = targetChar;
                  setLine2Text(line2Chars.join(''));
                  
                  // Complete animation when last character is restored
                  if (i === targetLine2.length - 1) {
                    setTimeout(() => {
                      // Final guarantee: force set to exact original values
                      setLine1Text(LINE1_ORIGINAL);
                      setLine2Text(LINE2_ORIGINAL);
                      setIsAnimating(false);
                      console.log('✓ Restoration complete: DARIUS ATSU');
                    }, 200);
                  }
                }
              }, 60);
            }, (targetLine1.length + i) * 80);
          }
        }
      }
    }, 50);

    return () => {
      clearInterval(flickerInterval);
      setFlickerChars([]);
    };
  }, [line1Text, line2Text]);

  useEffect(() => {
    if (isHovering && !isAnimating) {
      const now = Date.now();
      const timeSinceLastAnimation = now - lastAnimationTime;
      
      if (timeSinceLastAnimation >= ANIMATION_COOLDOWN) {
        hoverTimeoutRef.current = setTimeout(() => {
          setLastAnimationTime(Date.now());
          animateSplitFlap(true);
        }, 600);
      }
    } else if (!isHovering && !isAnimating) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (line1Text !== LINE1_ORIGINAL || line2Text !== LINE2_ORIGINAL) {
        const now = Date.now();
        const timeSinceLastAnimation = now - lastAnimationTime;
        
        if (timeSinceLastAnimation >= ANIMATION_COOLDOWN) {
          setLastAnimationTime(Date.now());
          animateSplitFlap(false);
        }
      }
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovering, isAnimating, line1Text, line2Text, animateSplitFlap, lastAnimationTime]);

  const links = [
    { href: 'https://github.com/mxdarius', label: 'GITHUB' },
    { href: 'mailto:webenquiry@dariusatsu.com', label: 'EMAIL' },
  ];

  const isDark = theme === 'dark';

  const renderPressureText = (text: string, lineNumber: number) => {
    return text.split('').map((char, index) => {
      const globalIndex = lineNumber === 1 ? index : LINE1_ORIGINAL.length + index;
      const pressure = charPressures.get(`char-${globalIndex}`) || { scale: 1, blur: 0 };
      const isFlickering = flickerChars.some(f => f.line === lineNumber && f.index === index);
      
      return (
        <span
          key={`line${lineNumber}-${index}`}
          className="pressure-char split-flap-char inline-block"
          style={{
            opacity: isFlickering ? 0.3 : 1,
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
          {line1Text === LINE1_TARGET && line2Text === LINE2_TARGET ? (
            <a
              href="https://instagram.com/gxmby"
              target="_blank"
              rel="noopener noreferrer"
              ref={textContainerRef as any}
              className={`font-extrabold leading-[0.85] tracking-tight transition-all duration-1000 pb-6 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ 
                fontFamily: "'Cocogoose Pro', system-ui, sans-serif",
                color: 'var(--text-color)',
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: 'clamp(3rem, 12vw, 10rem)',
                textDecoration: 'none'
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="block">
                {renderPressureText(line1Text, 1)}
              </div>
              <div className="block">
                {renderPressureText(line2Text, 2)}
              </div>
            </a>
          ) : (
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
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="block">
                {renderPressureText(line1Text, 1)}
              </div>
              <div className="block">
                {renderPressureText(line2Text, 2)}
              </div>
            </div>
          )}
          
          <div className="relative h-[2px] mt-8 md:mt-16">
            <div className="flex flex-wrap gap-4 md:gap-8 absolute -top-8">
              {links.map((link, index) => (
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

export default App;
