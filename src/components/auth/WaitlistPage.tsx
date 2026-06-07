import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, useInView } from 'motion/react';
import { Quote } from 'lucide-react';

const TypewriterText = ({ text1, text2 }: { text1: string, text2?: string }) => {
  const [displayText1, setDisplayText1] = useState('');
  const [displayText2, setDisplayText2] = useState('');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      setDisplayText1('');
      setDisplayText2('');
      
      let currentIndex = 0;
      const totalLen1 = text1.length;
      const totalLen2 = text2 ? text2.length : 0;
      
      const interval = setInterval(() => {
        if (currentIndex < totalLen1) {
          setDisplayText1(text1.substring(0, currentIndex + 1));
        } else if (currentIndex < totalLen1 + totalLen2) {
          setDisplayText2(text2!.substring(0, currentIndex - totalLen1 + 1));
        } else {
          clearInterval(interval);
        }
        currentIndex++;
      }, 50);
      
      return () => clearInterval(interval);
    } else {
      setDisplayText1('');
      setDisplayText2('');
    }
  }, [isInView, text1, text2]);

  return (
    <h2 ref={containerRef} className="text-white text-3xl md:text-5xl font-medium mb-8 h-[1.2em] flex items-center justify-center w-full whitespace-pre-wrap text-center">
      <span>{displayText1}</span>
      {text2 && <span className="text-blue-400">{displayText2}</span>}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="ml-[2px] w-[3px] bg-blue-400 h-[0.9em] inline-block"
      />
    </h2>
  );
};

const faqs = [
  { question: "What is Atmos?", answer: "Atmos is your simplest creative agent, designed to streamline and enhance your content production process. By reducing costs and increasing efficiency, Atmos empowers you to quickly create impactful content in digital space." },
  { question: "Who is Atmos designed for?", answer: "Whether you're a founder outlining a vision, a creator designing a brand, or a developer composing an interface, Atmos adapts to your workflow seamlessly." },
  { question: "How do I create my first design using Atmos?", answer: "Simply describe what you want to build in natural language or start with a basic layout, and the Atmos engine will instantly generate high-fidelity, interactive components for you." },
  { question: "How do I create my first image using Atmos?", answer: "Describe your vision and our AI image generation engine will produce stunning visuals tailored to your brand's unique aesthetic." },
  { question: "What makes Atmos different from other AI content generation agents?", answer: "Atmos operates at the speed of thought. Instead of wrestling with complex tools and floating panels, you engage directly with a fluid, intention-based canvas." }
];

const ROW1_VIDEOS = [
  '-ueUb6PNwbs', '66XwG1CLHuU', 'ISYIEmQxs2M', 'LAl3pCigzKY', 
  'BwRZNXR-IHc', 'Ej6hnsQgV_c', 'oqcESYsJCec', '5svdfmvMwWQ'
];

const ROW2_VIDEOS = [
  'ACebvfrZOfM', 'VGjn7ur58Lw', 'meUr8fjy8lQ', '5HVPeux24WU', 
  'D4XTefP3Lsc', 'UAmKyyZ-b9E', 'LpGpwhORWr0'
];

interface WaitlistPageProps {
  onNavigate: (page: 'waitlist' | 'enter-code' | 'login' | 'app' | 'privacy' | 'terms') => void;
}

