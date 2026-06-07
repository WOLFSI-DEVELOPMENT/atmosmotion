import React, { useState } from 'react';
import { PlayIcon as Play, Search01Icon as Search, ArrowMoveDownRightIcon, PlusSignIcon } from 'hugeicons-react';
import { motion } from 'motion/react';

export const SKILLS_DATA = [
  { id: 'skeletal-rigging', title: 'Skeletal Rigging', image: 'https://i.ibb.co/ZR2tXn4K/Skeletal-Rigging-coral-stickers-202606051843.jpg', description: 'Advanced bone rigging for 2D characters' },
  { id: 'film-grain', title: 'Film Grain', image: 'https://i.ibb.co/sdgzCqmc/Change-text-film-grain-202606051843.jpg', description: 'Cinematic noise and grain overlays' },
  { id: 'motion-blur', title: 'Motion Blur', image: 'https://i.ibb.co/M5cxHCRh/Change-text-motion-blur-202606051843.jpg', description: 'Realistic simulated camera blur' },
  { id: 'motion-curves', title: 'Atmos Motion Curves', image: 'https://i.ibb.co/pBp0WBhM/Atmos-Motion-Curves-stickers-202606051843.jpg', description: 'Custom cubic bezier easing presets' },
  { id: 'smart-transitions', title: 'Smart Transitions', image: 'https://i.ibb.co/twxZzMnS/Change-text-Smart-Transitions-da-202606051843.jpg', description: 'AI-driven contextual cuts and fades' },
  { id: 'particle-systems', title: 'Particle Systems', image: 'https://i.ibb.co/LDwCQm6C/Stickers-with-yellow-background-202606051843.jpg', description: 'Dynamic physics-based emitters' },
  { id: 'shape-morphing', title: 'Shape Morphing', image: 'https://i.ibb.co/p5sgpP1/Shape-morphing-mauve-dusty-rose-202606051843.jpg', description: 'Seamless path interpolation' },
  { id: 'typography-animation', title: 'Typography Animation', image: 'https://i.ibb.co/HpHS7Sx3/Typography-animation-pink-sticker-202606051843.jpg', description: 'Complex text reveal behaviors' },
  { id: 'easing-functions', title: 'Easing Functions', image: 'https://i.ibb.co/NdVqSZgk/Change-text-Easing-Functions-202606051843.jpg', description: 'Mathematical transition curves' },
  { id: 'timing-control', title: 'Timing Control', image: 'https://i.ibb.co/hRvD9PpV/Change-text-Timing-Control-202606051843.jpg', description: 'Precise frame-level sequencing' },
  { id: 'keyframe-animation', title: 'Keyframe Animation', image: 'https://i.ibb.co/GQsH2511/Keyframe-Animation-peach-backgro-202606051843.jpg', description: 'Classic point-to-point tweening' },
];

