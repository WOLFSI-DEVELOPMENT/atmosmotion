import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DiscoverInterface, { SKILLS_DATA } from './DiscoverInterface';
import MyVideosInterface from './MyVideosInterface';
import { Home01Icon, CodeSquareIcon, UserGroupIcon, FolderLibraryIcon, Search01Icon as Search, PlusSignIcon } from 'hugeicons-react';
import { SavedVideo, VideoFolder } from '../types';

interface MarketplaceProps {
  savedVideos: SavedVideo[];
  savedFolders: VideoFolder[];
  onOpenTemplate: (code: string, prompt: string, durationInFrames: number) => void;
  onOpenVideo: (v: SavedVideo) => void;
  onCreateFolder: (name: string, color: string) => void;
  onDropToFolder: (videoId: string, folderId: string) => void;
  onOpenFolder: (folderId: string) => void;
}

export default function MarketplaceInterface({
  savedVideos,
  savedFolders,
  onOpenTemplate,
  onOpenVideo,
  onCreateFolder,
  onDropToFolder,
  onOpenFolder
}: MarketplaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'skills' | 'community' | 'my-videos'>('all');

  return (
    <div className="w-full h-full relative flex flex-col bg-white">
      {/* Floating Top Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[#f5f5f5] p-1.5 rounded-full flex gap-1 items-center">
           <button 
             onClick={() => setActiveSubTab('all')}
             className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${activeSubTab === 'all' ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
           >
             <Home01Icon className="w-4 h-4" />
             All
           </button>
           <button 
             onClick={() => setActiveSubTab('skills')}
             className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${activeSubTab === 'skills' ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
           >
             <CodeSquareIcon className="w-4 h-4" />
             Skills
           </button>
           <button 
             onClick={() => setActiveSubTab('community')}
             className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${activeSubTab === 'community' ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
           >
             <UserGroupIcon className="w-4 h-4" />
             Community
           </button>
           <button 
             onClick={() => setActiveSubTab('my-videos')}
             className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${activeSubTab === 'my-videos' ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
           >
             <FolderLibraryIcon className="w-4 h-4" />
             My Videos
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full h-full overflow-hidden mt-20">
        <AnimatePresence mode="wait">
           {activeSubTab === 'all' && (
             <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                <DiscoverInterface onOpenTemplate={onOpenTemplate} />
             </motion.div>
           )}
           {activeSubTab === 'skills' && (
             <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col w-full h-full overflow-y-auto scrollbar-none pt-12 pb-24 px-8">
                <div className="max-w-6xl mx-auto w-full flex flex-col gap-10">
                  {/* Hero Search Section */}
                  <div className="w-full flex justify-center pb-6">
                    <div className="flex flex-col items-center gap-6 w-full max-w-[700px] mt-8">
                      <h1 className="text-4xl md:text-[54px] font-black tracking-tight text-gray-900 drop-shadow-sm">Marketplace</h1>
                      <p className="text-lg text-gray-500 font-medium text-center">Add new skills to your agents</p>
                      
                      <div className="w-full relative group mt-4">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pt-0.5 pointer-events-none">
                          <Search className="h-[22px] w-[22px] text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-14 pr-8 py-4.5 bg-gray-100 border-none rounded-full text-[16px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 shadow-none transition-all mx-auto leading-relaxed"
                          placeholder="Search for skills..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="flex flex-col gap-6 pb-24">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">All Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {SKILLS_DATA.map((skill, idx) => (
                        <motion.div 
                          key={skill.id} 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                          className="flex flex-col gap-3 group cursor-pointer"
                        >
                          {/* Visual Card Image */}
                          <div className="w-full aspect-[1.8] rounded-[24px] relative overflow-hidden transition-transform group-hover:scale-[1.02] bg-gray-100 shadow-sm">
                            <img src={skill.image} alt={skill.title} className="absolute inset-0 w-full h-full object-cover" />
                          </div>
                          
                          {/* Text Details Area */}
                          <div className="flex items-start justify-between mt-1 px-1 gap-2">
                            <div className="flex flex-col pr-2">
                              <span className="text-[17px] font-bold text-gray-900 tracking-tight leading-snug">{skill.title}</span>
                              <span className="text-gray-500 text-[14.5px] leading-snug mt-0.5 line-clamp-2">{skill.description}</span>
                            </div>
                            <button className="flex-shrink-0 mt-0.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-medium text-sm gap-1 hover:bg-[#e5e5e5] transition-colors">
                              <PlusSignIcon className="w-4 h-4" />
                              Add
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
             </motion.div>
           )}
           {activeSubTab === 'community' && (
             <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center">
                <UserGroupIcon className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Community Gallery</h3>
                <p className="text-gray-500 mt-2">Coming soon.</p>
             </motion.div>
           )}
           {activeSubTab === 'my-videos' && (
             <motion.div key="my-videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                <MyVideosInterface 
                  savedVideos={savedVideos}
                  savedFolders={savedFolders}
                  onOpenVideo={onOpenVideo}
                  onCreateFolder={onCreateFolder}
                  onDropToFolder={onDropToFolder}
                  onOpenFolder={onOpenFolder}
                />
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </div>
  );
}
