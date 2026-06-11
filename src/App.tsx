/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import HomeInterface from './components/HomeInterface';
import Sidebar from './components/Sidebar';
import AgentInterface from './components/AgentInterface';
import MarketplaceInterface from './components/MarketplaceInterface';
import VideoPreviewThumbnail from './components/VideoPreviewThumbnail';
import CloudPromoModal from './components/CloudPromoModal';
import { Message, RemotionData, ChatResponse, Source, SavedMedia, SavedVideo, VideoFolder } from './types';
import WaitlistPage from './components/auth/WaitlistPage';
import EnterCodePage from './components/auth/EnterCodePage';
import LoginPage from './components/auth/LoginPage';
import { PlayIcon as Play, AiGenerativeIcon, SidebarLeft01Icon } from 'hugeicons-react';
import PrivacyPage from './components/auth/PrivacyPage';
import TermsPage from './components/auth/TermsPage';
import SuperAtmosTrailer from './components/SuperAtmosTrailer';

export function MainApp() {
  const [appMode, setAppMode] = useState<'home' | 'agent'>('home');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string>('Agent');
  const [activeTab, setActiveTab] = useState<'create' | 'super-atmos' | 'marketplace'>('create');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dataHistory, setDataHistory] = useState<RemotionData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'studio'>('preview');

  const [isSearching, setIsSearching] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);

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
    setAppMode('agent');
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
    if (modelName) setAiModel(modelName);
    setMessages([{ id: Date.now().toString(), role: 'user', text }]);
    setAppMode('agent');
    setIsSidebarCollapsed(true);
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
                  <SidebarLeft01Icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                </button>
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

                        setAppMode('agent');
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

              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ) : appMode === 'agent' ? (
        <motion.div 
          key="agent-full"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-screen w-full overflow-hidden bg-white font-sans text-gray-900 absolute inset-0"
        >
          <AgentInterface 
            initialPrompt={messages.length > 0 ? messages[0].text : ''} 
            messages={messages} 
            setMessages={setMessages} 
          />
        </motion.div>
      ) : null}
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