export const DISCOVER_TEMPLATES = [
  {
    id: 'kinetic-typography',
    title: 'Kinetic Typography',
    image: 'https://i.ibb.co/1w32HDW/Change-text-Kinetic-Typography-202606050813.jpg',
    description: 'Animate bold, fast-paced text sequences',
    prompt: 'Create a kinetic typography promo with bold, fast-paced text animations synchronized to a rhythmic beat.'
  },
  {
    id: 'product-showcase',
    title: '3D Product Showcase',
    image: 'https://i.ibb.co/fd9GPdM8/Change-text-and-background-color-202606050813.jpg',
    description: 'Animate sleek 3D product shots',
    prompt: 'Animate a sleek 3D tech product showcase with rotating camera angles, floating specs, and clean glassmorphism UI elements.'
  },
  {
    id: 'data-vis',
    title: 'Data Visualization',
    image: 'https://i.ibb.co/ynhZgVfN/Change-background-color-orange-202606050813.jpg',
    description: 'Animate dynamic charts & graphs',
    prompt: 'Animate a dynamic data visualization chart with glowing lines, counting numbers, and a dark tech aesthetic.'
  },
  {
    id: 'social-promo',
    title: 'Social Media Promo',
    image: 'https://i.ibb.co/Y49ztm0X/Change-text-and-color-background-202606050813.jpg',
    description: 'Generate vibrant social ads',
    prompt: 'Generate a vibrant Social Media story ad for a fashion brand, featuring split-screen transitions and snappy text reveals.'
  },
  {
    id: 'cyber-glitch',
    title: 'Cyber Glitch',
    image: 'https://i.ibb.co/B5K4Xd66/Change-text-color-darker-blue-202606050813.jpg',
    description: 'Create edgy, glitchy intros',
    prompt: 'Create an edgy cyber-glitch intro sequence with chromatic aberration, digital noise overlays, and neon text.'
  },
  {
    id: 'fluid-transitions',
    title: 'Fluid Transitions',
    image: 'https://i.ibb.co/1Y9x02hh/Change-text-color-to-pink-202606050813.jpg',
    description: 'Create smooth liquid transitions',
    prompt: 'Animate a smooth, fluid liquid transition effect moving from a solid color block into a dynamic scene.'
  },
  {
    id: 'ui-walkthrough',
    title: 'App UI Walkthrough',
    image: 'https://i.ibb.co/cKSHLmFm/Change-text-color-to-yellow-202606050813.jpg',
    description: 'Animate mobile app interfaces',
    prompt: 'Create an animated UI walkthrough for a mobile app showing scrolling lists, button taps, and screen transitions.'
  },
  {
    id: 'logo-assembly',
    title: 'Logo Assembly',
    image: 'https://i.ibb.co/0RthdSkZ/Change-logo-text-color-purple-202606050814.jpg',
    description: 'Animate elegant logo reveals',
    prompt: 'Design a clean, modern logo reveal where geometric shapes elegantly assemble into the brand mark.'
  },
  {
    id: 'isometric-worlds',
    title: 'Isometric Worlds',
    image: 'https://i.ibb.co/6Jbn3B5L/Change-text-color-peach-pink-202606050814.jpg',
    description: 'Animate 3D isometric environments',
    prompt: 'Design an isometric 3D city animation with moving cars, glowing windows, and a day-to-night lighting shift.'
  }
];

const CATEGORIES = [
  { id: 'community', name: 'Community', color: 'from-indigo-400 to-indigo-500' },
  { id: 'templates', name: 'Templates', color: 'from-fuchsia-400 to-fuchsia-500' },
  { id: 'ui', name: 'UI / UX', color: 'from-emerald-400 to-emerald-500' },
  { id: 'abstract', name: 'Abstract', color: 'from-amber-400 to-amber-500' },
  { id: 'social', name: 'Social Media', color: 'from-cyan-400 to-cyan-500' },
  { id: 'logos', name: 'Logos', color: 'from-rose-400 to-rose-500' },
  { id: 'data', name: 'Data Viz', color: 'from-violet-400 to-violet-500' },
  { id: 'typography', name: 'Typography', color: 'from-sky-400 to-sky-500' }
];

const PREMADE_ANIMATIONS = [
  { id: '1', prompt: 'Clean minimal app logo reveal with subtle glow', durationInFrames: 150, color: 'from-blue-400 to-indigo-500' },
  { id: '2', prompt: 'Dynamic typography kinetic text animation', durationInFrames: 300, color: 'from-emerald-400 to-teal-500' },
  { id: '3', prompt: 'Smooth liquid gradient background loop', durationInFrames: 450, color: 'from-amber-400 to-orange-500' },
  { id: '4', prompt: 'AI generating loading indicator pulse', durationInFrames: 240, color: 'from-fuchsia-400 to-pink-500' },
  { id: '5', prompt: 'Terminal auto-typing text animation', durationInFrames: 120, color: 'from-sky-400 to-blue-500' },
  { id: '6', prompt: 'Retro black outline green battery charging', durationInFrames: 300, color: 'from-violet-400 to-purple-500' },
  { id: '7', prompt: 'Simple loading spinner with bouncy colorful dots', durationInFrames: 90, color: 'from-yellow-400 to-amber-500' },
  { id: '8', prompt: 'Podcast audio visualizer waveform bouncing to music', durationInFrames: 600, color: 'from-rose-400 to-red-500' },
  { id: '9', prompt: 'Instagram story swipe up arrow smooth animation', durationInFrames: 150, color: 'from-cyan-400 to-sky-500' },
  { id: '10', prompt: 'Clean corporate chart bar graph growing upwards', durationInFrames: 180, color: 'from-green-400 to-emerald-500' },
];

