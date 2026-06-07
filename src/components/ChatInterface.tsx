import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Video01Icon as Video, PlusSignIcon as Plus, ArrowDown01Icon as ChevronDown, Message01Icon as MessageCircle, Cancel01Icon as X, DropletIcon as Droplet, PaintBoardIcon as Palette, Layers01Icon as Layers, SparklesIcon as Sparkles, Tick01Icon as Check, AtIcon as AtSign, Image01Icon as ImageIcon, AttachmentIcon, File01Icon, File02Icon, Folder01Icon } from 'hugeicons-react';
import { Message, SavedMedia } from '../types';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import MediaModal from './MediaModal';

const AVAILABLE_SKILLS = [
  { id: 'liquid_glass', name: 'Liquid Glass', icon: Droplet },
  { id: 'ui_design', name: 'Clean UI Design', icon: Palette },
  { id: 'multi_scene', name: 'Multi-Scene', icon: Layers },
];

const QuestionCard = ({ msg, onSubmit }: { msg: Message, onSubmit: (val: string) => void }) => {
  const isApproval = msg.planApproval;
  const title = isApproval ? "Implement this plan?" : msg.clarificationQuestion?.question || "Question";
  const options = isApproval ? ["Yes, implement this plan", "No, and tell Atmos what to do differently"] : msg.clarificationQuestion?.options || [];
  
  const [selected, setSelected] = useState<number | null>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
         setSelected(prev => (prev === null ? 0 : Math.min(prev + 1, options.length - 1)));
      } else if (e.key === 'ArrowUp') {
         setSelected(prev => (prev === null ? 0 : Math.max(prev - 1, 0)));
      } else if (e.key === 'Enter') {
         if (selected !== null) onSubmit(options[selected]);
      } else if (e.key === 'Escape') {
         // onSubmit("Dismissed");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, options, onSubmit]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="bg-white rounded-3xl p-4 flex flex-col border border-gray-100 shadow-xl shadow-black/5"
    >
      <div className="flex items-center justify-between mb-2 px-3 pt-1">
        <h3 className="text-[17px] text-gray-900 font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        {options.map((opt, i) => (
          <button 
             key={i} 
             onClick={() => onSubmit(opt)}
             onMouseEnter={() => setSelected(i)}
             className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all font-medium border-none outline-none flex items-center justify-between ${selected === i ? 'bg-gray-100 text-gray-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
          >
             <span className="flex items-center gap-3">
               <span className={`text-sm opacity-50 ${selected === i ? 'text-gray-900' : 'text-gray-400'}`}>{i + 1}.</span> {opt}
             </span>
             {selected === i && (
               <span className="text-gray-400 text-xs flex gap-1 items-center">
                 <ArrowUp className="w-3 h-3" />
                 <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
               </span>
             )}
          </button>
        ))}
      </div>
      <div className="flex justify-end mt-4 items-center gap-5 px-3 mb-1">
        <span className="text-[13px] font-medium text-gray-400 flex items-center gap-1.5">
          Dismiss <kbd className="font-mono text-[10px] uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">esc</kbd>
        </span>
        <button 
           onClick={() => selected !== null && onSubmit(options[selected])}
           className="bg-[#ebf3ff] text-[#0066FF] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#e0eeff] transition-colors flex items-center gap-1.5 cursor-pointer border-none shadow-sm"
        >
          {isApproval ? 'Submit' : 'Continue'} <kbd className="font-mono text-[11px]">↵</kbd>
        </button>
      </div>
    </motion.div>
  );
};

interface Props {
  messages: Message[];
  onSendMessage: (text: string, length?: number | 'auto', ratio?: string, isChatOnly?: boolean, skills?: string[], mediaFiles?: SavedMedia[], modelName?: string) => void;
  isLoading: boolean;
  onNewProject: () => void;
  savedMedia: SavedMedia[];
  setSavedMedia: React.Dispatch<React.SetStateAction<SavedMedia[]>>;
  aiModel?: string;
  setAiModel?: React.Dispatch<React.SetStateAction<string>>;
}

