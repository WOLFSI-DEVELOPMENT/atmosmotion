import React, { useState, useEffect } from 'react';
import BringToLifeTool from './BringToLifeTool';
import AtmosAITools from './AtmosAITools';
import CustomToolCreator from './CustomToolCreator';
import SceneExplorerTool from './SceneExplorerTool';
import ShaderEffectsTool from './ShaderEffectsTool';
import TypeOverlaysTool from './TypeOverlaysTool';
import PixelBentoTool from './PixelBentoTool';
import { SavedMedia } from '../types';
import { AtmosHeader, AtmosBadge, AtmosCard, AtmosButton } from './AtmosToolsSDK';
import { Trash2 } from 'lucide-react';

interface ToolsInterfaceProps {
  savedMedia: SavedMedia[];
  setSavedMedia: React.Dispatch<React.SetStateAction<SavedMedia[]>>;
}

interface CustomTool {
  id: string;
  title: string;
  subtitle: string;
  code: string;
}

const VerifiedBadge = () => (
  <svg className="w-[18px] h-[18px] text-gray-900 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 11.99l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 11.99l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 11.99zm-12.53 3.52L6.16 11.2l1.62-1.6 2.69 2.7 6.44-6.42 1.62 1.6-8.06 8.03z"/>
  </svg>
);

const CardFooter = ({ title, subtitle, onTry }: { title: string; subtitle: string; onTry: () => void }) => (
  <div className="flex gap-4 px-1 mt-1 items-center">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-0.5">
        <h3 className="font-bold text-[15px] text-gray-900 truncate">{title}</h3>
        <VerifiedBadge />
      </div>
      <p className="text-gray-400 text-[13px] leading-snug truncate">{subtitle}</p>
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onTry(); }}
      className="bg-[#f5f5f5] hover:bg-gray-200 text-gray-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex-shrink-0 outline-none border-none cursor-pointer"
    >
      Try
    </button>
  </div>
);

