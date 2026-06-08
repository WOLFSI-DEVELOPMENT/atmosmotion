import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, Bot, Camera, Clock3, FileText, Image as ImageLucide, Layers2, ListChecks, Plus as PlusIcon, Ratio, WandSparkles } from 'lucide-react';
import { PlusSignIcon as Plus, ArrowDown01Icon as ChevronDown, LayersLogoIcon as Aperture, TextFontIcon as Type, Chart03Icon as BarChart2, CarouselHorizontal02Icon as Layout, ArrowMoveDownRightIcon as ArrowRight, GridIcon as Blocks, Clock01Icon as Clock, ComputerIcon as Monitor, SparklesIcon as Sparkles, DropletIcon as Droplet, PaintBoardIcon as Palette, Layers01Icon as Layers, Tick01Icon as Check, AtIcon as AtSign, Image01Icon as ImageIcon, Cancel01Icon as X, PlayIcon as Play, AttachmentIcon, File01Icon, File02Icon, Folder01Icon, AiEditingIcon, Album02Icon, NoteIcon, VoiceIdIcon, Atom02Icon } from 'hugeicons-react';
import { SavedMedia, SavedVideo } from '../types';
import MediaModal from './MediaModal';

interface Props {
  onSendMessage: (text: string, length?: number | 'auto', ratio?: string, isChatOnly?: boolean, skills?: string[], mediaFiles?: SavedMedia[], modelName?: string) => void;
  isLoading: boolean;
  savedMedia: SavedMedia[];
  setSavedMedia: React.Dispatch<React.SetStateAction<SavedMedia[]>>;
  savedVideos: SavedVideo[];
  aiModel?: string;
  setAiModel?: React.Dispatch<React.SetStateAction<string>>;
  onOpenVideo?: (video: SavedVideo) => void;
}

const AVAILABLE_SKILLS = [
  { id: 'liquid_glass', name: 'Liquid Glass', icon: Droplet },
  { id: 'ui_design', name: 'Clean UI Design', icon: Palette },
  { id: 'multi_scene', name: 'Multi-Scene', icon: Layers },
];

const PROMPT_CARDS = [
  {
    title: 'Product Reveal',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=420&q=80',
    prompt: 'Create an Apple-style product reveal with a glossy device silhouette, soft studio lighting, elegant typography, and smooth parallax motion.',
    rotate: '-rotate-6',
  },
  {
    title: 'Keynote Intro',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=420&q=80',
    prompt: 'Create a clean keynote intro with huge minimal type, precise easing, subtle depth, and a bright Apple-inspired stage reveal.',
    rotate: 'rotate-3',
  },
  {
    title: 'Feature Cards',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=420&q=80',
    prompt: 'Animate stacked feature cards that glide into place with translucent panels, crisp icons, and refined Apple-style motion.',
    rotate: '-rotate-2',
  },
  {
    title: 'App Tour',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=420&q=80',
    prompt: 'Create an app interface walkthrough with floating screens, soft shadows, fluid transitions, and concise premium captions.',
    rotate: 'rotate-2',
  },
  {
    title: 'Logo System',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=420&q=80',
    prompt: 'Design a polished logo system animation with geometric alignment, gentle blur reveals, and minimal monochrome composition.',
    rotate: '-rotate-3',
  },
  {
    title: 'Data Motion',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=420&q=80',
    prompt: 'Animate beautiful product metrics with counting numbers, glassy charts, calm camera motion, and Apple-style restraint.',
    rotate: 'rotate-1',
  },
  {
    title: 'Launch Teaser',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=420&q=80',
    prompt: 'Create a cinematic launch teaser with macro details, sparse typography, soft gradients, and elegant build-up pacing.',
    rotate: '-rotate-2',
  },
  {
    title: 'Spatial UI',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=420&q=80',
    prompt: 'Create a spatial interface scene with floating panels, depth-aware motion, refined highlights, and a premium Apple feel.',
    rotate: 'rotate-4',
  },
];

