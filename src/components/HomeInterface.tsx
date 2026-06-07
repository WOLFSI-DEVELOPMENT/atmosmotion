import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
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
  const [selectedModel, setSelectedModel] = useState<string>(aiModel || 'Plan');
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MODELS = ['Agent Mode', 'Plan', 'Gemini 3.5 Flash', 'Gemini 3 Flash Preview', 'Gemini 3.1 Flash Lite', 'Gemma-4-31b-it', 'Kimi 2.6'];

  const formatModelName = (name: string) => {
    switch (name) {
      case 'Gemini 3.5 Flash':
        return (
          <span className="flex items-center gap-1.5">
            Flash
            <span className="bg-[#e8f0fe] text-[#1967d2] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-[4px] tracking-wide inline-flex items-center justify-center leading-none">NEW</span>
          </span>
        );
      case 'Gemini 3 Flash Preview':
        return 'Flash';
      case 'Gemini 3.1 Flash Lite':
        return 'Flash Lite';
      case 'Gemma-4-31b-it':
        return 'Gemma';
      case 'Kimi 2.6':
        return 'Kimi 2.6';
      default:
        return name;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const mediaFiles = savedMedia.filter(m => selectedMediaIds.includes(m.id));
    onSendMessage(input, undefined, undefined, selectedModel !== 'Plan', selectedSkills, mediaFiles, selectedModel);
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
      {/* Hero Section Container with Background Image and Bottom Rounded Corners */}
      <div className="relative w-full bg-gray-950 text-white rounded-b-[32px] overflow-hidden flex flex-col items-center justify-center pt-24 pb-20 md:pt-36 md:pb-28 px-6 shadow-xs min-h-[580px] md:min-h-[660px]">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780624501/ElevenLabs_image_gpt-image-2_remove_all_t..._2026-06-05T01_52_10_wrsro6.png"
            alt="Studio Background"
            className="w-full h-full object-cover opacity-100"
            referrerPolicy="no-referrer"
            id="home-canvas-bg"
          />
        </div>

        {/* Foreground Creative Workspace content */}
        <div className="relative z-10 w-full max-w-[800px] flex flex-col items-center">
          <h2 className="text-white font-bold text-2xl md:text-3xl mb-6 text-center tracking-tight drop-shadow-xs">What do you want to create?</h2>
          
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-1 relative w-full max-w-[640px]">
            <div className="relative bg-white rounded-[20px] p-3 px-4 flex flex-col">
              {selectedMediaObjs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedMediaObjs.map(media => (
                    <div key={media.id} className="flex items-center gap-1.5 bg-[#f0f0f0] text-black px-2.5 py-1 rounded-lg text-[13px] font-medium border-none shadow-none outline-none">
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
                placeholder="Ask anything, @ to mention, / for actions"
                className="w-[calc(100%-44px)] bg-transparent text-[#1f1f1f] placeholder:text-[#8e8e8e] text-[15px] outline-none resize-none pb-2 min-h-[40px] max-h-[200px] overflow-y-auto block"
                disabled={isLoading}
                rows={1}
              />
              <div className="flex items-center gap-2 mt-1">
              </div>
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  type="button"
                  disabled={!input.trim() || isOptimizing || isLoading}
                  onClick={handleOptimizePrompt}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none shadow-none bg-transparent ${isOptimizing ? 'text-gray-300 animate-pulse' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                  title="Optimize Prompt (Flash Lite)"
                >
                  <AiEditingIcon className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-9 pl-4 pr-1.5 rounded-full bg-white text-black border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium text-sm focus:outline-none focus:ring-0 active:outline-none"
                >
                  <span>Create</span>
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <ArrowUp className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
                  </div>
                </button>
              </div>
            </div>
            
            <div className="px-4 py-2 flex items-center justify-center gap-1.5">
              <div className="relative">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenDropdown(openDropdown === 'model' ? null : 'model');
                  }}
                  className="flex items-center gap-1.5 text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer text-sm font-medium"
                >
                  <span>{formatModelName(selectedModel)}</span>
                  <ChevronDown className="w-4 h-4 text-white/70" />
                </button>
                {openDropdown === 'model' && (
                  <div className="absolute left-0 bottom-full mb-2 z-[60] min-w-[200px] bg-[#1f1f1f] border border-white/10 rounded-[20px] p-2 flex flex-col gap-1 shadow-xl max-h-[148px] overflow-y-auto scrollbar-none">
                    {MODELS.map(model => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => {
                          setSelectedModel(model);
                          setAiModel && setAiModel(model);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-[14px] font-medium transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none cursor-pointer rounded-xl ${selectedModel === model ? 'text-white bg-white/10' : 'text-gray-300'}`}
                      >
                        <div className="flex items-center gap-3">
                          {formatModelName(model)}
                        </div>
                        <div className="w-3.5 flex justify-center">
                          {selectedModel === model && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                type="button" 
                onClick={() => setIsMediaModalOpen(true)}
                className="flex items-center justify-center w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title="Media"
              >
                <Album02Icon className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
              
              <div className="relative">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenDropdown(openDropdown === 'skills' ? null : 'skills');
                  }}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors cursor-pointer ${selectedSkills.length > 0 ? 'text-white bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                  title="Skills"
                >
                  <NoteIcon className="w-[18px] h-[18px]" strokeWidth={2} />
                </button>
                {openDropdown === 'skills' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[60] min-w-[220px] bg-[#1f1f1f] border border-white/10 rounded-[20px] p-2 flex flex-col gap-1 shadow-xl">
                    {AVAILABLE_SKILLS.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.id);
                      const Icon = skill.icon;
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedSkills(prev => 
                              prev.includes(skill.id) ? prev.filter(id => id !== skill.id) : [...prev, skill.id]
                            );
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-[14px] font-medium transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none cursor-pointer rounded-xl ${isSelected ? 'text-white bg-white/10' : 'text-gray-300'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-[18px] h-[18px] text-white/80" strokeWidth={2} />
                            {skill.name}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="w-[1px] h-4 bg-white/20 mx-0.5"></div>

              <button 
                type="button"
                className="flex items-center justify-center w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title="Voice"
              >
                <VoiceIdIcon className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            </div>
          </form>

          {/* Sub-panels: Categories and Suggested Prompts */}
          <div className="w-full max-w-[700px] mt-8">
            <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[20px] text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'bg-white text-gray-900 shadow-xs' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                  className="flex items-start gap-3.5 text-left w-full group py-1.5 px-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 text-white/40 mt-1 group-hover:text-white transition-colors flex-shrink-0" />
                  <span className="text-[14px] text-white/90 group-hover:text-white transition-colors font-medium">
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
