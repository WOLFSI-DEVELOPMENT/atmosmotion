import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SCENES = [
  "Hello There",
  "Atmos is getting",
  "a whole new agent",
  "called super atmos",
  "capable of generating",
  "full marketing videos",
  "with",
  "voice over",
  "music",
  "sound effects",
  "so so much more",
  "all coming this summer"
];

const STICKERS = [
  { emoji: "🎬", top: "15%", left: "15%", rotate: -12, delay: 0 },
  { emoji: "✨", top: "20%", right: "20%", rotate: 15, delay: 0.5 },
  { emoji: "🚀", bottom: "25%", left: "20%", rotate: -25, delay: 1 },
  { emoji: "🎙️", bottom: "20%", right: "15%", rotate: 10, delay: 1.5 },
  { emoji: "🎵", top: "45%", left: "10%", rotate: -5, delay: 2 },
  { emoji: "🔥", top: "50%", right: "10%", rotate: 20, delay: 2.5 }
];

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
       i++;
       setDisplayedText(text.slice(0, i));
       if (i > text.length) {
         clearInterval(interval);
       }
    }, 70); 
    
    return () => clearInterval(interval);
  }, [text]);

  return (
    <>
      {displayedText}
      <motion.span 
        animate={{ opacity: [1, 0, 1] }} 
        transition={{ repeat: Infinity, duration: 0.8 }} 
        className="inline-block relative align-middle ml-[2px] w-[5px] h-[36px] md:h-[50px] bg-gray-900" 
      />
    </>
  );
}

export default function SuperAtmosTrailer() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % SCENES.length);
    }, 2800); 
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
           key={currentSceneIndex}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.3 }}
           className="text-center px-8 z-10 m-auto flex items-center justify-center absolute inset-0"
        >
           <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 drop-shadow-sm uppercase">
               <TypewriterText text={SCENES[currentSceneIndex]} />
           </h1>
        </motion.div>
      </AnimatePresence>
      
      {/* Stickers */}
      {STICKERS.map((sticker, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: sticker.delay, type: "spring", stiffness: 200, damping: 15 }}
          className="absolute text-5xl md:text-7xl z-0 pointer-events-none select-none"
          style={{
            top: sticker.top,
            left: sticker.left,
            right: sticker.right,
            bottom: sticker.bottom,
            transform: `rotate(${sticker.rotate}deg)`,
            filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.15))",
            textShadow: "4px 4px 0 #fff, -4px -4px 0 #fff, 4px -4px 0 #fff, -4px 4px 0 #fff, 0 4px 0 #fff, 4px 0 0 #fff, 0 -4px 0 #fff, -4px 0 0 #fff, 3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 0 3px 0 #fff, 3px 0 0 #fff, 0 -3px 0 #fff, -3px 0 0 #fff"
          }}
        >
          {sticker.emoji}
        </motion.div>
      ))}
    </div>
  );
}