export default function WaitlistPage({ onNavigate }: WaitlistPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 7 sections total -> max scroll is 6 * 100vh
    if (latest < 0.08) setActiveSection(0);
    else if (latest < 0.25) setActiveSection(1);
    else if (latest < 0.41) setActiveSection(2);
    else if (latest < 0.58) setActiveSection(3);
    else if (latest < 0.75) setActiveSection(4);
    else if (latest < 0.91) setActiveSection(5);
    else setActiveSection(6);
  });

  const scrollToSection = (index: number) => {
    if (containerRef.current) {
       const height = window.innerHeight;
       containerRef.current.scrollTo({
         top: index * height,
         behavior: 'smooth'
       });
    }
  };

  useEffect(() => {
    document.body.style.scrollbarWidth = 'none';
    const style = document.createElement('style');
    style.id = 'hide-scrollbars';
    style.innerHTML = `::-webkit-scrollbar { display: none; }`;
    document.head.appendChild(style);
    
    return () => {
      document.body.style.scrollbarWidth = '';
      const styleEl = document.getElementById('hide-scrollbars');
      if (styleEl) styleEl.remove();
    };
  }, []);

  return (
    <div ref={containerRef} className="h-screen w-full bg-black relative snap-y snap-mandatory overflow-y-auto overflow-x-hidden">
      {/* Floating Global Menu - Fixed globally */}
      <motion.div 
        className="fixed left-6 md:left-12 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center space-y-7 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <button onClick={() => scrollToSection(0)} className={`transition-opacity duration-300 ${activeSection === 0 ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button onClick={() => scrollToSection(1)} className={`transition-opacity duration-300 ${activeSection === 1 ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </button>
        <button onClick={() => scrollToSection(2)} className={`transition-opacity duration-300 ${activeSection === 2 ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 12 12 17 22 12"/>
            <polyline points="2 17 12 22 22 17"/>
          </svg>
        </button>
        <button onClick={() => scrollToSection(3)} className={`transition-opacity duration-300 ${activeSection === 3 ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </button>
        <button onClick={() => scrollToSection(4)} className={`transition-opacity duration-300 ${activeSection === 4 ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="2" y1="7" x2="7" y2="7"/>
            <line x1="2" y1="17" x2="7" y2="17"/>
            <line x1="17" y1="17" x2="22" y2="17"/>
            <line x1="17" y1="7" x2="22" y2="7"/>
          </svg>
        </button>
        <button onClick={() => scrollToSection(5)} className={`transition-opacity duration-300 ${activeSection === 5 ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
        <button onClick={() => scrollToSection(6)} className={`transition-opacity duration-300 ${activeSection === 6 ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}>
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
        </button>
      </motion.div>

      {/* Hero Section */}
      <section className="snap-start snap-always w-full h-[100svh] relative flex items-center justify-center flex-col shrink-0 overflow-hidden">
        {/* Background Image - Absolute */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img 
            src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780515333/ChatGPT_Image_Jun_3_2026_12_29_00_PM_lah29i.png" 
            alt="Atmos aesthetic visual background" 
            className="w-full h-full object-cover"
          />
          {/* Smooth black gradient fade at bottom */}
          <div className="absolute -bottom-1 left-0 right-0 h-[50vh] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
          <div className="absolute -bottom-1 left-0 right-0 h-[25vh] bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>

        {/* Logo - absolute (White) */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center pointer-events-none">
          <img 
            src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780066101/ChatGPT_Image_May_29_2026_07_42_50_AM_1_tptgxp.png" 
            alt="Atmos design" 
            className="w-12 h-12 object-contain brightness-0 invert" 
          />
        </div>

        <div className="absolute top-8 right-8 z-10">
          <button 
            onClick={() => onNavigate('login')}
            className="text-white font-medium text-lg hover:text-gray-200 transition-colors"
          >
            Log in
          </button>
        </div>

        <svg className="hidden">
          <filter id="glass-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        {/* Waitlist Form */}
        <motion.div 
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 w-full max-w-[500px] px-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 20 }}
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const btn = (e.target as HTMLFormElement).querySelector('button');
              if (btn) {
                 btn.innerHTML = '<span class="text-xs font-bold w-12 text-center text-green-600 block">JOINED!</span>';
                 setTimeout(() => {
                   if (btn) btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>';
                 }, 3000);
              }
            }}
            className="relative w-full rounded-full p-2 flex items-center overflow-hidden transition-all duration-[400ms] hover:scale-[1.02]"
          >
            {/* Liquid Glass Layers */}
            <div className="absolute inset-0 z-0 backdrop-blur-[3px]" style={{ filter: 'url(#glass-distortion)' }} />
            <div className="absolute inset-0 z-[1] bg-[#111]/80 rounded-full border border-white/10" />
            <div className="absolute inset-0 z-[2] pointer-events-none" />
            
            <div className="relative z-10 flex w-full items-center gap-2">
              <div className="flex-shrink-0 pl-3 pr-1 flex items-center justify-center">
                <img 
                  src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780066101/ChatGPT_Image_May_29_2026_07_42_50_AM_1_tptgxp.png" 
                  alt="Atmos logo" 
                  className="w-9 h-9 object-contain brightness-0 invert"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <input 
                  type="email"
                  placeholder="Join waitlist..."
                  className="w-full h-[52px] bg-transparent rounded-full px-5 text-white placeholder:text-gray-400 focus:outline-none font-medium text-[15px]"
                />
              </div>
              <button 
                type="submit"
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors mr-1"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5" />
                  <path d="M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </form>
          <div className="flex justify-center mt-4">
            <button onClick={() => onNavigate('enter-code')} className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Have an invite code?
            </button>
          </div>
        </motion.div>

        {/* Trusted By Marquee */}
        <div className="absolute bottom-8 left-0 right-0 w-full overflow-hidden flex whitespace-nowrap z-20 opacity-40 pointer-events-none select-none [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <motion.div 
            className="flex gap-24 items-center shrink-0 pr-24"
            animate={{ x: [0, "-100%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
          >
            <img src="https://logos-world.net/wp-content/uploads/2024/10/Vercel-Logo.png" alt="Vercel" className="h-[56px] md:h-[64px] object-contain brightness-0 invert opacity-80" />
            <img src="https://1000logos.net/wp-content/uploads/2021/05/Google-logo.png" alt="Google" className="h-[56px] md:h-[64px] object-contain brightness-0 invert opacity-80" />
            <img src="https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/kimi-text.png" alt="Kimi" className="h-[36px] md:h-[44px] object-contain brightness-0 invert opacity-80" />
            <img src="https://www.remotion.dev/img/new-logo.png" alt="Remotion" className="h-[36px] md:h-[44px] object-contain brightness-0 invert opacity-80" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f0/ElevenLabs_logo.png" alt="ElevenLabs" className="h-[28px] md:h-[34px] object-contain brightness-0 invert opacity-80" />
          </motion.div>
          <motion.div 
            className="flex gap-24 items-center shrink-0 pr-24"
            animate={{ x: [0, "-100%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
          >
            <img src="https://logos-world.net/wp-content/uploads/2024/10/Vercel-Logo.png" alt="Vercel" className="h-[56px] md:h-[64px] object-contain brightness-0 invert opacity-80" />
            <img src="https://1000logos.net/wp-content/uploads/2021/05/Google-logo.png" alt="Google" className="h-[56px] md:h-[64px] object-contain brightness-0 invert opacity-80" />
            <img src="https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/kimi-text.png" alt="Kimi" className="h-[36px] md:h-[44px] object-contain brightness-0 invert opacity-80" />
            <img src="https://www.remotion.dev/img/new-logo.png" alt="Remotion" className="h-[36px] md:h-[44px] object-contain brightness-0 invert opacity-80" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f0/ElevenLabs_logo.png" alt="ElevenLabs" className="h-[28px] md:h-[34px] object-contain brightness-0 invert opacity-80" />
          </motion.div>
        </div>
      </section>

      {/* Carousel Image 1 */}
      <section className="snap-start snap-always w-full h-[100svh] flex flex-col items-center justify-center bg-black shrink-0 px-6 md:px-24 object-cover relative pt-12">
        <TypewriterText text1="Design " text2="faster" />
        <motion.div 
          className="w-full max-w-7xl aspect-video superellipse-box overflow-hidden bg-[#18181b]"
          whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.4 }}
        >
          <img 
            src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780711400/make_text_allingned_centured_in_202606051901_uugpuc.jpg" 
            alt="Design at the speed of thought" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>

      {/* Carousel Image 2 */}
      <section className="snap-start snap-always w-full h-[100svh] flex flex-col items-center justify-center bg-black shrink-0 px-6 md:px-24 relative pt-12">
        <TypewriterText text1="Who is " text2="this for?" />
        <motion.div 
          className="w-full max-w-7xl aspect-video superellipse-box overflow-hidden bg-[#18181b]"
          whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.4 }}
        >
          <img 
            src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780716829/Built_for_anyone._Designed_for_202606052031_njd4bf.jpg" 
            alt="Built for anyone. Designed for everything." 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>

      {/* Carousel Image 3 */}
      <section className="snap-start snap-always w-full h-[100svh] flex flex-col items-center justify-center bg-black shrink-0 px-6 md:px-24 relative pt-12">
        <TypewriterText text1="Why choose " text2="Atmos?" />
        <motion.div 
          className="w-full max-w-7xl aspect-video superellipse-box overflow-hidden bg-[#18181b]"
          whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.4 }}
        >
           <img 
            src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780716781/Hills_with_blue_tint_202606052031_q7a8st.jpg" 
            alt="Powerful features for stunning visual creation" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>

      {/* Video Carousel Section */}
      <section className="snap-start snap-always w-full h-[100svh] flex flex-col items-center justify-center bg-black shrink-0 relative py-16">
        <div className="w-full text-center px-4 mb-4">
          <TypewriterText text1="Create the next " text2="masterpiece." />
        </div>
        
        {/* Carousel Container */}
        <div className="w-full relative flex flex-col gap-6 w-full lg:-mx-12 xl:-mx-24 max-w-[140vw] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] overflow-hidden">
          {/* Row 1 */}
          <div className="flex overflow-hidden w-full whitespace-nowrap">
            <motion.div
              className="flex gap-6 items-center shrink-0 px-3 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 80 }}
            >
              {[...ROW1_VIDEOS, ...ROW1_VIDEOS].map((id, index) => (
                <div key={index} className="w-[300px] md:w-[400px] lg:w-[500px] aspect-video rounded-[24px] overflow-hidden bg-[#18181b] shrink-0 border border-white/5 shadow-2xl relative shadow-black/80">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${id}?controls=1&modestbranding=1&rel=0&playsinline=1`}
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                    className="w-full h-full pointer-events-auto"
                    loading="lazy"
                  ></iframe>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Row 2 */}
          <div className="flex overflow-hidden w-full whitespace-nowrap">
            <motion.div
              className="flex gap-6 items-center shrink-0 px-3 w-max"
              animate={{ x: ["-50%", "0%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 80 }}
            >
              {[...ROW2_VIDEOS, ...ROW2_VIDEOS].map((id, index) => (
                <div key={index} className="w-[300px] md:w-[400px] lg:w-[500px] aspect-video rounded-[24px] overflow-hidden bg-[#18181b] shrink-0 border border-white/5 shadow-2xl relative shadow-black/80">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${id}?controls=1&modestbranding=1&rel=0&playsinline=1`}
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                    className="w-full h-full pointer-events-auto"
                    loading="lazy"
                  ></iframe>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section className="snap-start snap-always w-full h-[100svh] flex flex-col items-center justify-center bg-black shrink-0 px-6 md:px-24 justify-center relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}
          className="w-full max-w-4xl bg-[#262626] rounded-3xl p-10 md:p-16 flex flex-col items-start justify-center text-left relative shadow-2xl overflow-hidden"
        >
          {/* Quote mark shape */}
          <div className="absolute top-8 left-8 md:top-12 md:left-12 opacity-[0.03]">
            <Quote className="w-32 h-32 text-white fill-white" />
          </div>

          <h3 className="text-2xl md:text-4xl lg:text-5xl text-white font-medium mb-12 leading-[1.3] tracking-tight relative z-10 w-full pt-10 md:pt-16">
            "Design is not just what it looks like and feels like. Design is how it works."
          </h3>
          
          <div className="flex w-full items-end justify-end mt-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-white font-medium text-lg">Steve Jobs</span>
                <span className="text-gray-400 text-sm">Co-founder, Apple Inc.</span>
              </div>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/f/f5/Steve_Jobs_Headshot_2010-CROP2.jpg" 
                alt="Steve Jobs" 
                className="w-14 h-14 rounded-full object-cover grayscale border border-white/20"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="snap-start snap-always w-full min-h-[100svh] h-auto flex flex-col items-center justify-center bg-black shrink-0 px-8 py-24 relative">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-16 lg:gap-24 items-start pl-16 md:pl-24 lg:pl-0 pt-24">
          {/* Left Side */}
          <div className="w-full md:w-[35%] space-y-24 flex-shrink-0 text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false }}
              className="text-[40px] md:text-[44px] lg:text-[52px] font-sans font-medium text-white leading-[1.1] tracking-tight"
            >
              Frequently Asked<br/>Questions (FAQ)
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: false }}
              className="text-gray-400 text-[15px] leading-relaxed max-w-[280px]"
            >
              If you have any feedback or need any<br/>
              support, please contact us at<br/>
              <span className="text-white border-b border-white/20 hover:border-white transition-colors cursor-pointer">support@mail.atmos.ai</span>.
            </motion.div>
          </div>

          {/* Right Side */}
          <div className="w-full md:w-[65%] flex flex-col pt-2">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: false }}
                className="border-b border-white/10 py-6 flex flex-col text-left"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex items-start justify-between w-full text-left focus:outline-none group"
                >
                  <span className="text-[17px] text-white font-normal leading-snug pr-8 group-hover:text-gray-300 transition-colors">{faq.question}</span>
                  <span className="flex-shrink-0 ml-4 text-white font-light text-2xl leading-none pt-0.5 group-hover:text-gray-300 transition-colors">
                    {openFaq === idx ? '–' : '+'}
                  </span>
                </button>
                
                {openFaq === idx && faq.answer && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 pb-2 text-gray-400 leading-[1.6] text-[15px] max-w-3xl pr-8"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 w-full py-6 flex flex-col md:flex-row justify-between items-center px-8 text-sm text-gray-400 bg-black border-t border-white/10">
          <div>© {new Date().getFullYear()} Atmos AI, Inc. All rights reserved.</div>
          <div className="flex space-x-6 mt-4 md:mt-0 text-gray-400">
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </section>
    </div>
  );
}