const CODE_BACKDROP = [
  { text: 'spring({ damping: 18, stiffness: 120 })', className: 'left-[8%] top-[22%] rotate-[-8deg]' },
  { text: 'interpolate(frame, [0, 48], [0, 1])', className: 'right-[7%] top-[19%] rotate-[7deg]' },
  { text: 'translateY: easeOutCubic(progress) * -24', className: 'left-[12%] top-[58%] rotate-[5deg]' },
  { text: 'opacity: sequence(0.0, 1.0, 0.92)', className: 'right-[10%] top-[56%] rotate-[-6deg]' },
  { text: 'blur(12px) -> blur(0px)', className: 'left-[28%] top-[14%] rotate-[3deg]' },
  { text: 'camera.zoom = 1 + progress * 0.08', className: 'right-[25%] top-[70%] rotate-[4deg]' },
  { text: 'layer.enter({ y: 18, scale: 0.98 })', className: 'left-[34%] top-[76%] rotate-[-4deg]' },
  { text: 'caption.reveal("Apple-style motion")', className: 'right-[33%] top-[12%] rotate-[-3deg]' },
];

const DISCOVER_TEMPLATES = [
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

export default function HomeInterface({ onSendMessage, isLoading, savedMedia, setSavedMedia, savedVideos, aiModel, setAiModel, onOpenVideo }: Props) {
  const [input, setInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(aiModel || 'Agent');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAttachTrayOpen, setIsAttachTrayOpen] = useState(false);
  const [agentModeIndex, setAgentModeIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const AGENT_MODES = ['Agent', 'Plan', 'Create'];
  const modelOptions = ['lite 3.1', 'flash 3.5', 'pro 3.1', 'kimi 2.6'];
  const modelTabs = ['auto', 'Agent', 'plan'];
  const isGeminiModel = (name: string) => ['lite 3.1', 'flash 3.5', 'pro 3.1'].includes(name);

  const renderModelIcon = (name: string) => {
    if (isGeminiModel(name)) {
      return (
        <svg viewBox="0 0 512 512" className="h-3.5 w-3.5 fill-current text-black" aria-hidden="true">
          <path d="M32.582 370.734C15.127 336.291 5.12 297.425 5.12 256c0-41.426 10.007-80.291 27.462-114.735C74.705 57.484 161.047 0 261.12 0c69.12 0 126.836 25.367 171.287 66.793l-73.31 73.309c-26.763-25.135-60.276-38.168-97.977-38.168-66.56 0-123.113 44.917-143.36 105.426-5.12 15.36-8.146 31.65-8.146 48.64 0 16.989 3.026 33.28 8.146 48.64l-.303.232h.303c20.247 60.51 76.8 105.426 143.36 105.426 34.443 0 63.534-9.31 86.341-24.67 27.23-18.152 45.382-45.148 51.433-77.032H261.12v-99.142h241.105c3.025 16.757 4.654 34.211 4.654 52.364 0 77.963-27.927 143.592-76.334 188.276-42.356 39.098-100.305 61.905-169.425 61.905-100.073 0-186.415-57.483-228.538-141.032v-.233z" />
        </svg>
      );
    }
    if (name === 'kimi 2.6') {
      return (
        <svg viewBox="0 0 512 512" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M503 114.333v280c0 60.711-49.29 110-110 110H113c-60.711 0-110-49.289-110-110v-280c0-60.71 49.289-110 110-110h280c60.71 0 110 49.29 110 110z" />
          <path d="M342.065 189.759c1.886-2.42 3.541-4.63 5.289-6.77.81-1.007.74-1.771-.046-2.824-7.58-9.965-8.298-21.028-3.935-32.254 3.275-8.448 10.52-12.406 19.373-13.25 5.52-.521 10.936.046 15.959 2.73 6.596 3.53 10.438 8.912 11.688 16.341.995 5.926.81 11.712-.868 17.452-2.974 10.161-10.277 15.427-20.287 16.758-8.31 1.11-16.734 1.25-25.113 1.817-.648.046-1.308 0-2.06 0z" fill="#027aff" />
          <path d="M321.512 144.254h-50.064l-39.637 90.384h-56.036v-89.99H131v232.868h44.787v-98.103h78.973c13.598 0 26.015-7.927 31.744-20.252v118.355h44.787v-98.103c0-23.342-18.239-42.97-41.523-44.671v-.116h-24.593a45.577 45.577 0 0026.884-24.534l29.453-65.838z" fill="#fff" />
        </svg>
      );
    }
    if (name === 'Agent') return <Bot className="h-3.5 w-3.5 text-black" strokeWidth={2} />;
    if (name === 'plan') return <ListChecks className="h-3.5 w-3.5 text-black" strokeWidth={2} />;
    return <Atom02Icon className="h-3.5 w-3.5 text-black" strokeWidth={2} />;
  };

  const renderModelLabel = (name: string) => {
    if (isGeminiModel(name)) {
      return (
        <span>
          <span className="text-black">gemini</span>
          <span className="text-gray-400"> {name.replace(/^(lite|flash|pro)\s/i, '')}</span>
        </span>
      );
    }
    return <span>{name}</span>;
  };

  const chooseModel = (model: string) => {
    setSelectedModel(model);
    setAiModel && setAiModel(model);
    setIsModelMenuOpen(false);
  };

  const handleAgentModeCycle = () => {
    const nextIndex = (agentModeIndex + 1) % AGENT_MODES.length;
    setAgentModeIndex(nextIndex);
    const nextMode = AGENT_MODES[nextIndex];
    const modelName = nextMode === 'Create' ? 'auto' : nextMode;
    setSelectedModel(modelName);
    setAiModel && setAiModel(modelName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const mediaFiles = savedMedia.filter(m => selectedMediaIds.includes(m.id));
    const preferredFont = localStorage.getItem('preferredFont');
    const fontInstruction = preferredFont ? `\n\nUse only the "${preferredFont}" font for all text in the generated video.` : '';
    onSendMessage(`${input}${fontInstruction}`, undefined, undefined, selectedModel !== 'plan', selectedSkills, mediaFiles, selectedModel);
    setInput('');
    setSelectedMediaIds([]);
  };

  const handleOptimizePrompt = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!input.trim() || isOptimizing || isLoading) return;
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });
      const data = await res.json();
      if (data.optimizedPrompt) {
        setInput(data.optimizedPrompt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAddMedia = (media: SavedMedia) => {
    setSavedMedia(prev => [media, ...prev]);
    setSelectedMediaIds(prev => [...prev, media.id]);
  };

  const handleSelectMedia = (media: SavedMedia) => {
    setSelectedMediaIds(prev => 
      prev.includes(media.id) ? prev.filter(id => id !== media.id) : [...prev, media.id]
    );
  };

  const handleTryPrompt = (promptText: string) => {
    if ((window as any).typingInterval) {
      clearInterval((window as any).typingInterval);
    }
    
    setInput('');
    if (textareaRef.current) textareaRef.current.focus();
    
    let index = 0;
    (window as any).typingInterval = setInterval(() => {
      if (index >= promptText.length) {
        clearInterval((window as any).typingInterval);
        return;
      }
      
      const charToAdd = promptText.charAt(index);
      setInput(prev => prev + charToAdd);
      index++;
    }, 15);
  };

  const selectedMediaObjs = savedMedia.filter(m => selectedMediaIds.includes(m.id));

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto bg-white text-gray-900 font-sans scrollbar-none">
      {/* Hero Composer */}
      <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden bg-white px-6 pb-16 pt-24 md:min-h-[620px] md:pb-20 md:pt-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          {CODE_BACKDROP.map((line) => (
            <span
              key={line.text}
              className={`absolute hidden whitespace-nowrap font-mono text-[11px] font-medium tracking-tight text-gray-300/65 md:block ${line.className}`}
            >
              {line.text}
            </span>
          ))}
        </div>
        <div className="relative z-10 flex w-full max-w-[660px] flex-col items-center gap-5">
          <h2 className={`w-full text-center [font-family:Georgia,serif] text-4xl font-bold leading-tight tracking-tight text-[#0a0a0a] transition-transform duration-300 md:text-[40px] ${isAttachTrayOpen ? '-translate-y-4' : ''}`}>
            What do you want to create?
          </h2>

          <form onSubmit={handleSubmit} className="relative w-full">
            <div
              className={`absolute bottom-full left-0 right-0 z-0 mb-[-20px] overflow-hidden rounded-t-[40px] bg-white px-3 transition-all duration-300 ${
                isAttachTrayOpen
                  ? 'max-h-[160px] border border-b-0 border-[#e2e4e9] pb-0 pt-3.5 opacity-100'
                  : 'max-h-0 py-0 opacity-0'
              }`}
              style={{ cornerShape: 'superellipse(2.5)' } as React.CSSProperties}
            >
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-0.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[
                  { label: 'Image', icon: ImageLucide, action: () => setIsMediaModalOpen(true) },
                  { label: 'File', icon: FileText, action: () => setIsMediaModalOpen(true) },
                  { label: 'Logo', icon: Layers2, action: () => setIsMediaModalOpen(true) },
                  { label: 'Screenshot', icon: Camera, action: () => setIsMediaModalOpen(true) },
                  { label: 'Skills', icon: WandSparkles, action: () => {} },
                  { label: 'Length', icon: Clock3, action: () => {} },
                  { label: 'Aspect ratio', icon: Ratio, action: () => {} },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.action}
                      className="flex h-[82px] min-w-[186px] snap-center flex-col items-center justify-center gap-1.5 rounded-[40px] bg-[#f3f4f7] text-[11.5px] font-medium tracking-[0.01em] text-[#50546a] transition duration-300 ease-out hover:-translate-y-px hover:scale-[1.015] hover:bg-[#eaebef] active:scale-[0.97]"
                      style={{ cornerShape: 'superellipse(2.5)' } as React.CSSProperties}
                    >
                      <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <svg className="mt-3 block h-[22px] w-full overflow-visible" viewBox="0 0 600 22" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,18 Q20,4 60,4 L540,4 Q580,4 600,18" fill="none" stroke="#e2e4e9" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="relative overflow-hidden rounded-[40px] bg-white ring-1 ring-[#e2e4e9] transition-shadow focus-within:ring-[#c8cdd8] focus-within:shadow-[0_2px_16px_rgba(0,0,0,0.06)]" style={{ cornerShape: 'superellipse(2.5)' } as React.CSSProperties}>
              {selectedMediaObjs.length > 0 && (
                <div className="flex flex-wrap gap-2 px-5 pt-4">
                  {selectedMediaObjs.map(media => (
                    <div key={media.id} className="flex items-center gap-1.5 bg-[#f0f1f5] text-[#1a1a2e] px-2.5 py-1 rounded-lg text-[13px] font-medium border-none shadow-none outline-none">
                      <ImageIcon className="w-3.5 h-3.5 text-black" />
                      <span>@{media.name}</span>
                      <button 
                        type="button" 
                        onClick={() => handleSelectMedia(media)}
                        className="hover:bg-[#e0e0e0] rounded-full p-0.5 ml-0.5 transition-colors text-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) {
                      handleSubmit(e as any);
                    }
                  }
                }}
                placeholder="Ask me anything..."
                className="block min-h-[64px] max-h-[200px] w-full resize-none overflow-y-auto bg-transparent pl-[104px] pr-[132px] pb-2 pt-5 text-[15px] leading-relaxed text-[#1a1a2e] outline-none placeholder:text-[#b0b3be]"
                disabled={isLoading}
                rows={1}
              />

              <div className="relative h-[50px]">
                <button
                  type="button"
                  onClick={() => setIsAttachTrayOpen(prev => !prev)}
                  className={`absolute bottom-2.5 left-3 flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-[#e4e6eb] ${
                    isAttachTrayOpen ? 'rotate-45 bg-[#1a1a2e] text-white hover:bg-[#2d2d44]' : 'bg-[#f0f1f5] text-[#6b6f7e]'
                  }`}
                  title="Attach"
                >
                  <PlusIcon className="h-4 w-4" strokeWidth={2.4} />
                </button>

                <button
                  type="button"
                  onClick={handleAgentModeCycle}
                  className="absolute bottom-2.5 left-[52px] flex h-8 min-w-[68px] items-start justify-center overflow-hidden rounded-full bg-[#f0f1f5] px-4 text-[13px] font-medium text-[#6b6f7e] transition-colors hover:bg-[#e4e6eb] active:scale-95"
                  title="Change Mode"
                >
                  <div className="flex flex-col transition-transform duration-300" style={{ transform: `translateY(-${agentModeIndex * 32}px)` }}>
                    {AGENT_MODES.map((mode) => (
                      <span key={mode} className="block h-8 leading-8">{mode}</span>
                    ))}
                  </div>
                </button>

                <div className="absolute bottom-2.5 right-[52px] z-20">
                  <button
                    type="button"
                    onClick={() => setIsModelMenuOpen(prev => !prev)}
                    className="flex h-8 max-w-[112px] items-center gap-1.5 rounded-full bg-[#f0f1f5] px-3 text-[12px] font-medium text-[#50546a] transition-colors hover:bg-[#e4e6eb]"
                    style={{ cornerShape: 'superellipse(2)' } as React.CSSProperties}
                  >
                    {renderModelIcon(selectedModel)}
                    <span className="truncate">{renderModelLabel(selectedModel)}</span>
                  </button>

                  {isModelMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-[232px] rounded-[18px] border border-gray-200 bg-white p-2">
                      <div className="mb-2 flex w-full rounded-full bg-gray-100 p-1">
                        {modelTabs.map(model => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => chooseModel(model)}
                            className={`flex h-7 flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-colors ${
                              selectedModel === model ? 'bg-white text-black' : 'bg-transparent text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            {renderModelIcon(model)}
                            {model.toLowerCase()}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-1">
                        {modelOptions.map(model => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => chooseModel(model)}
                            className="flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-gray-100"
                          >
                            <span className="flex items-center gap-2">
                              {renderModelIcon(model)}
                              {renderModelLabel(model)}
                            </span>
                            {selectedModel === model && <ListChecks className="h-3.5 w-3.5 text-gray-500" strokeWidth={2.2} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute bottom-2.5 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#38bdf8] text-white transition-transform hover:scale-105 hover:bg-[#0ea5e9] disabled:cursor-not-allowed disabled:opacity-50"
                  title="Send"
                >
                  <ArrowUp className="h-[14px] w-[14px]" strokeWidth={2.6} />
                </button>
              </div>
            </div>
          </form>

          <div className="w-screen max-w-[1180px]">
            <h3 className="mb-8 text-center text-[26px] font-bold tracking-tight text-[#171717]">or start with a prompt</h3>
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-7 pb-8 pt-3 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {PROMPT_CARDS.map((card, index) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => handleTryPrompt(card.prompt)}
                  className={`group relative flex h-[190px] min-w-[148px] snap-center flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white p-2 transition duration-300 ease-out hover:-translate-y-2 hover:rotate-0 hover:border-gray-300 ${card.rotate}`}
                >
                  <div className="relative h-[132px] overflow-hidden rounded-[18px] bg-gray-100">
                    <img src={card.image} alt={card.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  </div>
                  <span className="mt-2 truncate text-center text-[16px] font-bold text-[#202020]">{card.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Templates Section Container - Renders below the hero image block in the standard body */}
      <div className="w-full flex justify-center py-12 px-6 bg-white pb-32">
        <div className="w-full max-w-[1100px]">
          <h3 className="text-[22px] font-bold text-gray-900 mb-1">What can Atmos create?</h3>
          <p className="text-gray-500 mb-8 font-medium text-[15px]">Motion graphics, 3D product showcases, data visualizations, glitchy intros, and fluid transitions.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10 mt-6">
            {DISCOVER_TEMPLATES.map((template, idx) => (
              <motion.div 
                key={template.id} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex flex-col gap-3 group"
              >
                {/* Visual Card Image */}
                <div className="w-full aspect-[1.8] rounded-[24px] relative overflow-hidden transition-transform group-hover:scale-[1.02] bg-gray-100">
                  <img src={template.image} alt={template.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                
                {/* Text Details Area */}
                <div className="flex items-start justify-between mt-1.5 px-0.5 gap-2">
                  <div className="flex flex-col pr-2">
                    <h4 className="font-bold text-gray-900 text-[16px]">{template.title}</h4>
                    <p className="text-[14px] text-gray-500 font-medium mt-1 leading-snug">{template.description}</p>
                  </div>
                  <button 
                    onClick={() => handleTryPrompt(template.prompt)}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-black text-gray-800 hover:text-white text-[13px] font-bold rounded-full transition-colors cursor-pointer flex-shrink-0"
                  >
                    Try
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        savedMedia={savedMedia}
        onAddMedia={handleAddMedia}
        onSelectMedia={handleSelectMedia}
        selectedIds={selectedMediaIds}
      />
    </div>
  );
}
