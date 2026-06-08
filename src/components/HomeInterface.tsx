import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, Camera, FileText, Image as ImageLucide, Layers2, Plus as PlusIcon, Star } from 'lucide-react';
import { PlusSignIcon as Plus, ArrowDown01Icon as ChevronDown, LayersLogoIcon as Aperture, TextFontIcon as Type, Chart03Icon as BarChart2, CarouselHorizontal02Icon as Layout, ArrowMoveDownRightIcon as ArrowRight, GridIcon as Blocks, Clock01Icon as Clock, ComputerIcon as Monitor, SparklesIcon as Sparkles, DropletIcon as Droplet, PaintBoardIcon as Palette, Layers01Icon as Layers, Tick01Icon as Check, AtIcon as AtSign, Image01Icon as ImageIcon, Cancel01Icon as X, PlayIcon as Play, AttachmentIcon, File01Icon, File02Icon, Folder01Icon, AiEditingIcon, Album02Icon, NoteIcon, VoiceIdIcon } from 'hugeicons-react';
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

const TABS = [
  { id: 'logo', label: 'Logo Reveal', icon: Aperture },
  { id: 'title', label: 'Title Sequence', icon: Type },
  { id: 'data', label: 'Data Viz', icon: BarChart2 },
  { id: 'social', label: 'Social Media', icon: Layout },
];

const SUGGESTED_PROMPTS: Record<string, string[]> = {
  logo: [
    "Create a clean, minimal logo reveal with smooth easing and a slight bounce",
    "Generate a 3D rotating logo centered on a dark gradient background",
    "Design a dynamic logo intro with quick scaling and a glowing effect"
  ],
  title: [
    "A cinematic title sequence with slow-moving text and deep shadows",
    "Build a kinetic typography sequence with bold, fast-paced text animations",
    "Produce an elegant title card with subtle fade-ins and thin serif fonts"
  ],
  data: [
    "An animated bar chart growing smoothly showing weekly growth statistics",
    "A pie chart that spins and reveals its segments one by one with labels",
    "A simple animated line graph with a glowing trail effect on a dark background"
  ],
  social: [
    "A vertical 9:16 Instagram reel intro with bold text and emojis",
    "An eye-catching YouTube subscribe animation with a bell icon",
    "A minimal lower thirds graphic for an interview video"
  ]
};

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
  const [activeTab, setActiveTab] = useState('logo');
  const [openDropdown, setOpenDropdown] = useState<'skills' | 'model' | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(aiModel || 'plan');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAttachTrayOpen, setIsAttachTrayOpen] = useState(false);
  const [agentModeIndex, setAgentModeIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MODELS = ['auto', 'Agent', 'plan', 'lite 3.1', 'flash 3.5', 'pro 3.1', 'kimi 2.6'];
  const AGENT_MODES = ['Agent', 'Plan', 'Create'];

  const handleAgentModeCycle = () => {
    const nextIndex = (agentModeIndex + 1) % AGENT_MODES.length;
    setAgentModeIndex(nextIndex);
    const nextMode = AGENT_MODES[nextIndex];
    const modelName = nextMode === 'Create' ? 'auto' : nextMode;
    setSelectedModel(modelName);
    setAiModel && setAiModel(modelName);
  };

  const formatModelName = (name: string) => {
    switch (name) {
      case 'auto':
        return 'auto';
      case 'Agent':
        return 'Agent';
      case 'plan':
        return 'plan';
      case 'lite 3.1':
        return 'lite 3.1';
      case 'flash 3.5':
        return 'flash 3.5';
      case 'pro 3.1':
        return 'pro 3.1';
      case 'kimi 2.6':
        return 'kimi 2.6';
      default:
        return name;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const mediaFiles = savedMedia.filter(m => selectedMediaIds.includes(m.id));
    onSendMessage(input, undefined, undefined, selectedModel !== 'plan', selectedSkills, mediaFiles, selectedModel);
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

  const currentPrompts = SUGGESTED_PROMPTS[activeTab] || [];
  
  const selectedMediaObjs = savedMedia.filter(m => selectedMediaIds.includes(m.id));

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto bg-white text-gray-900 font-sans scrollbar-none">
      {/* Hero Composer */}
      <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden bg-white px-6 pb-16 pt-24 md:min-h-[620px] md:pb-20 md:pt-32">
        <div className="absolute right-8 top-8 z-20">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'model' ? null : 'model')}
              className="flex items-center gap-2 bg-transparent p-2 text-[14.5px] font-medium text-[#1a1a2e] transition-opacity hover:opacity-60"
            >
              <Star className="h-4 w-4" strokeWidth={2.2} />
              <span>{formatModelName(selectedModel)}</span>
              <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
            </button>
            {openDropdown === 'model' && (
              <div className="absolute right-0 top-full z-[60] mt-2 flex min-w-[180px] flex-col gap-0.5 rounded-[14px] border border-[#e2e4e9] bg-white p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                {MODELS.map(model => (
                  <button
                    key={model}
                    type="button"
                    onClick={() => {
                      setSelectedModel(model);
                      setAiModel && setAiModel(model);
                      setOpenDropdown(null);
                    }}
                    className="flex w-full items-center justify-between rounded-[10px] px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-[#f0f1f5]"
                  >
                    <span className="font-medium text-black">{formatModelName(model)}</span>
                    {selectedModel === model && <Check className="h-3.5 w-3.5 text-[#6b6f7e]" strokeWidth={2.4} />}
                  </button>
                ))}
              </div>
            )}
          </div>
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
              <div className="flex gap-2.5">
                {[
                  { label: 'Image', icon: ImageLucide, action: () => setIsMediaModalOpen(true) },
                  { label: 'File', icon: FileText, action: () => setIsMediaModalOpen(true) },
                  { label: 'Logo', icon: Layers2, action: () => setIsMediaModalOpen(true) },
                  { label: 'Screenshot', icon: Camera, action: () => setIsMediaModalOpen(true) },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.action}
                      className="flex h-[82px] flex-1 flex-col items-center justify-center gap-1.5 rounded-[40px] bg-[#f3f4f7] text-[11.5px] font-medium tracking-[0.01em] text-[#50546a] transition hover:-translate-y-px hover:bg-[#eaebef] active:scale-[0.97]"
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
                className="block min-h-[64px] max-h-[200px] w-full resize-none overflow-y-auto bg-transparent pl-[72px] pr-[56px] pb-2 pt-5 text-[15px] leading-relaxed text-[#1a1a2e] outline-none placeholder:text-[#b0b3be]"
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

          <div className="w-full">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[18px] font-semibold text-[#1a1a2e]">Start with a prompt</span>
              <div className="flex gap-2">
                <button className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-gray-500 ring-1 ring-[#e2e4e9] hover:bg-gray-50">
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>
                <button className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-gray-500 ring-1 ring-[#e2e4e9] hover:bg-gray-50">
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </div>
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[20px] text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'bg-[#1a1a2e] text-white' 
                        : 'bg-[#f0f1f4] text-[#4b4f61] hover:bg-[#e8eaef]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {currentPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => {
                    setInput(prompt);
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                    }
                  }}
                  className="group flex w-full items-start gap-3.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-[#f0f1f4]"
                >
                  <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#b0b3be] transition-colors group-hover:text-[#1a1a2e]" />
                  <span className="text-[14px] font-medium text-[#4b4f61] transition-colors group-hover:text-[#1a1a2e]">
                    {prompt}
                  </span>
                </motion.button>
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
