import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Code2, Play, Check, Copy, ArrowUp, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { AtmosHeader, AtmosBadge, AtmosCard, AtmosButton } from './AtmosToolsSDK';

interface CustomTool {
  id: string;
  title: string;
  subtitle: string;
  code: string;
}

interface CustomToolCreatorProps {
  onBack: () => void;
  onSaveTool: (tool: CustomTool) => void;
}

const CREATOR_TABS = [
  { id: 'utility', label: '🛠️ Interactive Utility' },
  { id: 'generator', label: '🎨 Art Generator' },
  { id: 'helper', label: '⚙️ Workspace Helper' }
];

const SUGGESTED_DESCRIPTIONS: Record<string, string[]> = {
  utility: [
    "A custom color palette tester where users can select RGB colors and export Tailwind config",
    "A fluid grid system visualizer allowing users to resize columns and inspect viewport offsets"
  ],
  generator: [
    "An interactive canvas that draws random fluid color blocks and exports them as PNGs",
    "A geometric particle flow visualizer with speed and size controls"
  ],
  helper: [
    "A high-contrast characters, word, sentence counter and keyword density inspector",
    "A video timestamp planner and cue sheet marker generator"
  ]
};

export default function CustomToolCreator({ onBack, onSaveTool }: CustomToolCreatorProps) {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('utility');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [toolTitle, setToolTitle] = useState('My Custom Tool');
  const [toolSubtitle, setToolSubtitle] = useState('Created with Atmos AI');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const currentSuggestions = SUGGESTED_DESCRIPTIONS[activeTab] || [];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedCode(null);
    setGenerationLogs(["Initiating compilation sequence...", "Analyzing architectural inputs..."]);

    const logs = [
      "Analyzing architectural inputs...",
      "Drafting elegant flat dashboard user interface...",
      "Applying Atmos SDK specification rules (0% gradients, 0% shadows)...",
      "Binding interactive script behaviors...",
      "Refining font pairings and responsive sizing...",
      "Wrapping sandboxed preview environment..."
    ];

    // Simulating terminal log feedback
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < logs.length) {
        setGenerationLogs(prev => [...prev, logs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    try {
      // Craft a system context prompt to enforce standard SDK rules
      const fullPrompt = `${prompt}
      
      CRITICAL DESIGN DIRECTIVES FOR COMPLIANCE:
      - Implement a fully self-contained HTML/CSS/JavaScript applet.
      - Theme: CLEAN WHITE BACKGROUND. No dark themes unless explicitly requested.
      - Cards: Use white and light gray (#f5f5f5) flat borders.
      - Gradients: STRICTLY FORBIDDEN. Use flat colors only.
      - Shadows & Outlines: STRICTLY FORBIDDEN.
      - Fonts: Use "Inter" or clean sans-serif typography.
      - Buttons: Rounded-full, high-contrast, flat black/white style.
      - All inputs: rounded-xl, light gray background, no focus outline.
      - Make sure the tool has a pristine, professional visual layer and is fully working. Provide real interactive features.`;

      const res = await fetch('/api/generate-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt })
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.html) {
        setGeneratedCode(data.html);
        
        // Extract a nice title from prompt
        const firstFewWords = prompt.split(' ').slice(0, 4).join(' ');
        const cleanedTitle = firstFewWords.charAt(0).toUpperCase() + firstFewWords.slice(1) || 'Custom Interactive Utility';
        setToolTitle(cleanedTitle);
        setToolSubtitle(`Bespoke ${activeTab} tool`);
        
        setGenerationLogs(prev => [...prev, "🌟 Synthesis completed successfully! Rendering sandbox..."]);
      } else {
        throw new Error("No HTML code returned");
      }
    } catch (err: any) {
      clearInterval(interval);
      setGenerationLogs(prev => [...prev, `❌ Compilation Error: ${err.message}`]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedCode) return;
    const cleanId = 'ct_' + Math.random().toString(36).substr(2, 5);
    const newTool: CustomTool = {
      id: cleanId,
      title: toolTitle,
      subtitle: toolSubtitle,
      code: generatedCode
    };
    onSaveTool(newTool);
    onBack();
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden font-sans text-sm text-gray-900 h-full w-full relative">
      {/* Absolute top bar with SDK flat header */}
      <AtmosHeader 
        title="Custom Tool Architect"
        subtitle="Prompt the AI to construct fully custom, interactive client-side widgets."
        onBack={onBack}
        extra={
          generatedCode && (
            <div className="flex items-center gap-3">
              <div className="flex bg-[#f5f5f5] rounded-full p-1 select-none border border-gray-100">
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none border-none ${viewMode === 'preview' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  Running Tool
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('code')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none border-none ${viewMode === 'code' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  Source Code
                </button>
              </div>
              <AtmosButton onClick={handleSave} className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2">
                Save & Deploy Tool
              </AtmosButton>
            </div>
          )
        }
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {!generatedCode && !isGenerating ? (
          // Initial greeting view
          <div className="flex-1 overflow-y-auto px-6 py-12 md:py-20 flex flex-col items-center">
            <div className="w-full max-w-2xl text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                What interactive tool would you like to build?
              </h1>
              <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
                Simply specify the features, inputs, and layout. Atmos AI will write, compile, and embed your new applet in seconds.
              </p>
            </div>

            {/* Quick Presets Section */}
            <div className="w-full max-w-2xl space-y-6">
              <div className="flex items-center justify-center gap-2 mb-2 overflow-x-auto pb-1">
                {CREATOR_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-none ${
                      activeTab === tab.id 
                        ? 'bg-[#f5f5f5] text-gray-900' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSuggestions.map((suggestion, index) => (
                  <AtmosCard 
                    key={index} 
                    variant="gray" 
                    className="cursor-pointer hover:bg-gray-100 transition-all text-left"
                    onClick={() => {
                      setPrompt(suggestion);
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                  >
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preset idea #{index + 1}</p>
                    <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{suggestion}</p>
                  </AtmosCard>
                ))}
              </div>
            </div>
          </div>
        ) : isGenerating ? (
          // Processing & Compilation logging screen
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white select-none">
            <div className="w-full max-w-md bg-[#f5f5f5] border border-gray-100 rounded-[24px] p-6 text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping"></div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-600">AI Compiler Live Engine</span>
              </div>
              <div className="space-y-2.5 font-mono text-[11px] text-gray-600 leading-relaxed">
                {generationLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-indigo-400 shrink-0">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Tool output screen (Preview or Code Edit)
          <div className="flex-1 relative bg-white flex flex-col">
            {viewMode === 'preview' ? (
              <div className="flex-1 relative flex flex-col">
                <div className="bg-[#f9f9f9] border-b border-gray-100 px-6 py-2 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <input 
                      type="text"
                      className="bg-transparent border-none outline-none font-bold text-sm text-gray-900 focus:bg-white focus:ring-1 focus:ring-gray-200 rounded px-2 py-0.5"
                      value={toolTitle}
                      onChange={(e) => setToolTitle(e.target.value)}
                    />
                    <span className="text-gray-300">|</span>
                    <input 
                      type="text"
                      className="bg-transparent border-none outline-none font-medium text-xs text-gray-400 focus:bg-white focus:ring-1 focus:ring-gray-200 rounded px-2 py-0.5"
                      value={toolSubtitle}
                      onChange={(e) => setToolSubtitle(e.target.value)}
                    />
                  </div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#a855f7] bg-purple-50 px-2 py-0.5 border border-purple-100 rounded">
                    ACTIVE SANDBOX
                  </div>
                </div>
                <iframe 
                  srcDoc={generatedCode}
                  className="flex-1 w-full h-full border-none bg-white"
                  title="Dynamic custom tool workspace"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            ) : (
              <div className="flex-1 relative bg-[#f9f9f9] border border-gray-150">
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  theme="light"
                  value={generatedCode}
                  onChange={(v) => setGeneratedCode(v || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: 'on',
                    padding: { top: 20 }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Centered Bottom Input Form */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[640px] px-4 z-40">
        <form 
          onSubmit={handleGenerate}
          className="bg-[#f5f5f5] rounded-[24px] p-1.5 border border-gray-100 flex flex-col relative"
        >
          <div className="relative bg-white rounded-[18px] p-3 px-4 flex flex-col">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (prompt.trim() && !isGenerating) {
                    handleGenerate();
                  }
                }
              }}
              placeholder="Describe the tool parameters e.g., 'A contrast checker with RGB values'..."
              className="w-[calc(100%-48px)] bg-transparent text-[#1f1f1f] placeholder:text-gray-400 text-[14px] outline-none border-none resize-none pb-2 min-h-[40px] max-h-[180px] overflow-y-auto block"
              disabled={isGenerating}
              rows={1}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center">
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="h-9 pl-4 pr-1.5 rounded-full bg-gray-900 text-white flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold text-xs border-none uppercase tracking-wide shrink-0"
              >
                <span>Create</span>
                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                  <ArrowUp className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
                </div>
              </button>
            </div>
          </div>
          
          {/* Custom micro subtiles under to replace standard Home tags */}
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Custom Engine v1.0</span>
            {generatedCode && (
              <button
                type="button"
                onClick={() => {
                  setPrompt('');
                  setGeneratedCode(null);
                }}
                className="text-[10px] text-gray-500 hover:text-red-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
              >
                <X className="w-3 h-3" /> Start Over
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