function CategoryAnimation({ id }: { id: string }) {
  switch(id) {
    case 'community':
      return (
         <motion.div className="flex items-center justify-center h-full w-full gap-1 p-2" animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <div className="w-4 h-4 bg-indigo-400 rounded-full" />
            <div className="w-4 h-4 bg-indigo-500 rounded-full -ml-2 mix-blend-multiply" />
         </motion.div>
      );
    case 'templates':
      return (
         <motion.div className="grid grid-cols-2 gap-1 p-3 w-full h-full" animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
            <div className="bg-fuchsia-400 rounded-sm" />
            <div className="bg-fuchsia-300 rounded-sm" />
            <div className="bg-fuchsia-500 rounded-sm" />
            <div className="bg-fuchsia-400 rounded-sm" />
         </motion.div>
      );
    case 'ui':
      return (
         <div className="flex flex-col gap-1 p-2 w-full h-full justify-center">
             <motion.div animate={{ width: ['20%', '80%', '20%'] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="h-2 bg-emerald-400 rounded-full" />
             <motion.div animate={{ width: ['80%', '20%', '80%'] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="h-2 bg-emerald-500 rounded-full" />
         </div>
      );
    case 'abstract':
      return (
         <div className="relative w-full h-full flex items-center justify-center p-2">
            <motion.div animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-8 h-8 rounded-lg border-2 border-amber-400 absolute" />
            <motion.div animate={{ rotate: -360, scale: [1.2, 0.8, 1.2] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-8 h-8 rounded-full border-2 border-amber-500 absolute" />
         </div>
      );
    case 'social':
       return (
          <div className="flex items-center justify-center h-full w-full p-2">
             <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center text-white">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-5h2v5zm-1-6.5c-0.83 0-1.5-0.67-1.5-1.5S9.17 6.5 10 6.5s1.5 0.67 1.5 1.5S10.83 9.5 10 9.5zm6 6h-2v-3.5c0-0.83-0.67-1.5-1.5-1.5s-1.5 0.67-1.5 1.5V16h-2v-5h2v1.1c0.41-0.65 1.14-1.1 2-1.1 1.66 0 3 1.34 3 3V16z"/></svg>
             </motion.div>
          </div>
       );
    case 'logos':
       return (
          <div className="flex items-center justify-center h-full w-full p-2">
             <motion.div animate={{ rotateY: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-8 h-8 bg-rose-400 font-bold text-white flex items-center justify-center rounded-md text-sm">
                L
             </motion.div>
          </div>
       );
    case 'data':
       return (
          <div className="flex items-end justify-center gap-1 h-full w-full p-2 pb-4">
             <motion.div animate={{ height: ['20%', '60%', '20%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="w-2 bg-violet-400 rounded-t-sm" />
             <motion.div animate={{ height: ['40%', '80%', '40%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-2 bg-violet-500 rounded-t-sm" />
             <motion.div animate={{ height: ['60%', '30%', '60%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-2 bg-violet-600 rounded-t-sm" />
          </div>
       );
    case 'typography':
       return (
          <div className="flex flex-col items-center justify-center h-full w-full p-2 overflow-hidden relative">
             <motion.div animate={{ x: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="font-serif font-black text-2xl text-sky-400 opacity-50 absolute left-4">A</motion.div>
             <motion.div animate={{ x: [5, -5, 5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="font-serif font-black text-3xl text-sky-500 absolute z-10">A</motion.div>
          </div>
       );
    default:
      return null;
  }
}

function TemplateAnimationPreview({ id }: { id: string }) {
  switch(id) {
    case '1':
      return (
        <motion.div
           animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           className="w-12 h-12 bg-blue-500 rounded-xl"
        />
      );
    case '2':
      return (
        <div className="flex flex-col items-center justify-center gap-1 overflow-hidden w-full h-full">
           <motion.div animate={{ x: [-50, 50, -50] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="text-emerald-500 font-bold text-xl uppercase tracking-tighter whitespace-nowrap">KINETIC KINETIC</motion.div>
           <motion.div animate={{ x: [50, -50, 50] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="text-teal-500 font-bold text-xl uppercase tracking-tighter whitespace-nowrap">TYPOGRAPHY ACTION</motion.div>
        </div>
      );
    case '3':
       return (
         <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="w-[150%] h-[150%] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-full blur-[20px] opacity-40 mix-blend-multiply"
         />
       );
    case '4':
       return (
          <motion.div
             animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5], rotate: [0, 90, 180] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="w-12 h-12 flex items-center justify-center text-pink-500"
          >
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
               <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
             </svg>
          </motion.div>
       );
    case '5':
       return (
          <div className="flex items-center text-gray-900 font-mono font-bold text-lg">
             hello
             <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-2 h-5 bg-blue-500 ml-1 inline-block"
             />
          </div>
       );
    case '6':
       return (
          <div className="flex items-center justify-center">
             <div className="w-16 h-8 border-4 border-gray-900 rounded-sm p-0.5 flex">
                <motion.div
                   animate={{ width: ['0%', '100%', '0%'] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "linear", times: [0, 0.9, 1] }}
                   className="h-full bg-green-500"
                />
             </div>
             <div className="w-2 h-4 bg-gray-900 rounded-r-sm" />
          </div>
       );
    case '7':
       return (
          <div className="flex gap-2">
             <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="w-4 h-4 bg-yellow-400 rounded-full" />
             <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} className="w-4 h-4 bg-amber-500 rounded-full" />
             <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-4 h-4 bg-orange-500 rounded-full" />
          </div>
       );
    case '8':
       return (
          <div className="flex items-end justify-center h-32 w-full px-4 gap-1">
             <motion.div animate={{ height: ['20%', '80%', '20%'] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }} className="w-full bg-rose-400 rounded-t-sm" />
             <motion.div animate={{ height: ['40%', '100%', '40%'] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-full bg-red-400 rounded-t-sm" />
             <motion.div animate={{ height: ['60%', '30%', '60%'] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }} className="w-full bg-rose-500 rounded-t-sm" />
             <motion.div animate={{ height: ['30%', '70%', '30%'] }} transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }} className="w-full bg-red-500 rounded-t-sm" />
             <motion.div animate={{ height: ['80%', '40%', '80%'] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }} className="w-full bg-rose-600 rounded-t-sm" />
          </div>
       );
    case '9':
       return (
          <div className="flex flex-col items-center justify-center">
             <motion.div animate={{ y: [10, -10, 10], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500">
                  <path d="m18 15-6-6-6 6"/>
               </svg>
             </motion.div>
             <motion.div animate={{ y: [10, -10, 10], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}>
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500 -mt-6">
                  <path d="m18 15-6-6-6 6"/>
               </svg>
             </motion.div>
          </div>
       );
    case '10':
       return (
          <div className="flex items-end justify-center gap-2 h-24 w-full px-4 border-b border-gray-300 pb-1">
             <motion.div animate={{ height: ['0%', '40%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 1] }} className="w-1/3 bg-green-400 rounded-t-sm" />
             <motion.div animate={{ height: ['0%', '70%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 1], delay: 0.2 }} className="w-1/3 bg-emerald-500 rounded-t-sm" />
             <motion.div animate={{ height: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 1], delay: 0.4 }} className="w-1/3 bg-teal-600 rounded-t-sm" />
          </div>
       );
    default:
       return null;
  }
}

const getTemplateCode = (id: string, prompt: string) => {
  if (id === '1') {
    return `import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
export default function RemotionVideo() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 30], [0.8, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ opacity, transform: \`scale(\${scale})\`, fontSize: 100, fontWeight: 'bold', color: '#4F46E5', textShadow: '0 0 40px rgba(79, 70, 229, 0.5)' }}>LOGO</div>
    </AbsoluteFill>
  );
}`;
  }
  if (id === '2') {
    return `import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export default function RemotionVideo() {
  const frame = useCurrentFrame();
  const x1 = interpolate(frame, [0, 150, 300], [-500, 500, -500], { extrapolateRight: 'clamp' });
  const x2 = interpolate(frame, [0, 150, 300], [500, -500, 500], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <div style={{ transform: \`translateX(\${x1}px)\`, fontSize: 120, fontWeight: 'bold', color: '#10b981', whiteSpace: 'nowrap' }}>KINETIC TYPOGRAPHY</div>
      <div style={{ transform: \`translateX(\${x2}px)\`, fontSize: 120, fontWeight: 'bold', color: '#14b8a6', whiteSpace: 'nowrap' }}>DYNAMIC ACTION</div>
    </AbsoluteFill>
  );
}`;
  }
  if (id === '3') {
    return `import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export default function RemotionVideo() {
  const frame = useCurrentFrame();
  const rotate = interpolate(frame, [0, 450], [0, 360]);
  return (
    <AbsoluteFill style={{ backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '150%', height: '150%', background: 'linear-gradient(to bottom right, #fbbf24, #f97316, #f43f5e)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.5, transform: \`rotate(\${rotate}deg)\` }} />
    </AbsoluteFill>
  );
}`;
  }
  if (id === '4') {
    return `import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export default function RemotionVideo() {
  const frame = useCurrentFrame();
  const scale = interpolate(frame % 60, [0, 30, 60], [1, 1.2, 1]);
  const opacity = interpolate(frame % 60, [0, 30, 60], [0.5, 1, 0.5]);
  const rotate = interpolate(frame % 60, [0, 30, 60], [0, 90, 180]);
  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ transform: \`scale(\${scale}) rotate(\${rotate}deg)\`, opacity, color: '#ec4899', width: 200, height: 200 }}>
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
        </svg>
      </div>
    </AbsoluteFill>
  );
}`;
  }
  if (id === '5') {
    return `import { AbsoluteFill, useCurrentFrame } from 'remotion';
export default function RemotionVideo() {
  const frame = useCurrentFrame();
  const text = "hello";
  const visibleChars = Math.min(text.length, Math.floor(frame / 10));
  const displayedText = text.slice(0, visibleChars);
  const cursorOpacity = Math.floor(frame / 15) % 2 === 0 ? 1 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 100, fontFamily: 'monospace', fontWeight: 'bold', color: '#111827' }}>
        {displayedText}
        <div style={{ width: 40, height: 100, backgroundColor: '#3b82f6', marginLeft: 20, opacity: cursorOpacity }} />
      </div>
    </AbsoluteFill>
  );
}`;
  }
  if (id === '6') {
    return `import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export default function RemotionVideo() {
  const frame = useCurrentFrame();
  const progress = interpolate(frame % 90, [0, 80, 90], [0, 100, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 400, height: 200, border: '20px solid #111827', borderRadius: 20, padding: 10, display: 'flex' }}>
          <div style={{ width: \`\${progress}%\`, height: '100%', backgroundColor: '#22c55e', transition: 'width 0.1s' }} />
        </div>
        <div style={{ width: 40, height: 100, backgroundColor: '#111827', borderTopRightRadius: 20, borderBottomRightRadius: 20 }} />
      </div>
    </AbsoluteFill>
  );
}`;
  }
  if (id === '7') {
    return `import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export default function RemotionVideo() {
  const frame = useCurrentFrame();
  const y1 = interpolate(frame % 30, [0, 15, 30], [0, -50, 0]);
  const f2 = frame + 25;
  const y2 = interpolate(f2 % 30, [0, 15, 30], [0, -50, 0]);
  const f3 = frame + 20;
  const y3 = interpolate(f3 % 30, [0, 15, 30], [0, -50, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 40 }}>
      <div style={{ width: 80, height: 80, backgroundColor: '#facc15', borderRadius: '50%', transform: \`translateY(\${y1}px)\` }} />
      <div style={{ width: 80, height: 80, backgroundColor: '#f59e0b', borderRadius: '50%', transform: \`translateY(\${y2}px)\` }} />
      <div style={{ width: 80, height: 80, backgroundColor: '#ea580c', borderRadius: '50%', transform: \`translateY(\${y3}px)\` }} />
    </AbsoluteFill>
  );
}`;
  }
  if (id === '8') {
    return `import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export default function RemotionVideo() {
  const frame = useCurrentFrame();
  const h1 = interpolate(frame % 20, [0, 10, 20], [20, 80, 20]);
  const h2 = interpolate(frame % 25, [0, 12.5, 25], [40, 100, 40]);
  const h3 = interpolate(frame % 15, [0, 7.5, 15], [60, 30, 60]);
  const h4 = interpolate(frame % 22, [0, 11, 22], [30, 70, 30]);
  const h5 = interpolate(frame % 28, [0, 14, 28], [80, 40, 80]);
  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'flex-end', flexDirection: 'row', gap: 20, padding: 100, paddingBottom: 200 }}>
      <div style={{ width: '100%', height: \`\${h1}%\`, backgroundColor: '#fb7185', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
      <div style={{ width: '100%', height: \`\${h2}%\`, backgroundColor: '#f87171', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
      <div style={{ width: '100%', height: \`\${h3}%\`, backgroundColor: '#e11d48', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
      <div style={{ width: '100%', height: \`\${h4}%\`, backgroundColor: '#ef4444', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
      <div style={{ width: '100%', height: \`\${h5}%\`, backgroundColor: '#be123c', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
    </AbsoluteFill>
  );
}`;
  }
  if (id === '9') {
    return `import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export default function RemotionVideo() {
  const frame = useCurrentFrame();
  const y = interpolate(frame % 60, [0, 30, 60], [50, -50, 50]);
  const opacity = interpolate(frame % 60, [0, 30, 60], [0, 1, 0]);
  const f2 = frame + 50;
  const y2 = interpolate(f2 % 60, [0, 30, 60], [50, -50, 50]);
  const opacity2 = interpolate(f2 % 60, [0, 30, 60], [0, 1, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ transform: \`translateY(\${y}px)\`, opacity, color: '#06b6d4', width: 160, height: 160 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </div>
      <div style={{ transform: \`translateY(\${y2}px)\`, opacity: opacity2, color: '#06b6d4', width: 160, height: 160, marginTop: -80 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </div>
    </AbsoluteFill>
  );
}`;
  }

  return `import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export default function RemotionVideo() {
  const frame = useCurrentFrame();
  const h1 = interpolate(frame, [0, 60, 180], [0, 40, 0], { extrapolateLeft: 'clamp' });
  const h2 = interpolate(frame, [15, 75, 180], [0, 70, 0], { extrapolateLeft: 'clamp' });
  const h3 = interpolate(frame, [30, 90, 180], [0, 100, 0], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'flex-end', flexDirection: 'row', gap: 40, padding: 100, paddingBottom: 200, borderBottom: '10px solid #cbd5e1' }}>
      <div style={{ width: '100%', height: \`\${h1}%\`, backgroundColor: '#4ade80', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
      <div style={{ width: '100%', height: \`\${h2}%\`, backgroundColor: '#10b981', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
      <div style={{ width: '100%', height: \`\${h3}%\`, backgroundColor: '#0d9488', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
    </AbsoluteFill>
  );
}`;
};

interface DiscoverProps {
  onOpenTemplate?: (code: string, prompt: string, durationInFrames: number) => void;
}

export default function DiscoverInterface({ onOpenTemplate }: DiscoverProps) {
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto scrollbar-none pt-12 pb-24 px-8">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-10">
        {/* Header & Search */}
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full mb-1">Coming Soon</div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Discover</h1>
            <p className="text-gray-500 font-medium text-[15px]">Find inspiration, templates, and animations from the community. Community publishing is launching soon!</p>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-[22px] w-[22px] text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full bg-[#f0f0f0] border-none rounded-full py-[18px] pl-14 pr-6 text-[15px] font-medium text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-shadow"
              placeholder="Search templates and animations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto scrollbar-none gap-5 pb-4 -mx-8 px-8 snap-x">
          {CATEGORIES.map(category => (
            <div 
              key={category.id} 
              className="flex-shrink-0 w-[180px] h-[110px] rounded-[20px] bg-[#f5f5f5] p-4 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all snap-start group"
            >
              <h3 className="text-gray-900 font-bold text-lg relative z-10 tracking-tight">{category.name}</h3>
              {/* Visual square coming from right bottom corner */}
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-gray-200 rounded-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 overflow-hidden flex items-center justify-center">
                 <CategoryAnimation id={category.id} />
              </div>
            </div>
          ))}
        </div>

        {/* Prompts */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Prompts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {DISCOVER_TEMPLATES.map((template, idx) => (
              <motion.div 
                key={template.id} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex flex-col gap-3 group cursor-pointer"
                onClick={() => {
                  if (onOpenTemplate) {
                    onOpenTemplate(`import { AbsoluteFill } from 'remotion';\nexport default function RemotionVideo() {\n  return (\n    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>\n      <h1 style={{ fontSize: 80, fontFamily: 'sans-serif' }}>Loading Template...</h1>\n    </AbsoluteFill>\n  );\n}`, template.prompt, 300);
                  }
                }}
              >
                {/* Visual Card Image */}
                <div className="w-full aspect-[1.8] rounded-[24px] relative overflow-hidden transition-transform group-hover:scale-[1.02] bg-gray-100 shadow-sm">
                  <img src={template.image} alt={template.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                
                {/* Text Details Area */}
                <div className="flex items-start justify-between mt-1 px-1 gap-2">
                  <div className="flex flex-col pr-2">
                    <span className="text-[17px] font-bold text-gray-900 tracking-tight leading-snug">{template.title}</span>
                    <span className="text-gray-500 text-[14.5px] leading-snug mt-0.5 line-clamp-2">{template.prompt}</span>
                  </div>
                  <button className="flex-shrink-0 w-9 h-9 mt-0.5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors">
                    <ArrowMoveDownRightIcon className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Premade Animations */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Featured Templates</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-max w-full">
            {PREMADE_ANIMATIONS.map(v => (
              <div 
                key={v.id} 
                className="flex flex-col group cursor-pointer"
                onClick={() => {
                  if (onOpenTemplate) {
                    onOpenTemplate(getTemplateCode(v.id, v.prompt), v.prompt, v.durationInFrames);
                  }
                }}
              >
                <div className="bg-[#f5f5f5] w-full aspect-[4/5] rounded-[24px] flex items-center justify-center p-4 text-center overflow-hidden transition-all group-hover:scale-[1.02]">
                  <TemplateAnimationPreview id={v.id} />
                </div>
                <div className="mt-3 px-1 flex flex-col gap-1">
                  <span className="text-gray-900 text-[13px] font-medium line-clamp-2 leading-snug">{v.prompt}</span>
                  <span className="text-gray-500 text-[11px] uppercase tracking-widest">{Math.round(v.durationInFrames / 30)}S</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Skills Section */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Skills for Agents (coming soon)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {SKILLS_DATA.map((skill, idx) => (
              <motion.div 
                key={skill.id} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex flex-col gap-3 group cursor-pointer"
              >
                {/* Visual Card Image */}
                <div className="w-full aspect-[1.8] rounded-[24px] relative overflow-hidden transition-transform group-hover:scale-[1.02] bg-gray-100 shadow-sm">
                  <img src={skill.image} alt={skill.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                
                {/* Text Details Area */}
                <div className="flex items-start justify-between mt-1 px-1 gap-2">
                  <div className="flex flex-col pr-2">
                    <span className="text-[17px] font-bold text-gray-900 tracking-tight leading-snug">{skill.title}</span>
                    <span className="text-gray-500 text-[14.5px] leading-snug mt-0.5 line-clamp-2">{skill.description}</span>
                  </div>
                  <button className="flex-shrink-0 mt-0.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-medium text-sm gap-1 hover:bg-[#e5e5e5] transition-colors">
                    <PlusSignIcon className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