export default function ToolsInterface({ savedMedia, setSavedMedia }: ToolsInterfaceProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isCreatingTool, setIsCreatingTool] = useState(false);
  const [customTools, setCustomTools] = useState<CustomTool[]>([]);
  const [selectedCustomTool, setSelectedCustomTool] = useState<CustomTool | null>(null);

  // Load custom tools from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('atmos_custom_tools_v1');
      if (stored) {
        setCustomTools(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to parse custom tools", err);
    }
  }, []);

  const handleSaveCustomTool = (newTool: CustomTool) => {
    const updated = [newTool, ...customTools];
    setCustomTools(updated);
    localStorage.setItem('atmos_custom_tools_v1', JSON.stringify(updated));
  };

  const handleDeleteCustomTool = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTools.filter(t => t.id !== id);
    setCustomTools(updated);
    localStorage.setItem('atmos_custom_tools_v1', JSON.stringify(updated));
  };

  if (isCreatingTool) {
    return (
      <CustomToolCreator 
        onBack={() => setIsCreatingTool(false)} 
        onSaveTool={handleSaveCustomTool}
      />
    );
  }

  if (selectedCustomTool) {
    return (
      <div className="relative w-full h-full bg-white overflow-hidden flex flex-col font-sans">
        <AtmosHeader 
          title={selectedCustomTool.title}
          subtitle={selectedCustomTool.subtitle}
          onBack={() => setSelectedCustomTool(null)}
          extra={<AtmosBadge variant="indigo">Custom SDK Applet</AtmosBadge>}
        />
        <div className="flex-1 relative bg-white">
          <iframe 
            srcDoc={selectedCustomTool.code}
            className="absolute inset-0 w-full h-full border-none bg-white"
            title={selectedCustomTool.title}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    );
  }

  if (selectedTool === 'bring-to-life') {
    return <BringToLifeTool onBack={() => setSelectedTool(null)} />;
  }

  if (selectedTool === 'atmos-ai-tools') {
    return <AtmosAITools onBack={() => setSelectedTool(null)} savedMedia={savedMedia} setSavedMedia={setSavedMedia} />;
  }

  if (selectedTool === 'scene-explorer') {
    return <SceneExplorerTool onBack={() => setSelectedTool(null)} />;
  }

  if (selectedTool === 'shader-effects') {
    return <ShaderEffectsTool onBack={() => setSelectedTool(null)} />;
  }

  if (selectedTool === 'type-overlays') {
    return <TypeOverlaysTool onBack={() => setSelectedTool(null)} />;
  }

  if (selectedTool === 'pixel-bento') {
    return <PixelBentoTool onBack={() => setSelectedTool(null)} />;
  }

  return (
    <div className="relative flex-1 w-full h-full bg-white text-gray-900 font-sans overflow-hidden">
      {/* Premium Full-Page Coming Soon Overlay with Image Hero */}
      <div className="absolute inset-0 bg-white z-50 flex flex-col pointer-events-auto overflow-y-auto pb-12">
        {/* Top Image */}
        <div className="relative w-full overflow-hidden bg-gray-50 border-b border-gray-100">
          <img
            src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780624501/ElevenLabs_image_gpt-image-2_remove_all_t..._2026-06-05T01_52_10_wrsro6.png"
            alt="Atmos Creation Studio"
            className="w-full h-auto object-cover shadow-sm"
            id="atmos-creation-mockup-img"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Informational Section */}
        <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center">
          <div className="max-w-md">
            <span className="text-[10px] tracking-[0.25em] font-mono font-bold text-gray-400 mb-3 block uppercase">Spatial Tools Lab</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4 font-sans">Coming Soon</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
              The next-generation interactive tools sandbox and creator workspace are currently undergoing code signing and verification.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider text-gray-700">
              <span className="w-2 h-2 rounded-full bg-gray-900 animate-pulse"></span>
              Under Active Deployment
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-full overflow-y-auto px-6 py-10 md:py-16 md:px-12 pb-32">

      {/* Banner */}
      <div className="max-w-6xl mx-auto mb-16 px-4 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-12">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
            Build all the tools you<br />can imagine.
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-semibold max-w-xl">
            An idea and a description are all it takes to make whatever interactive tool you need dynamically with AI.
          </p>
        </div>
        <AtmosButton 
          onClick={() => setIsCreatingTool(true)} 
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 shrink-0 rounded-full font-bold text-xs uppercase tracking-wider"
        >
          Create Tool
        </AtmosButton>
      </div>

      <div className="max-w-6xl mx-auto space-y-16 px-4">
        {/* Render Custom Tools if any exist */}
        {customTools.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Custom Deployments</h2>
              <span className="text-[10px] uppercase font-mono py-0.5 px-2 bg-purple-50 text-purple-600 border border-purple-100 rounded-full tracking-widest font-bold">Personal SDK</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customTools.map((tool) => (
                <AtmosCard 
                  key={tool.id} 
                  variant="gray"
                  className="relative group transition-all"
                  onClick={() => setSelectedCustomTool(tool)}
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-white border border-gray-100 flex items-center justify-center">
                    <span className="text-3xl">⚡</span>
                  </div>
                  
                  {/* Delete button for custom tools */}
                  <button 
                    onClick={(e) => handleDeleteCustomTool(tool.id, e)}
                    className="absolute top-8 right-8 bg-[#f5f5f5] hover:bg-red-50 hover:text-red-600 text-gray-500 p-2 rounded-xl transition-all border border-gray-100 cursor-pointer"
                    title="Delete custom tool"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
 
                  <CardFooter 
                    title={tool.title} 
                    subtitle={tool.subtitle} 
                    onTry={() => setSelectedCustomTool(tool)}
                  />
                </AtmosCard>
              ))}
            </div>
          </section>
        )}

        {/* Core Image Tools */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-900">Standard Image Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <AtmosCard variant="white" className="group" onClick={() => setSelectedTool('bring-to-life')}>
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-[#f5f5f5] border border-gray-50 flex items-center justify-center">
                <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780617354/Light_sky_blue_design_circles_202606041654_piybin.jpg" alt="Bring images to life thumbnail" className="w-full h-full object-cover filter grayscale contrast-125" />
              </div>
              <CardFooter 
                title="Bring images to life" 
                subtitle="Turn your images into immersive 3D landscapes" 
                onTry={() => setSelectedTool('bring-to-life')}
              />
            </AtmosCard>
 
            <AtmosCard variant="white" className="group" onClick={() => setSelectedTool('atmos-ai-tools')}>
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-[#f5f5f5] border border-gray-50 flex items-center justify-center">
                 <div className="flex flex-col items-center gap-1">
                   <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-900 font-bold text-lg">
                      A
                   </div>
                   <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100 mt-2">SDK Pro Engine</div>
                 </div>
              </div>
              <CardFooter 
                title="Atmos AI Tools" 
                subtitle="Generate visuals, narrator audio loops, and erase backgrounds" 
                onTry={() => setSelectedTool('atmos-ai-tools')}
              />
            </AtmosCard>

            <AtmosCard variant="white" className="group" onClick={() => setSelectedTool('scene-explorer')}>
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-[#f5f5f5] border border-gray-50 flex items-center justify-center">
                 <div className="w-full h-full p-2">
                    <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                       <span className="text-xs font-bold text-gray-400 font-mono">1960s Modern Desert Oasis</span>
                    </div>
                 </div>
              </div>
              <CardFooter 
                title="Scene Explorer" 
                subtitle="Explore visuals for scenes based on an initial location" 
                onTry={() => setSelectedTool('scene-explorer')}
              />
            </AtmosCard>
 
          </div>
        </section>
 
        {/* Standard Video Tools */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-900">Standard Video Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <AtmosCard variant="white" className="group" onClick={() => setSelectedTool('shader-effects')}>
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-[#f5f5f5] border border-gray-50 flex items-center justify-center">
                 <div className="w-24 h-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-400 font-mono">Shader v1</span>
                 </div>
              </div>
              <CardFooter 
                title="Shader Effects" 
                subtitle="Apply customizable flat filters to your media assets" 
                onTry={() => setSelectedTool('shader-effects')}
              />
            </AtmosCard>
 
            <AtmosCard variant="white" className="group" onClick={() => setSelectedTool('type-overlays')}>
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-[#f5f5f5] border border-gray-50 flex items-center justify-center">
                 <div className="border border-gray-100 bg-white px-4 py-2.5 rounded-lg flex items-center gap-1.5 leading-none">
                     <span className="text-xs font-bold text-gray-700 tracking-tight font-sans">Header Style</span>
                     <span className="w-0.5 h-4 bg-gray-900 rounded-full animate-pulse"></span>
                 </div>
              </div>
              <CardFooter 
                title="Type Overlays" 
                subtitle="Add beautifully paired typography to video clips" 
                onTry={() => setSelectedTool('type-overlays')}
              />
            </AtmosCard>
 
            <AtmosCard variant="white" className="group" onClick={() => setSelectedTool('pixel-bento')}>
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-[#f5f5f5] border border-gray-50 flex items-center justify-center p-2">
                 <div className="w-full h-full flex gap-2">
                    <div className="flex-[2] bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-300 font-mono">grid.box.1</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex-1 bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-gray-300 font-mono">grid.2</span>
                        </div>
                        <div className="flex-1 bg-[#f5f5f5] rounded-lg border border-gray-100 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-gray-300 font-mono">grid.3</span>
                        </div>
                    </div>
                 </div>
              </div>
              <CardFooter 
                title="pixelBento" 
                subtitle="Apply minimal post-processing layouts like gridding and scaling" 
                onTry={() => setSelectedTool('pixel-bento')}
              />
            </AtmosCard>
 
          </div>
        </section>
 
      </div>
      </div>
    </div>
  );
}
