import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SavedVideo, VideoFolder } from '../types';
import VideoPreviewThumbnail from './VideoPreviewThumbnail';
import VideoFolderCard from './VideoFolderCard';
import { Plus, Search, Folder } from 'lucide-react';

interface Props {
  savedVideos: SavedVideo[];
  savedFolders: VideoFolder[];
  onOpenVideo: (v: SavedVideo) => void;
  onCreateFolder: (name: string, color: string) => void;
  onDropToFolder: (videoId: string, folderId: string) => void;
  onOpenFolder: (folderId: string) => void;
}

const COLORS = [
  '#4747f5', // Blue
  '#f54747', // Red
  '#47f547', // Green
  '#f5a147', // Orange
  '#f547c1', // Pink
  '#a147f5', // Purple
  '#47f5e8', // Cyan
  '#333333', // Dark
];

export default function MyVideosInterface({ savedVideos, savedFolders, onOpenVideo, onCreateFolder, onDropToFolder, onOpenFolder }: Props) {
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(COLORS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderColor);
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const activeFolder = savedFolders.find(f => f.id === activeFolderId);
  const visibleVideos = activeFolder 
      ? savedVideos.filter(v => activeFolder.videoIds.includes(v.id) && v.prompt?.toLowerCase().includes(searchQuery.toLowerCase()))
      : savedVideos.filter(v => v.prompt?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col w-full h-full pt-8 px-12 overflow-y-auto scrollbar-none pb-24 relative">
      
      {/* Header section */}
      <div className="flex justify-between items-start w-full max-w-7xl mx-auto mb-10">
        <div className="flex flex-col gap-3">
          <div>
            {!activeFolder ? (
               <>
                 <h2 className="text-3xl font-medium tracking-tight text-gray-900">My Videos</h2>
                 <p className="text-gray-500 mt-1">Your drafts and completed videos</p>
               </>
            ) : (
               <div className="flex items-center gap-2">
                 <button onClick={() => setActiveFolderId(null)} className="text-gray-500 hover:text-gray-900 font-medium">My Videos</button>
                 <span className="text-gray-300">/</span>
                 <h2 className="text-3xl font-medium tracking-tight pb-1" style={{color: activeFolder.color}}>{activeFolder.name}</h2>
               </div>
            )}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-[#f5f5f5] rounded-full text-sm outline-none w-64 placeholder:text-gray-400"
            />
          </div>
        </div>
        
        {!activeFolder && (
          <button 
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-2 bg-[#f5f5f5] hover:bg-[#eaeaea] transition-colors px-4 py-2 rounded-full text-sm font-medium text-gray-700"
          >
            <Plus size={16} />
            New folder
          </button>
        )}
      </div>

      {/* Folders row */}
      {!activeFolder && savedFolders.length > 0 && (
        <div className="w-full max-w-7xl mx-auto mb-12">
          <div className="flex gap-8 overflow-x-auto pb-6 pt-4 scrollbar-none px-4 -mx-4">
            {savedFolders.map((folder, index) => (
              <motion.div
                key={folder.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 + 0.1, ease: 'easeOut' }}
              >
                <VideoFolderCard 
                  folder={folder} 
                  videos={savedVideos} 
                  onOpenFolder={() => setActiveFolderId(folder.id)}
                  onDropVideo={(videoId) => onDropToFolder(videoId, folder.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Grid */}
      <div className="w-full max-w-7xl mx-auto">
         <h3 className="text-lg font-medium tracking-tight text-gray-900 mb-6">{activeFolder ? `Videos in ${activeFolder.name}` : 'Recent Videos'}</h3>
         {(visibleVideos.length > 0) ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
               {visibleVideos.map((v, index) => (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.3, delay: index * 0.03 + 0.2, ease: 'easeOut' }}
                   draggable 
                   onDragStart={(e: any) => e.dataTransfer.setData('text/plain', v.id)}
                   key={v.id} 
                   className="flex flex-col group cursor-pointer" 
                   onClick={() => onOpenVideo(v)}
                 >
                   <VideoPreviewThumbnail video={v} />
                   <div className="mt-3 px-1 flex flex-col gap-1">
                     <span className="text-gray-900 text-[13px] font-medium line-clamp-2 leading-snug">{v.prompt || "Untitled"}</span>
                     <span className="text-gray-500 text-[11px] uppercase tracking-widest">{Math.round((v.durationInFrames || 300) / 30)}S</span>
                   </div>
                 </motion.div>
               ))}
             </div>
          ) : (
            <div className="text-gray-500 text-sm">No videos found.</div>
          )}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-[320px] flex flex-col gap-4">
            <h3 className="font-semibold text-lg text-gray-900">Create new folder</h3>
            <input 
              type="text" 
              autoFocus
              placeholder="e.g. Social Media Ads"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
               {COLORS.map(c => (
                 <button 
                   key={c}
                   onClick={() => setNewFolderColor(c)}
                   style={{ backgroundColor: c }}
                   className={`w-6 h-6 rounded-full border-2 ${newFolderColor === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                 />
               ))}
            </div>
            
            <div className="flex gap-2 justify-end mt-2">
              <button 
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFolder}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-800"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
