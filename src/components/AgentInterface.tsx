import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder01Icon as FolderIcon, PlusSignIcon as PlusIcon, ArrowUp02Icon as ArrowUp, MoreHorizontalIcon, PlayCircle02Icon, Download01Icon as Download, Loading01Icon as Loader2 } from 'hugeicons-react';
import ReactMarkdown from 'react-markdown';
import { Message, SavedMedia } from '../types';
import { evaluateRemotionCode } from '../lib/evaluator';
import { renderMediaOnWeb } from '@remotion/web-renderer';

interface AgentInterfaceProps {
  initialPrompt: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onPlayVideo?: (data: { code: string, durationInFrames: number, fps: number, compositionWidth: number, compositionHeight: number, prompt: string }) => void;
}

export default function AgentInterface({ initialPrompt, messages, setMessages, onPlayVideo }: AgentInterfaceProps) {
  const [input, setInput] = useState('');
  const [stage, setStage] = useState<'planning' | 'waiting_approval' | 'generating' | 'waiting_render' | 'rendering' | 'done'>('planning');
  const [streamedText, setStreamedText] = useState('');
  const [streamedMarkdown, setStreamedMarkdown] = useState('');
  const [finalMarkdown, setFinalMarkdown] = useState('');
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const Component = useMemo(() => {
    if (!generatedData?.code) return null;
    try {
      const Comp = evaluateRemotionCode(generatedData.code);
      if (!Comp) throw new Error("No default export found in the generated code.");
      return Comp;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  }, [generatedData?.code]);

  const handleExport = async () => {
    if (!Component || !generatedData) return;
    try {
      setIsExporting(true);
      setExportProgress(0);
      const result = await renderMediaOnWeb({
        composition: {
          id: "MyVideo",
          component: Component,
          durationInFrames: generatedData.durationInFrames || 150,
          fps: generatedData.fps || 30,
          width: generatedData.compositionWidth || 1920,
          height: generatedData.compositionHeight || 1080,
        },
        videoCodec: 'h264',
        container: 'mp4',
        inputProps: {},
        onProgress: (payload: any) => {
          const progress = typeof payload === 'number' ? payload : (payload?.progress ?? 0);
          setExportProgress(progress * 100);
        },
      });

      const videoBlob = typeof result.getBlob === 'function' 
        ? await result.getBlob() 
        : ((result as any).blob || new Blob([(result as any).buffer || ''], { type: 'video/mp4' }));
      const videoUrl = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = "animation.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(videoUrl);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to export video');
    } finally {
      setIsExporting(false);
    }
  };

  // Right side states
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [dialogue, setDialogue] = useState('Dialogue');
  const [duration, setDuration] = useState('~30s');
  const [quality, setQuality] = useState('720p');

  useEffect(() => {
    const fetchInitialPlan = async (promptToUse: string) => {
      setStage('planning');
      let dots = 0;
      const thinkInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        setStreamedText('Analyzing request' + '.'.repeat(dots));
      }, 500);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
          body: JSON.stringify({
             history: [],
             prompt: promptToUse,
             isChatOnly: false,
             modelName: 'gemini-3.1-flash-lite'
          })
        });
        const data = await res.json();
        clearInterval(thinkInterval);
        
        // Mock streaming the text response
        const textResp = data.textResponse || "I have generated a plan for your project. Please review it on the right.";
        const mdResp = data.planMarkdown || "No plan generated.";
        let mdIndex = 0;
        setStreamedText('');
        setStreamedMarkdown('');
        const streamInterval = setInterval(() => {
          mdIndex += 15;
          if (mdIndex >= mdResp.length) mdIndex = mdResp.length;
          
          const textIndex = Math.floor((mdIndex / mdResp.length) * textResp.length);
          setStreamedText(textResp.substring(0, textIndex));
          setStreamedMarkdown(mdResp.substring(0, mdIndex));
          
          if (mdIndex >= mdResp.length) {
            clearInterval(streamInterval);
            setStreamedText('');
            setStage('waiting_approval');
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model' as const, text: textResp }]);
            setFinalMarkdown(mdResp);
            abortControllerRef.current = null;
          }
        }, 40);

      } catch (e: any) {
        if (e.name === 'AbortError') return;
        clearInterval(thinkInterval);
        setStreamedText('');
        setStage('waiting_approval');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Error connecting to AI: " + e.message }] as Message[]);
      }
    };

    if (messages.length === 1 && messages[0].role === 'user' && stage === 'planning' && !streamedText) {
       // Started with a message from home screen
       fetchInitialPlan(messages[0].text);
    } else if (messages.length === 0) {
       // Started empty
       fetchInitialPlan(initialPrompt || "Help me plan a project.");
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user', text: userText }];
    setMessages(newMessages as any);
    setInput('');
    
    setStage('generating');
    let dots = 0;
    const thinkInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      setStreamedText('Thinking' + '.'.repeat(dots));
    }, 500);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Determine model based on prompt
    const isCreateVideo = userText.toLowerCase().includes('generate') || userText.toLowerCase().includes('create video') || userText.toLowerCase().includes('render') || userText.toLowerCase().includes('make the video');
    const modelToUse = isCreateVideo ? 'gemini-3.5-flash' : 'gemini-3.1-flash-lite';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          history: messages,
          prompt: userText,
          isChatOnly: false,
          modelName: modelToUse
        })
      });
      const data = await res.json();
      clearInterval(thinkInterval);
      setStreamedText('');
      
      const textResp = data.textResponse || data.error || 'Done.';
      let i = 0;
      
      // Also check if new markdown was generated
      const mdResp = data.planMarkdown || "";
      if (mdResp) {
        setStreamedMarkdown('');
      }

      let textIndexForMarkdownStream = 0;

      const streamInterval = setInterval(() => {
        i += 4;
        if (i >= textResp.length) i = textResp.length;
        setStreamedText(textResp.substring(0, i));

        if (mdResp) {
            textIndexForMarkdownStream += 15;
            if (textIndexForMarkdownStream >= mdResp.length) textIndexForMarkdownStream = mdResp.length;
            setStreamedMarkdown(mdResp.substring(0, textIndexForMarkdownStream));
        }

        if (i >= textResp.length && (!mdResp || textIndexForMarkdownStream >= mdResp.length)) {
          clearInterval(streamInterval);
          setStreamedText('');
          
          if (mdResp) {
             setFinalMarkdown(mdResp);
          }

          setMessages([...newMessages, { id: Date.now().toString(), role: 'model' as const, text: textResp }] as Message[]);
          abortControllerRef.current = null;
          
          if (data.remotionCode || isCreateVideo) {
            setGeneratedData({
               code: data.remotionCode || '',
               durationInFrames: data.durationInFrames || 300,
               fps: data.fps || 30,
               compositionWidth: data.compositionWidth || 1080,
               compositionHeight: data.compositionHeight || 1080,
               prompt: userText
            });
            setStage('waiting_render');
            setTimeout(() => {
              setStage('rendering');
              setTimeout(() => setStage('done'), 2000);
            }, 2000);
          } else {
            setStage('waiting_approval');
          }
        }
      }, 20);
      
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      clearInterval(thinkInterval);
      setStreamedText('');
      setMessages([...newMessages, { id: Date.now().toString(), role: 'model' as const, text: `Error: ${e.message}` }] as Message[]);
      setStage('waiting_approval');
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setStage('waiting_approval');
        setStreamedText('');
        if (streamedMarkdown) {
          setFinalMarkdown(streamedMarkdown);
        }
    }
  };

  return (
    <div className="flex w-full h-full bg-white relative">
      {/* Left Chat/Stream Area */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: stage === 'planning' ? '100%' : '50%' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="h-full flex flex-col border-r border-gray-100 overflow-hidden relative z-10 bg-white"
      >
        <div className="flex-1 overflow-y-auto p-8 pb-32 flex flex-col items-center">
          <div className={`w-full transition-all ${stage === 'planning' ? 'max-w-3xl' : ''}`}>
            {messages.map((m, idx) => (
             m.role === 'user' ? (
                <div key={idx} className="mb-6 flex justify-end">
                  <div className="bg-gray-100 text-gray-900 rounded-2xl py-3 px-5 max-w-[80%] text-[15px]">
                    {m.text}
                  </div>
                </div>
             ) : (
                <div key={idx} className="mb-6 flex justify-start">
                  <div className="text-gray-900 leading-relaxed text-[15px] whitespace-pre-wrap max-w-[90%]">
                    {m.text}
                  </div>
                </div>
             )
          ))}
          {(stage === 'planning' || stage === 'generating') && (
            <div className="mb-6 flex justify-start">
              <div className="text-gray-900 leading-relaxed text-[15px] whitespace-pre-wrap max-w-[90%]">
                {streamedText}
                <span className="w-2 h-4 inline-block bg-black ml-1 animate-pulse"></span>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-6 left-0 right-0 px-8 flex justify-center pointer-events-none">
          <div className={`bg-white rounded-[24px] p-2 flex flex-col min-h-[96px] outline outline-1 outline-gray-200 border-none w-full pointer-events-auto transition-all shadow-none ${stage === 'planning' ? 'max-w-[650px]' : ''}`}>
             <textarea 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Give feedback"
               className="w-full bg-transparent resize-none border-none outline-none focus:ring-0 px-3 py-2 text-[15px] placeholder:text-gray-500 text-gray-900 flex-1 min-h-[44px]"
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSend();
                 }
               }}
             />
             <div className="flex items-center justify-between mt-2 px-2 pb-1">
                <div className="flex items-center gap-3">
                  <button className="text-gray-400 hover:text-gray-700 transition-colors">
                    <PlusIcon className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                  <button className="text-gray-400 hover:text-gray-700 transition-colors">
                    <FolderIcon className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                </div>
                {(stage === 'planning' || stage === 'generating') ? (
                   <button 
                     onClick={handleStop}
                     className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-gray-100/80 text-gray-400 hover:bg-gray-200 hover:text-gray-700 cursor-pointer border border-gray-200"
                   >
                     <div className="w-2.5 h-2.5 bg-current border-[1.5px] border-current rounded-[2px]" />
                   </button>
                ) : (
                   <button 
                     onClick={handleSend}
                     disabled={!input.trim()}
                     className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${input.trim() ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                   >
                     <ArrowUp className="w-4 h-4" />
                   </button>
                )}
             </div>
          </div>
        </div>
      </motion.div>

      {/* Right Workspace Area */}
      <div className="flex-1 h-full bg-white overflow-y-auto">
         {stage === 'planning' || stage === 'waiting_approval' ? (
           <div className="p-12 max-w-[600px] mx-auto">
              <div className="flex flex-wrap gap-2 mb-10">
                 <div className="relative px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-gray-200/50 cursor-pointer transition-colors">
                   <div className="w-3.5 h-3.5 border border-gray-400 rounded-sm"></div>
                   {aspectRatio}
                   <ChevronDownIcon className="w-3 h-3 text-gray-400 ml-1 pointer-events-none" />
                   <select 
                     value={aspectRatio} 
                     onChange={(e) => setAspectRatio(e.target.value)}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   >
                     <option value="16:9">16:9</option>
                     <option value="9:16">9:16</option>
                     <option value="1:1">1:1</option>
                     <option value="4:3">4:3</option>
                   </select>
                 </div>
                 <div className="px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-2 text-[13px] font-medium text-gray-700 cursor-not-allowed opacity-80">
                   <MusicNoteIcon className="w-3.5 h-3.5" />
                   {dialogue}
                   <ChevronDownIcon className="w-3 h-3 text-gray-400 ml-1" />
                 </div>
                 <div className="relative px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-gray-200/50 cursor-pointer transition-colors">
                   <ClockIcon className="w-3.5 h-3.5" />
                   {duration}
                   <ChevronDownIcon className="w-3 h-3 text-gray-400 ml-1 pointer-events-none" />
                   <select 
                     value={duration} 
                     onChange={(e) => setDuration(e.target.value)}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   >
                     <option value="~15s">~15s</option>
                     <option value="~30s">~30s</option>
                     <option value="~60s">~60s</option>
                   </select>
                 </div>
                 <div className="relative px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-gray-200/50 cursor-pointer transition-colors">
                   <DiamondIcon className="w-3.5 h-3.5" />
                   {quality}
                   <ChevronDownIcon className="w-3 h-3 text-gray-400 ml-1 pointer-events-none" />
                   <select 
                     value={quality} 
                     onChange={(e) => setQuality(e.target.value)}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   >
                     <option value="480p">480p</option>
                     <option value="720p">720p</option>
                     <option value="1080p">1080p</option>
                     <option value="4K">4K</option>
                   </select>
                 </div>
              </div>

              <div className="prose prose-gray max-w-none">
                 <ReactMarkdown>
                    {streamedMarkdown || finalMarkdown || "..."}
                 </ReactMarkdown>
                 {stage === 'planning' && <span className="w-2 h-4 inline-block bg-gray-300 ml-1 animate-pulse"></span>}
              </div>
           </div>
         ) : stage === 'generating' || stage === 'waiting_render' ? (
           <div className="w-full h-full flex items-center justify-center p-8 bg-white">
               <div className="grid grid-cols-2 gap-4 max-w-[600px] w-full">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-video bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center border border-gray-200">
                       <div className="text-[13px] text-gray-400 font-medium">Generating Scene {i}...</div>
                    </div>
                  ))}
               </div>
           </div>
         ) : stage === 'rendering' || stage === 'done' ? (
           <div className="w-full h-full flex items-center justify-center p-8 bg-white">
              <div className="w-full max-w-[700px] aspect-video bg-black rounded-xl overflow-hidden relative">
                 <div className="absolute inset-0 flex items-center justify-center">
                    {stage === 'rendering' ? (
                       <div className="text-white text-sm">Rendering compiled video...</div>
                    ) : (
                       <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center relative">
                          <PlayCircle02Icon onClick={() => { if (onPlayVideo && generatedData?.code) onPlayVideo(generatedData); }} className="w-16 h-16 text-white/50 cursor-pointer hover:text-white transition-colors" />
                          <div className="absolute bottom-4 right-4">
                             <button
                               onClick={handleExport}
                               disabled={isExporting}
                               className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-none backdrop-blur-sm cursor-pointer"
                             >
                               {isExporting ? (
                                 <>
                                   <Loader2 className="w-4 h-4 animate-spin" />
                                   <span>{Math.round(exportProgress)}%</span>
                                 </>
                               ) : (
                                 <>
                                   <Download className="w-4 h-4" />
                                   <span>Download MP4</span>
                                 </>
                               )}
                             </button>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>
         ) : null}
      </div>
    </div>
  );
}

// Inline Icons for standard styling
const ChevronDownIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const MusicNoteIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

const ClockIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const DiamondIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 3h12l4 6-10 12L2 9l4-6z"></path>
  </svg>
);
