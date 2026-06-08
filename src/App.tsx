/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, ListChecks, PanelLeftClose, PanelLeftOpen, Sparkle } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import PlayerPane from './components/PlayerPane';
import StudioPane from './components/StudioPane';
import HomeInterface from './components/HomeInterface';
import Sidebar from './components/Sidebar';
import AgentInterface from './components/AgentInterface';
import MarketplaceInterface from './components/MarketplaceInterface';
import ToolsInterface from './components/ToolsInterface';
import VideoPreviewThumbnail from './components/VideoPreviewThumbnail';
import CloudPromoModal from './components/CloudPromoModal';
import { Message, RemotionData, ChatResponse, Source, SavedMedia, SavedVideo, VideoFolder } from './types';
import WaitlistPage from './components/auth/WaitlistPage';
import EnterCodePage from './components/auth/EnterCodePage';
import LoginPage from './components/auth/LoginPage';
import { PlayIcon as Play, AiGenerativeIcon } from 'hugeicons-react';
import PrivacyPage from './components/auth/PrivacyPage';
import TermsPage from './components/auth/TermsPage';
import SuperAtmosTrailer from './components/SuperAtmosTrailer';

export function MainApp() {
  const [appMode, setAppMode] = useState<'home' | 'editor' | 'agent'>('home');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string>('Plan');
  const [activeTab, setActiveTab] = useState<'create' | 'super-atmos' | 'marketplace' | 'tools'>('create');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [hasPickedModel, setHasPickedModel] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dataHistory, setDataHistory] = useState<RemotionData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'studio'>('preview');

  const [isSearching, setIsSearching] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);

  const modelOptions = ['auto', 'Agent', 'plan', 'lite 3.1', 'flash 3.5', 'pro 3.1', 'kimi 2.6'];
  const modelTabs = ['auto', 'Agent', 'plan'];
  const isGeminiModel = (name: string) => ['lite 3.1', 'flash 3.5', 'pro 3.1'].includes(name);

  const renderModelIcon = (name: string) => {
    if (isGeminiModel(name)) {
      return (
        <svg viewBox="0 0 512 512" className="h-4 w-4 fill-current text-black" aria-hidden="true">
          <path d="M32.582 370.734C15.127 336.291 5.12 297.425 5.12 256c0-41.426 10.007-80.291 27.462-114.735C74.705 57.484 161.047 0 261.12 0c69.12 0 126.836 25.367 171.287 66.793l-73.31 73.309c-26.763-25.135-60.276-38.168-97.977-38.168-66.56 0-123.113 44.917-143.36 105.426-5.12 15.36-8.146 31.65-8.146 48.64 0 16.989 3.026 33.28 8.146 48.64l-.303.232h.303c20.247 60.51 76.8 105.426 143.36 105.426 34.443 0 63.534-9.31 86.341-24.67 27.23-18.152 45.382-45.148 51.433-77.032H261.12v-99.142h241.105c3.025 16.757 4.654 34.211 4.654 52.364 0 77.963-27.927 143.592-76.334 188.276-42.356 39.098-100.305 61.905-169.425 61.905-100.073 0-186.415-57.483-228.538-141.032v-.233z" />
        </svg>
      );
    }
    if (name === 'kimi 2.6') {
      return (
        <svg viewBox="0 0 512 512" className="h-4 w-4" aria-hidden="true">
          <path d="M503 114.333v280c0 60.711-49.29 110-110 110H113c-60.711 0-110-49.289-110-110v-280c0-60.71 49.289-110 110-110h280c60.71 0 110 49.29 110 110z" />
          <path d="M342.065 189.759c1.886-2.42 3.541-4.63 5.289-6.77.81-1.007.74-1.771-.046-2.824-7.58-9.965-8.298-21.028-3.935-32.254 3.275-8.448 10.52-12.406 19.373-13.25 5.52-.521 10.936.046 15.959 2.73 6.596 3.53 10.438 8.912 11.688 16.341.995 5.926.81 11.712-.868 17.452-2.974 10.161-10.277 15.427-20.287 16.758-8.31 1.11-16.734 1.25-25.113 1.817-.648.046-1.308 0-2.06 0z" fill="#027aff" />
          <path d="M321.512 144.254h-50.064l-39.637 90.384h-56.036v-89.99H131v232.868h44.787v-98.103h78.973c13.598 0 26.015-7.927 31.744-20.252v118.355h44.787v-98.103c0-23.342-18.239-42.97-41.523-44.671v-.116h-24.593a45.577 45.577 0 0026.884-24.534l29.453-65.838z" fill="#fff" />
        </svg>
      );
    }
    if (name === 'Agent') return <Bot className="h-4 w-4 text-black" strokeWidth={2} />;
    if (name === 'plan') return <ListChecks className="h-4 w-4 text-black" strokeWidth={2} />;
    return <Sparkle className="h-4 w-4 text-black" strokeWidth={2} />;
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
    setAiModel(model);
    setHasPickedModel(true);
    setIsModelMenuOpen(false);
  };
  
  const [savedMedia, setSavedMedia] = useState<SavedMedia[]>(() => {
    try {
      const saved = localStorage.getItem('savedMedia');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>(() => {
    try {
      const saved = localStorage.getItem('savedVideos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedFolders, setSavedFolders] = useState<VideoFolder[]>(() => {
    try {
      const saved = localStorage.getItem('savedFolders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showCloudPromo, setShowCloudPromo] = useState(false);
  const [hasLoadedFromCloud, setHasLoadedFromCloud] = useState(false);

  useEffect(() => {
    // Only show if user is logged in natively (isOnboarded), they have local data, and haven't seen the promo yet.
    if (localStorage.getItem('isOnboarded') === 'true') {
      const onboardCheck = async () => {
        const email = localStorage.getItem('userEmail');
        
        if (!localStorage.getItem('hasSeenCloudPromo_v2')) {
          const hasLocalData = localStorage.getItem('savedVideos') || localStorage.getItem('savedMedia') || localStorage.getItem('savedFolders');
          if (hasLocalData) {
            setShowCloudPromo(true);
          } else {
            localStorage.setItem('hasSeenCloudPromo_v2', 'true');
          }
        }
        
        // Attempt to load from cloud if they have seen the promo (or are a new user who just got it set to true)
        if (email && localStorage.getItem('hasSeenCloudPromo_v2') === 'true' && !hasLoadedFromCloud) {
          try {
            const res = await fetch(`/api/user-data/${email}`);
            const data = await res.json();
            if (data && data.data) {
              const dbData = data.data;
              if (dbData.savedMedia) setSavedMedia(dbData.savedMedia);
              if (dbData.savedVideos) setSavedVideos(dbData.savedVideos);
              if (dbData.savedFolders) setSavedFolders(dbData.savedFolders);
            }
          } catch(e) {}
          setHasLoadedFromCloud(true);
        }
      };
      onboardCheck();
    }
  }, [hasLoadedFromCloud]);

  const handleLogout = () => {
    localStorage.removeItem('isOnboarded');
    localStorage.removeItem('userEmail');
    window.location.reload();
  };

  const syncToCloud = async (newData: any) => {
    const email = localStorage.getItem('userEmail');
    if (email && localStorage.getItem('hasSeenCloudPromo_v2') === 'true') {
      try {
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            data: newData
          })
        });
      } catch (err) {}
    }
  };

  const handleSyncData = async () => {
    localStorage.setItem('hasSeenCloudPromo_v2', 'true');
    setShowCloudPromo(false);
    await syncToCloud({ savedVideos, savedMedia, savedFolders });
  };

  useEffect(() => {
    localStorage.setItem('savedMedia', JSON.stringify(savedMedia));
    syncToCloud({ savedVideos, savedMedia, savedFolders });
  }, [savedMedia]);

  useEffect(() => {
    localStorage.setItem('savedVideos', JSON.stringify(savedVideos));
    syncToCloud({ savedVideos, savedMedia, savedFolders });
  }, [savedVideos]);

  useEffect(() => {
    localStorage.setItem('savedFolders', JSON.stringify(savedFolders));
    syncToCloud({ savedVideos, savedMedia, savedFolders });
  }, [savedFolders]);

  const currentData = historyIndex >= 0 && historyIndex < dataHistory.length ? dataHistory[historyIndex] : null;

  const handleUndo = () => {
    if (historyIndex > 0) setHistoryIndex(i => i - 1);
  };

  const handleRedo = () => {
    if (historyIndex < dataHistory.length - 1) setHistoryIndex(i => i + 1);
  };

  const handleNewProject = () => {
    setMessages([]);
    setDataHistory([]);
    setHistoryIndex(-1);
    setSources([]);
    setCurrentProjectId(null);
    setAppMode('home');
  };

  const handleOpenSavedVideo = (v: SavedVideo) => {
    if (v.messages && v.messages.length > 0) {
      setDataHistory(v.dataHistory || []);
      setHistoryIndex(v.historyIndex ?? -1);
      setMessages(v.messages);
    } else if (v.code) {
      setDataHistory([{ code: v.code, durationInFrames: v.durationInFrames, fps: v.fps || 30, compositionWidth: v.compositionWidth || 1080, compositionHeight: v.compositionHeight || 1080 }]);
      setHistoryIndex(0);
      setMessages([{ id: Date.now().toString(), role: 'user', text: v.prompt }]);
    }
    setCurrentProjectId(v.id);
    setAppMode('editor');
  };

  useEffect(() => {
    if (currentProjectId) {
      setSavedVideos(prev => 
        prev.map(v => v.id === currentProjectId ? {
          ...v,
          messages,
          dataHistory,
          historyIndex,
          code: currentData?.code || v.code,
          durationInFrames: currentData?.durationInFrames || v.durationInFrames,
          fps: currentData?.fps || v.fps,
          compositionWidth: currentData?.compositionWidth || v.compositionWidth,
          compositionHeight: currentData?.compositionHeight || v.compositionHeight,
        } : v)
      );
    }
  }, [messages, dataHistory, historyIndex, currentProjectId, currentData]);

  const handleSendMessage = async (text: string, length?: number | 'auto', ratio?: string, isChatOnly: boolean = false, activeSkills: string[] = [], mediaFiles: SavedMedia[] = [], modelName?: string) => {
    let finalPrompt = text;
    const currentModel = modelName || aiModel;
    if (modelName) setAiModel(modelName);

    // Auto-detect typed @imagename and attach those SVGs if not explicitly selected
    const additionalMedia = savedMedia.filter(m => text.includes(`@${m.name}`) && !mediaFiles.some(f => f.id === m.id));
    const allMediaForPrompt = [...mediaFiles, ...additionalMedia];

    if (currentModel === 'Agent Mode' && appMode === 'home') {
       // Switch to agent mode
       setActiveTab('agent' as any);
       setIsSidebarCollapsed(true);
       setMessages([{ id: Date.now().toString(), role: 'user', text: finalPrompt }]);
       return;
    }

    let projectId = currentProjectId;
    if (!projectId) {
      projectId = Date.now().toString();
      setCurrentProjectId(projectId);
      setSavedVideos(prev => [{
        id: projectId!,
        prompt: finalPrompt,
        date: new Date().toISOString(),
        durationInFrames: 300,
        messages: [],
        dataHistory: [],
        historyIndex: -1
      }, ...prev].slice(0, 20)); // Keep up to 20 recent projects
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: finalPrompt };
    setMessages(prev => [...prev, userMsg]);
    if (appMode === 'home') {
      setAppMode('editor');
    }
    setIsLoading(true);
    
    let currentSources: Source[] = [];
    
    // Search is now handled entirely by the backend AI if it chooses to run it
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.slice(1).map(m => ({ role: m.role, text: m.text })),
          prompt: finalPrompt,
          sources: currentSources,
          isChatOnly,
          activeSkills,
          mediaFiles: allMediaForPrompt,
          modelName: currentModel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data: ChatResponse = await response.json();
      
      const modelMsg: Message = { 
        id: Date.now().toString(), 
        role: 'model', 
        text: data.textResponse,
        clarificationQuestion: data.clarificationQuestion,
        planApproval: data.planApproval
      };
      setMessages(prev => [...prev, modelMsg]);
      
      if (data.remotionCode && data.remotionCode.trim() !== '') {
        const newData = {
          code: data.remotionCode,
          durationInFrames: data.durationInFrames,
          fps: data.fps,
          compositionWidth: data.compositionWidth,
          compositionHeight: data.compositionHeight,
          prompt: finalPrompt
        };
        setDataHistory(prev => {
          const newHistory = [...prev.slice(0, historyIndex + 1), newData];
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        });
      } else if (data.planMarkdown && data.planMarkdown.trim() !== '') {
        const newData = {
          code: '',
          durationInFrames: 0,
          fps: 0,
          planMarkdown: data.planMarkdown,
          sources: data.sources || currentSources,
          prompt: finalPrompt
        };
        setDataHistory(prev => {
          const newHistory = [...prev.slice(0, historyIndex + 1), newData];
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Sorry, I encountered an error predicting the animation structure.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {appMode === 'home' ? (
        <motion.div 
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex h-screen w-full bg-white font-sans text-gray-900 border-none absolute inset-0"
        >
          <CloudPromoModal 
            isOpen={showCloudPromo}
            onClose={() => setShowCloudPromo(false)}
            onLogout={handleLogout}
            onSync={handleSyncData}
          />
          <motion.div
            initial={false}
            animate={{ 
              width: isSidebarCollapsed ? 0 : 72,
              opacity: isSidebarCollapsed ? 0 : 1
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full overflow-hidden flex-shrink-0"
          >
            <div className="w-[72px] h-full">
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} savedVideos={savedVideos} onOpenVideo={handleOpenSavedVideo} />
            </div>
          </motion.div>
          <div className="flex-1 flex transition-all duration-300">
            <div className="flex-1 bg-white flex items-center justify-center overflow-hidden w-full h-full relative">
              <div className="absolute left-4 top-4 z-50 flex items-start gap-3">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  id="collapse-sidebar-btn"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:scale-95 md:h-10 md:w-10"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                  ) : (
                    <PanelLeftClose className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                  )}
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModelMenuOpen(prev => !prev)}
                    className="flex h-10 min-w-[132px] items-center gap-2 rounded-[24px] bg-gray-100 px-4 text-[14px] font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    style={{ cornerShape: 'superellipse(2)' } as React.CSSProperties}
                  >
                    {hasPickedModel && renderModelIcon(aiModel)}
                    <span>{hasPickedModel ? renderModelLabel(aiModel) : 'Model'}</span>
                  </button>

                  {isModelMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-[232px] rounded-[18px] border border-gray-200 bg-white p-2">
                      <div className="mb-2 flex w-full rounded-full bg-gray-100 p-1">
                        {modelTabs.map(model => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => chooseModel(model)}
                            className={`flex h-7 flex-1 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                              aiModel === model ? 'bg-white text-black' : 'bg-transparent text-gray-500 hover:text-gray-900'
                            }`}
                          >
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
                            {aiModel === model && <ListChecks className="h-3.5 w-3.5 text-gray-500" strokeWidth={2.2} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'create' && (
                  <motion.div 
                    key="create"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    <HomeInterface 
                      onSendMessage={handleSendMessage} 
                      isLoading={isLoading} 
                      savedMedia={savedMedia}
                      setSavedMedia={setSavedMedia}
                      savedVideos={savedVideos}
                      aiModel={aiModel}
                      setAiModel={setAiModel}
                      onOpenVideo={handleOpenSavedVideo}
                    />
                  </motion.div>
                )}
                {activeTab === 'super-atmos' && (
                  <motion.div
                    key="super-atmos"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden"
                  >
                    <SuperAtmosTrailer />
                  </motion.div>
                )}
                {activeTab === 'marketplace' && (
                  <motion.div 
                    key="marketplace"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    <MarketplaceInterface 
                      savedVideos={savedVideos}
                      savedFolders={savedFolders}
                      onOpenTemplate={(code, prompt, durationInFrames) => {
                        const newProjectId = Date.now().toString();
                        const newHistory = [{ code, durationInFrames, fps: 30, compositionWidth: 1080, compositionHeight: 1080 }];
                        const newMessages: Message[] = [{ id: Date.now().toString(), role: 'user', text: prompt }];
                        
                        setDataHistory(newHistory);
                        setHistoryIndex(0);
                        setMessages(newMessages);
                        setCurrentProjectId(newProjectId);
                        
                        setSavedVideos(prev => [{
                          id: newProjectId,
                          prompt: prompt,
                          date: new Date().toISOString(),
                          durationInFrames: durationInFrames,
                          code: code,
                          fps: 30,
                          compositionWidth: 1080,
                          compositionHeight: 1080,
                          messages: newMessages,
                          dataHistory: newHistory,
                          historyIndex: 0
                        }, ...prev].slice(0, 20));

                        setAppMode('editor');
                      }}
                      onOpenVideo={handleOpenSavedVideo}
                      onCreateFolder={(name, color) => {
                        setSavedFolders(prev => [{ id: Date.now().toString(), name, color, videoIds: [] }, ...prev]);
                      }}
                      onDropToFolder={(videoId, folderId) => {
                        setSavedFolders(prev => prev.map(f => {
                          if (f.id === folderId) {
                            return { ...f, videoIds: Array.from(new Set([...f.videoIds, videoId])) };
                          }
                          return f;
                        }));
                      }}
                      onOpenFolder={(folderId) => {
                         // folder open handled inside MyVideosInterface logically
                      }}
                    />
                  </motion.div>
                )}
                {activeTab === 'tools' && (
                  <motion.div
                    key="tools"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    <ToolsInterface savedMedia={savedMedia} setSavedMedia={setSavedMedia} />
                  </motion.div>
                )}
                {activeTab === 'agent' as any && (
                  <motion.div
                    key="agent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    <AgentInterface 
                      initialPrompt={messages.length > 0 ? messages[0].text : ''} 
                      messages={messages} 
                      setMessages={setMessages} 
                      onPlayVideo={(v) => {
                         const newProjectId = Date.now().toString();
                         const newHistory = [{ code: v.code, durationInFrames: v.durationInFrames, fps: v.fps, compositionWidth: v.compositionWidth, compositionHeight: v.compositionHeight }];
                         
                         setDataHistory(newHistory);
                         setHistoryIndex(0);
                         setCurrentProjectId(newProjectId);
                         
                         setSavedVideos(prev => [{
                           id: newProjectId,
                           prompt: v.prompt,
                           date: new Date().toISOString(),
                           durationInFrames: v.durationInFrames,
                           code: v.code,
                           fps: v.fps,
                           compositionWidth: v.compositionWidth,
                           compositionHeight: v.compositionHeight,
                           messages: messages,
                           dataHistory: newHistory,
                           historyIndex: 0
                         }, ...prev].slice(0, 20));

                         setAppMode('editor');
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="editor"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-screen w-full overflow-hidden bg-white font-sans text-gray-900 absolute inset-0"
        >
          <div className="w-[420px] flex-shrink-0 relative z-10">
            <div className="w-full h-full overflow-hidden bg-white flex flex-col">
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
                onNewProject={handleNewProject}
                savedMedia={savedMedia}
                setSavedMedia={setSavedMedia}
                aiModel={aiModel}
                setAiModel={setAiModel}
              />
            </div>
          </div>
          <div className="flex-1 relative z-0 flex flex-col">
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 flex gap-1 z-50 bg-gray-100 p-1 rounded-full">
              <div 
                className={`${viewMode === 'preview' ? 'bg-white text-gray-900' : 'bg-transparent hover:text-gray-900 text-gray-500'} px-5 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors`}
                onClick={() => setViewMode('preview')}
              >
                Preview
              </div>
              <div 
                className={`${viewMode === 'studio' ? 'bg-white text-gray-900' : 'bg-transparent hover:text-gray-900 text-gray-500'} px-5 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors`}
                onClick={() => setViewMode('studio')}
              >
                Tools
              </div>
            </div>
            <div className="w-full h-full flex flex-col relative z-20">
              {viewMode === 'preview' ? (
                <PlayerPane 
                  data={currentData} 
                  isLoading={isLoading} 
                  isSearching={isSearching}
                  sources={sources}
                  onSendMessage={handleSendMessage} 
                  historyIndex={historyIndex}
                  historyLength={dataHistory.length}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                />
              ) : (
                <StudioPane 
                  data={currentData} 
                  savedMedia={savedMedia}
                  setSavedMedia={setSavedMedia}
                  savedVideos={savedVideos}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'waitlist' | 'enter-code' | 'login' | 'app' | 'privacy' | 'terms'>('waitlist');

  useEffect(() => {
    if (localStorage.getItem('isOnboarded') === 'true') {
      setCurrentPage('app');
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      {currentPage === 'waitlist' && (
        <motion.div key="waitlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
          <WaitlistPage onNavigate={setCurrentPage} />
        </motion.div>
      )}
      {currentPage === 'enter-code' && (
        <motion.div key="enter-code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
          <EnterCodePage onNavigate={setCurrentPage} />
        </motion.div>
      )}
      {currentPage === 'login' && (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
          <LoginPage onNavigate={setCurrentPage} />
        </motion.div>
      )}
      {currentPage === 'app' && (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <MainApp />
        </motion.div>
      )}
      {currentPage === 'privacy' && (
        <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
          <PrivacyPage onNavigate={() => setCurrentPage('waitlist')} />
        </motion.div>
      )}
      {currentPage === 'terms' && (
        <motion.div key="terms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
          <TermsPage onNavigate={() => setCurrentPage('waitlist')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

