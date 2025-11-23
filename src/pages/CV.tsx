import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function CV(): JSX.Element {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-[200vh] bg-[#f0f0f0] relative overflow-hidden">
      {/* Navigation Back */}
      <div className="fixed top-8 left-8 z-50 mix-blend-difference">
        <Link 
          to="/"
          className="text-white font-bold tracking-widest hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'Cocogoose Pro', system-ui, sans-serif" }}
        >
          ← BACK
        </Link>
      </div>

      {/* Parallax Container */}
      <div className="fixed inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        {/* Layer 1: Architectural Element (Moves slower) */}
        <div 
          className="absolute w-[40vw] h-[60vh] left-[10%] top-[20%]"
          style={{
            transform: `translateY(${scrollY * -0.2}px)`,
            transition: 'transform 0.1s cubic-bezier(0,0,0.2,1)'
          }}
        >
          <img 
            src="/images/layer-1.png" 
            alt="Architectural Element" 
            className="w-full h-full object-cover shadow-2xl"
          />
        </div>

        {/* Layer 2: Frame (Moves faster) */}
        <div 
          className="absolute w-[30vw] h-[50vh] right-[15%] top-[30%]"
          style={{
            transform: `translateY(${scrollY * -0.5}px)`,
            transition: 'transform 0.1s cubic-bezier(0,0,0.2,1)'
          }}
        >
          <img 
            src="/images/layer-2.png" 
            alt="Frame" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Content Section (Scrollable) */}
      <div className="relative z-10 pt-[100vh] px-8 md:px-24 pb-24">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 shadow-xl rounded-sm">
          <h1 
            className="text-6xl mb-8 text-black"
            style={{ fontFamily: "'Cocogoose Pro', system-ui, sans-serif" }}
          >
            CV
          </h1>
          
          <div className="space-y-8 text-black/80 font-light text-lg leading-relaxed">
            <p>
              Creative Technologist & Developer based in London.
            </p>
            
            <div className="h-px w-full bg-black/10 my-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
              <div className="font-bold">EXPERIENCE</div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold">Senior Developer</h3>
                  <p className="text-sm text-gray-500">2022 - Present</p>
                  <p className="mt-2">Leading frontend architecture and design systems.</p>
                </div>
                <div>
                  <h3 className="font-bold">Creative Developer</h3>
                  <p className="text-sm text-gray-500">2020 - 2022</p>
                  <p className="mt-2">Building immersive web experiences and interactive installations.</p>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-black/10 my-8" />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
              <div className="font-bold">SKILLS</div>
              <div className="grid grid-cols-2 gap-4">
                <ul className="space-y-2">
                  <li>React / Next.js</li>
                  <li>TypeScript</li>
                  <li>WebGL / Three.js</li>
                  <li>Node.js</li>
                </ul>
                <ul className="space-y-2">
                  <li>UI/UX Design</li>
                  <li>Motion Design</li>
                  <li>Creative Direction</li>
                  <li>System Architecture</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CV;
