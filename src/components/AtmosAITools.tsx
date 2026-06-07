import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Music, Trash2, Scissors, Copy, Check, Info, Library } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import Upscaler from 'upscaler';
import { SavedMedia } from '../types';
import {
  AtmosCard,
  AtmosButton,
  AtmosInput,
  AtmosTextArea,
  AtmosSelect,
  AtmosTabs,
  AtmosBadge,
  AtmosHeader
} from './AtmosToolsSDK';

interface AtmosAIToolsProps {
  onBack: () => void;
  savedMedia: SavedMedia[];
  setSavedMedia: React.Dispatch<React.SetStateAction<SavedMedia[]>>;
}

export default function AtmosAITools({ onBack, savedMedia, setSavedMedia }: AtmosAIToolsProps) {
  const [activeTab, setActiveTab] = useState<'agent' | 'image' | 'audio' | 'utils' | 'library'>('agent');
  const [agentTool, setAgentTool] = useState<'image' | 'audio' | 'bg_remove' | 'upscale'>('image');

  // Image Gen State
  const [imgPrompt, setImgPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imgStyle, setImgStyle] = useState('Photorealistic');

  // Audio Gen State
  const [audioScript, setAudioScript] = useState('');
  const [voice, setVoice] = useState('Echo (Male, Neutral)');

  // Utils State
  const [utilFile, setUtilFile] = useState<File | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (name: string, id: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateImage = async () => {
    if (!imgPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/pixazo/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imgPrompt + " " + imgStyle + " " + aspectRatio })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const uniqueId = 'img_' + Math.random().toString(36).substr(2, 5);
      const newMedia: SavedMedia = {
        id: uniqueId,
        name: `@${uniqueId}`,
        content: data.imageUrl
      };
      setSavedMedia(prev => [newMedia, ...prev]);
      setImgPrompt('');
      if (activeTab !== 'agent') setActiveTab('library');
    } catch (err: any) {
      alert("Image Generation Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!audioScript.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/pixazo/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: audioScript })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const requestId = data.request_id;
      if (!requestId) throw new Error("No request ID returned");

      const poll = async () => {
         const pollRes = await fetch(`/api/pixazo/audio/status/${requestId}`);
         const pollData = await pollRes.json();
         if (pollData.error) throw new Error(pollData.error);
         
         if (pollData.status === 'COMPLETED') {
            const uniqueId = 'aud_' + Math.random().toString(36).substr(2, 5);
            const newMedia: SavedMedia = {
              id: uniqueId,
              name: `@${uniqueId}`,
              content: pollData.output?.media_url?.[0] || ''
            };
            setSavedMedia(prev => [newMedia, ...prev]);
            setAudioScript('');
            setIsGenerating(false);
            if (activeTab !== 'agent') setActiveTab('library');
         } else if (pollData.status === 'FAILED' || pollData.status === 'ERROR') {
            throw new Error("Generation failed: " + pollData.error);
         } else {
            setTimeout(poll, 3000);
         }
      };
      
      poll();
    } catch (err: any) {
      alert("Audio Generation Error: " + err.message);
      setIsGenerating(false);
    }
  };

  const handleUtils = async (action: 'bg_remove' | 'upscale') => {
    if (!utilFile) return;
    setIsGenerating(true);
    try {
      let finalContent = '';
      if (action === 'bg_remove') {
        const blob = await removeBackground(utilFile);
        finalContent = URL.createObjectURL(blob);
      } else {
        const upscaler = new Upscaler();
        const image = new Image();
        image.src = URL.createObjectURL(utilFile);
        await new Promise((resolve) => {
          image.onload = resolve;
        });
        finalContent = await upscaler.upscale(image);
      }

      const uniqueId = `${action === 'upscale' ? 'up' : 'rm'}_` + Math.random().toString(36).substr(2, 5);
      const newMedia: SavedMedia = {
        id: uniqueId,
        name: `@${uniqueId}`,
        content: finalContent
      };
      setSavedMedia(prev => [newMedia, ...prev]);
      setUtilFile(null);
      if (activeTab !== 'agent') setActiveTab('library');
    } catch (err: any) {
      alert("Processing Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteMedia = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedMedia(prev => prev.filter(m => m.id !== id));
  };

  const tabsConfig = [
    { id: 'agent', label: '🤖 Agent Hub' },
    { id: 'image', label: '✨ Image Gen' },
    { id: 'audio', label: '🔊 Audio Loop' },
    { id: 'utils', label: '✂️ Toolbox' },
    { id: 'library', label: '📚 Asset Vault' }
  ] as const;

  return (
    <div className="flex-1 flex flex-col bg-white border-l border-gray-150 overflow-hidden font-sans text-sm text-gray-900 h-full w-full">
      {/* Header with SDK specs */}
      <AtmosHeader 
        title="Atmos Tools"
        subtitle="Generate, manipulate, and manage asset vaults."
        onBack={onBack}
        extra={<AtmosBadge variant="indigo">Pro SDK Standard</AtmosBadge>}
      />

      {/* Tabs Selector Bar */}
      <AtmosTabs 
        tabs={tabsConfig as any}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Main Panel Content Container (No shadows, No gradients) */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
        
        {/* TAB 1: AGENT HUB (Flat Pinterest Grid with white & grey cards) */}
        {activeTab === 'agent' && (
          <div className="flex flex-col h-full relative min-h-[400px]">
            <div className="flex-1 overflow-y-auto pb-44">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {savedMedia.map((media) => (
                  <AtmosCard key={media.id} variant="white" className="group shrink-0 overflow-hidden relative border-gray-100 h-fit">
                    {media.content.includes('ogg') || media.content.includes('audio') ? (
                       <div className="w-full aspect-square flex flex-col items-center justify-center p-4 bg-[#f5f5f5] rounded-xl hover:bg-gray-100 transition-colors">
                         <span className="text-3xl">🔊</span>
                         <span className="uppercase text-[9px] font-mono text-gray-400 mt-3 text-center tracking-wider">Audio Track</span>
                       </div>
                    ) : (
                       <div className="w-full aspect-square overflow-hidden bg-[#f5f5f5] rounded-xl flex items-center justify-center">
                         <img src={media.content} alt={media.name} className="w-full h-full object-cover rounded-xl" />
                       </div>
                    )}
                    
                    {/* Delete flat button */}
                    <button 
                      onClick={(e) => handleDeleteMedia(media.id, e)}
                      className="absolute top-8 right-8 bg-[#f5f5f5] hover:bg-red-50 hover:text-red-600 text-gray-500 p-2 rounded-xl transition-all border border-gray-100 cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="pt-3 flex items-center justify-between break-all">
                      <span className="text-[11px] font-bold text-gray-800 truncate pr-2">{media.name}</span>
                      <button 
                        type="button"
                        onClick={() => handleCopyId(media.name, media.id)}
                        className="text-[9px] font-bold tracking-wider uppercase border border-gray-200 px-2.5 py-1 rounded-full hover:bg-gray-50 transition-colors shrink-0 flex items-center gap-1 cursor-pointer bg-white"
                      >
                        {copiedId === media.id ? <Check className="w-2.5 h-2.5 text-green-600" /> : <Copy className="w-2.5 h-2.5 text-gray-400" />}
                        {copiedId === media.id ? 'Copied' : 'ID'}
                      </button>
                    </div>
                  </AtmosCard>
                ))}

                {savedMedia.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 uppercase text-xs space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center text-gray-500 mb-2">
                      <Sparkles className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="font-semibold text-gray-600">No assets in Vault</span>
                    <span className="text-[10px] text-gray-400 font-mono normal-case max-w-sm text-center px-4">Use the floating generator workspace below to synthesize high-contrast AI visual and audio stems.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Float Command Box overlay (No shadow, no gradients, minimal borders) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[#f5f5f5] border border-gray-200 rounded-[24px] flex flex-col z-20 overflow-hidden">
              
              {/* Type Switcher */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-gray-100 bg-[#f5f5f5]">
                <select 
                  className="flex-1 px-4 py-3 bg-transparent text-xs uppercase font-bold text-gray-700 outline-none focus:outline-none cursor-pointer border-none"
                  value={agentTool}
                  onChange={(e) => setAgentTool(e.target.value as any)}
                >
                  <option value="image">✨ Visual Synthesis Studio</option>
                  <option value="audio">🔊 Audio Voice Generation</option>
                  <option value="bg_remove">✂️ Background Removal Tool</option>
                  <option value="upscale">🔎 Smart SuperResolution (4x)</option>
                </select>
                
                {agentTool === 'image' && (
                  <div className="flex bg-white divide-x divide-gray-100 flex-1 shrink-0 overflow-x-auto border-t sm:border-t-0 sm:border-l border-gray-100">
                    <select 
                      className="px-3 py-3 bg-transparent text-[10px] uppercase font-bold text-gray-600 outline-none focus:outline-none cursor-pointer text-center flex-1 font-mono border-none"
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                    >
                      <option value="16:9">16:9 Landscape</option>
                      <option value="9:16">9:16 Portrait</option>
                      <option value="1:1">1:1 Square</option>
                    </select>
                    <select 
                      className="px-3 py-3 bg-transparent text-[10px] uppercase font-bold text-gray-600 outline-none focus:outline-none cursor-pointer flex-[2] truncate border-none font-mono"
                      value={imgStyle}
                      onChange={(e) => setImgStyle(e.target.value)}
                    >
                      <option>Photorealistic</option>
                      <option>Vector Sketch</option>
                      <option>Minimalist Line</option>
                      <option>3D Render</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Interaction Workspace Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                {(agentTool === 'image' || agentTool === 'audio') && (
                  <textarea 
                    className="w-full h-20 border border-gray-100 rounded-xl p-3 text-sm resize-none bg-[#f5f5f5] focus:bg-white focus:outline-none focus:border-gray-300 placeholder-gray-400 font-sans transition-all mb-3 text-gray-900"
                    placeholder={agentTool === 'image' ? "Describe the visual artwork to synthesize..." : "Write down the voice script stem for natural narration loop..."}
                    value={agentTool === 'image' ? imgPrompt : audioScript}
                    onChange={(e) => agentTool === 'image' ? setImgPrompt(e.target.value) : setAudioScript(e.target.value)}
                    onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           agentTool === 'image' ? handleGenerateImage() : handleGenerateAudio();
                       }
                    }}
                  />
                )}

                {(agentTool === 'bg_remove' || agentTool === 'upscale') && (
                  <div className="mb-3">
                    <div 
                      className="w-full h-20 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-[#f5f5f5] hover:bg-gray-100 relative cursor-pointer transition-all"
                      onClick={() => document.getElementById('atmos-util-upload-prompt')?.click()}
                    >
                      <span className="text-gray-700 uppercase text-[11px] font-bold mb-0.5">
                        {utilFile ? utilFile.name : 'Select Raw Image Input'}
                      </span>
                      <span className="text-gray-400 uppercase text-[9px] max-w-xs text-center px-4">
                        {utilFile ? 'Change source file' : 'Browse image or drag and drop here'}
                      </span>
                      <input 
                        id="atmos-util-upload-prompt"
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => setUtilFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                )}

                {agentTool === 'audio' && (
                  <div className="mb-3">
                    <AtmosSelect 
                      label="Narrator Voice Voice Model"
                      value={voice}
                      onChange={(e) => setVoice(e.target.value)}
                      options={[
                        { label: 'Echo (Male, Neutral)', value: 'Echo (Male, Neutral)' },
                        { label: 'Alloy (Female, Warm)', value: 'Alloy (Female, Warm)' },
                        { label: 'Onyx (Male, Deep)', value: 'Onyx (Male, Deep)' },
                        { label: 'Nova (Female, Upbeat)', value: 'Nova (Female, Upbeat)' }
                      ]}
                    />
                  </div>
                )}

                <AtmosButton 
                  onClick={() => {
                     if (agentTool === 'image') handleGenerateImage();
                     else if (agentTool === 'audio') handleGenerateAudio();
                     else handleUtils(agentTool);
                  }}
                  disabled={isGenerating || ((agentTool === 'image' && !imgPrompt.trim()) || (agentTool === 'audio' && !audioScript.trim()) || ((agentTool === 'bg_remove' || agentTool === 'upscale') && !utilFile))}
                  className="w-full py-3 text-xs uppercase tracking-wider font-bold"
                >
                  {isGenerating ? 'Synthesizing Atmos Assets...' : 'Cook Atmos Generation'}
                </AtmosButton>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IMAGE GENERATION DETAILED */}
        {activeTab === 'image' && (
          <div className="max-w-xl mx-auto flex flex-col space-y-6">
            <AtmosCard variant="white">
              <h3 className="font-semibold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-6">
                <Sparkles className="w-4 h-4 text-gray-900" /> Dynamic Visual Synthesis
              </h3>
              
              <div className="space-y-4">
                <AtmosTextArea 
                  label="Prompt Description"
                  placeholder="Describe the image, art style, subject, vectors, lighting, and palette..."
                  value={imgPrompt}
                  onChange={(e) => setImgPrompt(e.target.value)}
                  rows={4}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AtmosSelect 
                    label="Aspect Ratio Card"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    options={[
                      { label: '16:9 (Cinematic/Wide)', value: '16:9' },
                      { label: '9:16 (Phone Screen/TikTok)', value: '9:16' },
                      { label: '1:1 (Square/Grid)', value: '1:1' }
                    ]}
                  />

                  <AtmosSelect 
                    label="Visual Preset Art Style"
                    value={imgStyle}
                    onChange={(e) => setImgStyle(e.target.value)}
                    options={[
                      { label: 'Photorealistic', value: 'Photorealistic' },
                      { label: 'Vector Sketch', value: 'Vector Sketch' },
                      { label: 'Minimalist Line Art', value: 'Minimalist Line Art' },
                      { label: '3D Render', value: '3D Render' }
                    ]}
                  />
                </div>

                <div className="pt-4">
                  <AtmosButton 
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !imgPrompt.trim()}
                    className="w-full py-4 text-xs font-bold uppercase tracking-widest"
                  >
                    {isGenerating ? 'Cooking AI Pixels...' : 'Generate High-Fi Visual Asset'}
                  </AtmosButton>
                </div>
              </div>
            </AtmosCard>
          </div>
        )}

        {/* TAB 3: AUDIO VOICE OVER GENERATION */}
        {activeTab === 'audio' && (
          <div className="max-w-xl mx-auto flex flex-col space-y-6">
            <AtmosCard variant="white">
              <h3 className="font-semibold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-6">
                <Music className="w-4 h-4 text-gray-900" /> Audio Narration Engine
              </h3>
              
              <div className="space-y-4">
                <AtmosTextArea 
                  label="Narration Script / Text"
                  placeholder="Type the script for the AI narrator. Try dividing paragraphs with pauses..."
                  value={audioScript}
                  onChange={(e) => setAudioScript(e.target.value)}
                  rows={4}
                />

                <AtmosSelect 
                  label="Narrator Voice Voice Model"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  options={[
                    { label: 'Echo (Male, Neutral)', value: 'Echo (Male, Neutral)' },
                    { label: 'Alloy (Female, Warm)', value: 'Alloy (Female, Warm)' },
                    { label: 'Onyx (Male, Deep)', value: 'Onyx (Male, Deep)' },
                    { label: 'Nova (Female, Upbeat)', value: 'Nova (Female, Upbeat)' }
                  ]}
                />

                <div className="pt-4">
                  <AtmosButton 
                    onClick={handleGenerateAudio}
                    disabled={isGenerating || !audioScript.trim()}
                    className="w-full py-4 text-xs font-bold uppercase tracking-widest"
                  >
                    {isGenerating ? 'Narrating Script Track...' : 'Bake Narration Stem'}
                  </AtmosButton>
                </div>
              </div>
            </AtmosCard>
          </div>
        )}

        {/* TAB 4: WORKSPACE UTILS */}
        {activeTab === 'utils' && (
          <div className="max-w-xl mx-auto flex flex-col space-y-6">
            <AtmosCard variant="white">
              <h3 className="font-semibold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-6">
                <Scissors className="w-4 h-4 text-gray-900" /> Toolbox Actions
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Source Image Input</label>
                  <div 
                    className="w-full h-36 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-[#f5f5f5] hover:bg-gray-100 relative cursor-pointer transition-all"
                    onClick={() => document.getElementById('atmos-util-upload-detail')?.click()}
                  >
                    <span className="text-gray-700 uppercase text-xs font-bold select-none">
                      {utilFile ? utilFile.name : 'Click to browse image file'}
                    </span>
                    <span className="text-gray-400 text-[10px] mt-1 select-none font-medium">
                      Supports JPEG, PNG, WEBP files
                    </span>
                    <input 
                      id="atmos-util-upload-detail"
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => setUtilFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <AtmosButton 
                    variant="secondary"
                    onClick={() => handleUtils('bg_remove')}
                    disabled={isGenerating || !utilFile}
                    className="flex-1 py-4 text-[11px] font-bold uppercase tracking-wider"
                  >
                    {isGenerating ? 'Processing...' : 'Remove Background'}
                  </AtmosButton>
                  <AtmosButton 
                    onClick={() => handleUtils('upscale')}
                    disabled={isGenerating || !utilFile}
                    className="flex-1 py-4 text-[11px] font-bold uppercase tracking-wider"
                  >
                    {isGenerating ? 'Upscaling image...' : 'SuperResolution (4x)'}
                  </AtmosButton>
                </div>
              </div>
            </AtmosCard>
          </div>
        )}

        {/* TAB 5: VAULT / LIBRARY */}
        {activeTab === 'library' && (
          <div className="flex flex-col space-y-6">
            <div className="bg-[#f5f5f5] border border-gray-100 rounded-2xl p-4 flex gap-3 text-gray-800 text-xs leading-relaxed">
              <Info className="w-5 h-5 text-gray-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider mb-0.5">Integration Reference:</p>
                <p className="font-medium text-gray-500">Copy the asset identifier (e.g. <b>@img_abc12</b>) and type it into any visual prompt to automatically map and overlay assets directly onto your composition layers.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {savedMedia.length === 0 ? (
                <div className="col-span-full text-center py-24 text-gray-400 uppercase text-xs">
                  Your asset vault is completely empty.
                </div>
              ) : (
                savedMedia.map((media) => (
                  <AtmosCard key={media.id} variant="white" className="group relative overflow-hidden h-fit">
                    <div className="aspect-square relative w-full border-b border-gray-50 flex items-center justify-center p-2 bg-[#f5f5f5] rounded-xl">
                       {media.content.includes('ogg') || media.content.includes('audio') ? (
                          <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                            <span className="text-3xl">🔊</span>
                            <span className="uppercase text-[10px] font-mono text-gray-500 tracking-wide font-bold">Audio Stem</span>
                          </div>
                       ) : (
                          <img src={media.content} alt={media.name} className="max-w-full max-h-full object-contain rounded-lg" />
                       )}
                    </div>

                    {/* Delete flat button */}
                    <button 
                      onClick={(e) => handleDeleteMedia(media.id, e)}
                      className="absolute top-8 right-8 bg-[#f5f5f5] hover:bg-red-50 hover:text-red-600 text-gray-500 p-2 rounded-xl border border-gray-100 transition-all cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="pt-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-800 truncate pr-2">{media.name}</span>
                      <button 
                        type="button"
                        onClick={() => handleCopyId(media.name, media.id)}
                        className="text-[9px] font-bold tracking-wider uppercase border border-gray-200 px-2.5 py-1 rounded-full hover:bg-gray-50 transition-colors shrink-0 flex items-center gap-1 cursor-pointer bg-white"
                      >
                        {copiedId === media.id ? <Check className="w-2.5 h-2.5 text-green-600" /> : <Copy className="w-2.5 h-2.5 text-gray-400" />}
                        {copiedId === media.id ? 'Copied' : 'ID'}
                      </button>
                    </div>
                  </AtmosCard>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
