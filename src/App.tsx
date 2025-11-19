import { useEffect, useState, useCallback, useRef } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

const LINE1_ORIGINAL = "DARIUS";
const LINE2_ORIGINAL = "ATSU";
const LINE1_TARGET = "GXMBY";
const LINE2_TARGET = "////";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/"; // Added / for the target characters
const ANIMATION_COOLDOWN = 7000; // 7 seconds cooldown between animations

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
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  // Time-aware theme detection (inverted: dark during day, light during night)
  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      // Day hours: 6am-6pm = dark theme, Night hours: 6pm-6am = light theme (inverted)
      const isDayTime = hour >= 6 && hour < 18;
      setTheme(isDayTime ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', isDayTime ? 'dark' : 'light');
    };

    updateTheme();
    // Check every minute for theme updates
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Start name animation immediately after mount
    requestAnimationFrame(() => setIsVisible(true));
    // Start links animation after name animation
    const timer = setTimeout(() => setShowLinks(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Split-flap animation logic
  const animateSplitFlap = useCallback((toTarget: boolean) => {
    setIsAnimating(true);
    setFlickerChars([]); // Clear any existing flickers

    // Flicker effect before transformation - flicker each character individually
    const flickerCount = 6;
    let currentFlicker = 0;
    
    const flickerInterval = setInterval(() => {
      if (currentFlicker < flickerCount) {
        // Randomly select characters to flicker
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
        // Clear interval and flicker state
        clearInterval(flickerInterval);
        setFlickerChars([]);
        
        // Start the actual transformation
        if (toTarget) {
          // Transform to GXMBY on line 1 and // on line 2
          let currentLine1 = LINE1_ORIGINAL;
          let currentLine2 = LINE2_ORIGINAL;

          // Animate line 1 (DARIUS -> GXMBY)
          for (let i = 0; i < Math.max(LINE1_ORIGINAL.length, LINE1_TARGET.length); i++) {
            setTimeout(() => {
              if (i < LINE1_TARGET.length && i < LINE1_ORIGINAL.length) {
                // Transform existing character
                let cycles = 0;
                const cycleInterval = setInterval(() => {
                  if (cycles < 2) {
                    const randomChar = CHARS[Math.floor(Math.random() * (CHARS.length - 1))]; // Exclude / for random
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
                // Remove extra characters
                currentLine1 = currentLine1.slice(0, -1);
                setLine1Text(currentLine1);
              }
            }, i * 80);
          }

          // Animate line 2 (ATSU -> //)
          for (let i = 0; i < Math.max(LINE2_ORIGINAL.length, LINE2_TARGET.length); i++) {
            setTimeout(() => {
              if (i < LINE2_TARGET.length && i < LINE2_ORIGINAL.length) {
                // Transform existing character
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
                // Remove extra characters
                currentLine2 = currentLine2.slice(0, -1);
                setLine2Text(currentLine2);
                if (i === LINE2_ORIGINAL.length - 1) {
                  setIsAnimating(false);
                }
              }
            }, (LINE1_ORIGINAL.length + i) * 80);
          }
        } else {
          // Transform back to DARIUS ATSU
          const targetLine1 = LINE1_ORIGINAL;
          const targetLine2 = LINE2_ORIGINAL;
          let currentLine1 = line1Text;

          // Animate line 1 back to DARIUS
          for (let i = 0; i < targetLine1.length; i++) {
            setTimeout(() => {
              const targetChar = targetLine1[i];
              let cycles = 0;
              const cycleInterval = setInterval(() => {
                if (cycles < 2) {
                  const randomChar = CHARS[Math.floor(Math.random() * (CHARS.length - 1))]; // Exclude /
                  const chars = currentLine1.split('');
                  if (chars.length <= i) {
                    chars.push(randomChar);
                  } else {
                    chars[i] = randomChar;
                  }
                  currentLine1 = chars.join('');
                  setLine1Text(currentLine1);
                  cycles++;
                } else {
                  clearInterval(cycleInterval);
                  const chars = currentLine1.split('');
                  if (chars.length <= i) {
                    chars.push(targetChar);
                  } else {
                    chars[i] = targetChar;
                  }
                  currentLine1 = chars.join('');
                  setLine1Text(currentLine1);
                }
              }, 60);
            }, i * 80);
          }

          // Animate line 2 back to ATSU
          for (let i = 0; i < targetLine2.length; i++) {
            setTimeout(() => {
              const targetChar = targetLine2[i];
              let cycles = 0;
              let currentLine2Local = line2Text;
              const cycleInterval = setInterval(() => {
                if (cycles < 2) {
                  const randomChar = CHARS[Math.floor(Math.random() * (CHARS.length - 1))]; // Exclude /
                  const chars = currentLine2Local.split('');
                  if (chars.length <= i) {
                    chars.push(randomChar);
                  } else {
                    chars[i] = randomChar;
                  }
                  currentLine2Local = chars.join('');
                  setLine2Text(currentLine2Local);
                  cycles++;
                } else {
                  clearInterval(cycleInterval);
                  const chars = currentLine2Local.split('');
                  if (chars.length <= i) {
                    chars.push(targetChar);
                  } else {
                    chars[i] = targetChar;
                  }
                  currentLine2Local = chars.join('');
                  setLine2Text(currentLine2Local);
                  if (i === targetLine2.length - 1) {
                    setIsAnimating(false);
                  }
                }
              }, 60);
            }, (targetLine1.length + i) * 80);
          }
        }
      }
    }, 50);

    // Return cleanup function
    return () => {
      clearInterval(flickerInterval);
      setFlickerChars([]);
    };
  }, [line1Text, line2Text]);

  // Handle hover with delay
  useEffect(() => {
    if (isHovering && !isAnimating) {
      const now = Date.now();
      const timeSinceLastAnimation = now - lastAnimationTime;
      
      // Check if enough time has passed since last animation
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
        
        // Also check cooldown for reverse animation
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
              className={`font-extrabold leading-[0.85] tracking-tight transition-all duration-1000 pb-6 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ 
                fontFamily: "'Druk Wide Bold', system-ui, sans-serif",
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
                {line1Text.split('').map((char, index) => {
                  const isFlickering = flickerChars.some(f => f.line === 1 && f.index === index);
                  return (
                    <span
                      key={`line1-${index}`}
                      className="split-flap-char inline-block"
                      style={{
                        opacity: isFlickering ? 0.3 : 1,
                        transition: 'opacity 0.05s ease-in-out'
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
              <div className="block">
                {line2Text.split('').map((char, index) => {
                  const isFlickering = flickerChars.some(f => f.line === 2 && f.index === index);
                  return (
                    <span
                      key={`line2-${index}`}
                      className="split-flap-char inline-block"
                      style={{
                        opacity: isFlickering ? 0.3 : 1,
                        transition: 'opacity 0.05s ease-in-out'
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </a>
          ) : (
            <div 
              className={`font-extrabold leading-[0.85] tracking-tight transition-all duration-1000 pb-6 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ 
                fontFamily: "'Druk Wide Bold', system-ui, sans-serif",
                color: 'var(--text-color)',
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: 'clamp(3rem, 12vw, 10rem)'
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="block">
                {line1Text.split('').map((char, index) => {
                  const isFlickering = flickerChars.some(f => f.line === 1 && f.index === index);
                  return (
                    <span
                      key={`line1-${index}`}
                      className="split-flap-char inline-block"
                      style={{
                        opacity: isFlickering ? 0.3 : 1,
                        transition: 'opacity 0.05s ease-in-out'
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
              <div className="block">
                {line2Text.split('').map((char, index) => {
                  const isFlickering = flickerChars.some(f => f.line === 2 && f.index === index);
                  return (
                    <span
                      key={`line2-${index}`}
                      className="split-flap-char inline-block"
                      style={{
                        opacity: isFlickering ? 0.3 : 1,
                        transition: 'opacity 0.05s ease-in-out'
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
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
                    fontFamily: "'Druk Wide Bold', system-ui, sans-serif",
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