export default function ChatInterface({ messages, onSendMessage, isLoading, onNewProject, savedMedia, setSavedMedia, aiModel, setAiModel }: Props) {
  const [input, setInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [attachmentDropdownOpen, setAttachmentDropdownOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(aiModel || 'Plan');
  
  const MODELS = ['Plan', 'Gemini 3.5 Flash', 'Gemini 3 Flash Preview', 'Gemini 3.1 Flash Lite', 'Gemma-4-31b-it', 'Kimi 2.6'];

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

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingPhrases = ['Thinking', 'Writing code', 'Configuring scene', 'Rendering'];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setPhraseIndex(0);
      const interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const mediaFiles = savedMedia.filter(m => selectedMediaIds.includes(m.id));
    onSendMessage(input, undefined, undefined, selectedModel !== 'Plan', selectedSkills, mediaFiles, selectedModel);
    setInput('');
    setSelectedMediaIds([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
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
  
  const selectedMediaObjs = savedMedia.filter(m => selectedMediaIds.includes(m.id));

  const lastMessage = messages[messages.length - 1];
  const showQuestionUI = lastMessage && lastMessage.role === 'model' && (lastMessage.clarificationQuestion || lastMessage.planApproval);

  return (
    <div className="w-full h-full flex flex-col bg-transparent relative">
      {/* Background blur blob for header */}
      <div 
        className={`absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/95 via-white/80 to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
          isScrolled ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none'
        }`}
      />
      
      <div className="absolute top-0 left-0 right-0 p-3 px-4 flex items-center justify-between gap-2.5 z-30 transition-all duration-200 bg-transparent pb-3 pt-4">
        <div className="flex flex-row items-center gap-2.5">
          <div className="p-1.5 bg-gray-100/80 rounded-lg">
            <Video className="w-4 h-4 text-gray-700" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 leading-tight">Motion Designer</h1>
            <p className="text-[11px] text-gray-500 leading-tight">AI-powered graphics</p>
          </div>
        </div>
        <button 
          onClick={onNewProject}
          title="New Project"
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors border-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-4 pt-16 pb-56 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onScroll={(e) => setIsScrolled((e.target as HTMLDivElement).scrollTop > 10)}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start w-full px-2'}`}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap bg-[#f5f5f5] text-[#1f1f1f] rounded-br-none">
                  {msg.text}
                </div>
              ) : (
                <div className="prose prose-gray prose-sm max-w-none w-full text-[#1f1f1f] prose-p:leading-relaxed prose-pre:bg-[#f5f5f5] prose-pre:text-[#1f1f1f] prose-code:text-[#1f1f1f] prose-headings:text-[#1f1f1f]">
                  <Markdown>{msg.text}</Markdown>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start px-2">
            <div className="flex gap-3 items-center text-sm font-medium text-gray-500 py-2">
              <div className="flex gap-1 items-center justify-center w-6">
                <motion.div 
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                />
                <motion.div 
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                />
                <motion.div 
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
              </div>
              <span className="relative w-[150px] flex items-center overflow-hidden h-6">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute whitespace-nowrap"
                  >
                    {loadingPhrases[phraseIndex]}...
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-[10px] left-4 right-4 z-20">
        {showQuestionUI && lastMessage ? (
          <QuestionCard 
            msg={lastMessage} 
            onSubmit={(text) => onSendMessage(text, undefined, undefined, selectedModel !== 'Plan', selectedSkills, selectedMediaObjs, selectedModel)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#f5f5f5] rounded-3xl p-1 relative w-full flex flex-col">
            <div className="relative bg-white rounded-[20px] p-3 px-4">
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
              className="w-[calc(100%-44px)] bg-transparent text-[#1f1f1f] placeholder:text-[#8e8e8e] text-[15px] outline-none resize-none pb-2 min-h-[64px] max-h-[200px] overflow-y-auto block"
              disabled={isLoading}
              rows={1}
            />
            <div className="flex items-center gap-2 mt-1 -ml-1">
            </div>
            
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsChatMode(!isChatMode)}
                className={`h-8 px-3 rounded-full flex items-center gap-1.5 transition-colors font-medium text-sm ${
                  isChatMode 
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                    : 'bg-[#f0f0f0] text-[#444746] hover:bg-[#e8e8e8]'
                }`}
              >
                {isChatMode ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 flex-shrink-0 rounded-full bg-[#1f1f1f] text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowUp className="w-5 h-5 text-white" strokeWidth={2} />
              </button>
            </div>
          </div>
          <div className="px-4 py-2 flex items-center gap-1 relative z-20">
            <div className="relative">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setModelDropdownOpen(prev => !prev);
                  setSkillsOpen(false);
                }}
                className="flex items-center gap-1.5 text-[#444746] text-sm font-medium hover:bg-[#ebebeb] px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <span>{formatModelName(selectedModel)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {modelDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-2 z-[60] min-w-[200px] bg-[#f5f5f5] rounded-[20px] p-2 flex flex-col gap-1 border-none shadow-none ring-0">
                  {MODELS.map(model => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model);
                        setAiModel && setAiModel(model);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-white focus:bg-white focus:outline-none cursor-pointer rounded-xl ${selectedModel === model ? 'text-gray-900 bg-white' : 'text-gray-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        {formatModelName(model)}
                      </div>
                      <div className="w-4 flex justify-center">
                        {selectedModel === model && <Check className="w-4 h-4 text-gray-900" strokeWidth={2} />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              type="button" 
              onClick={() => setIsMediaModalOpen(true)}
              className="flex items-center gap-1.5 text-[#444746] text-sm font-medium hover:bg-[#ebebeb] px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <AtSign className="w-[15px] h-[15px]" />
              <span>Media</span>
            </button>
            <div className="relative">
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  setSkillsOpen(prev => !prev);
                  setModelDropdownOpen(false);
                  setAttachmentDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 text-[#444746] text-sm font-medium hover:bg-[#ebebeb] px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Skills {selectedSkills.length > 0 && `(${selectedSkills.length})`}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {skillsOpen && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 5 }} 
                     animate={{ opacity: 1, scale: 1, y: 0 }} 
                     exit={{ opacity: 0, scale: 0.95, y: 5 }}
                     transition={{ duration: 0.2 }}
                     className="absolute bottom-[calc(100%+8px)] left-0 min-w-[220px] z-[60] bg-[#f5f5f5] rounded-[20px] p-2 flex flex-col gap-1 shadow-none border-none ring-0 overflow-hidden"
                   >
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
                           className={`w-full flex items-center justify-between px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-white focus:bg-white focus:outline-none cursor-pointer rounded-xl ${isSelected ? 'text-gray-900 bg-white' : 'text-gray-700'}`}
                         >
                           <div className="flex items-center gap-3">
                             <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                             {skill.name}
                           </div>
                           {isSelected && <Check className="w-4 h-4 text-gray-900" strokeWidth={2} />}
                         </button>
                       )
                     })}
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </form>
        )}
        <p className="text-center mt-3 text-[10px] text-gray-400 font-medium tracking-wide uppercase">Powered by Gemini & Remotion</p>
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
