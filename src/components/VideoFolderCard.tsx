import React, { useState } from 'react';
import { VideoFolder, SavedVideo } from '../types';
import { FolderIcon, MoreVertical, Settings } from 'lucide-react';
import VideoPreviewThumbnail from './VideoPreviewThumbnail';

interface Props {
  folder: VideoFolder;
  videos: SavedVideo[];
  onOpenFolder: () => void;
  onDropVideo: (videoId: string) => void;
}

export default function VideoFolderCard({ folder, videos, onOpenFolder, onDropVideo }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    setIsOpen(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOpen(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const videoId = e.dataTransfer.getData('text/plain');
    if (videoId) {
      onDropVideo(videoId);
    }
  };

  const folderVideos = videos.filter(v => folder.videoIds?.includes(v.id));

  // Determine colors based on folder.color
  const backColor = folder.color || '#5d5ded';
  const frontGradient = `linear-gradient(0deg, ${folder.color || '#4747f5'} 0%, ${folder.color || '#8D8DF7'} 90%)`;
  const openFrontGradient = `linear-gradient(0deg, ${folder.color || '#4747f5'} 0%, ${folder.color || '#8D8DF7'} 60%)`;

  return (
    <div 
      className={`relative [perspective:800px] flex-shrink-0 w-[240px] h-[180px] cursor-pointer ${isOpen ? 'group is-open' : 'group'}`}
      onClick={onOpenFolder}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
         '--folder-back': backColor,
         '--folder-front': frontGradient,
         '--folder-front-open': openFrontGradient
      } as React.CSSProperties}
    >
      {/* Back flap */}
      <div 
        className="w-full h-full rounded-[20px] relative"
        style={{ backgroundColor: 'var(--folder-back)' }}
      >
        {/* Tab */}
        <div 
          className="absolute w-[140px] h-[35px] -top-[18px] rounded-[20px_40px_0_0]"
          style={{ 
             backgroundColor: 'var(--folder-back)',
             clipPath: 'polygon(0% 0%, 50% 0%, 100% 100%, 0% 100%)'
          }}
        />
      </div>

      {/* Files spilling out */}
      <div 
        className={`absolute bottom-0 left-[15px] w-[210px] bg-white rounded-xl p-[10px_15px] transition-transform duration-300 pointer-events-none p-3
        ${isOpen ? 'translate-y-[-24px]' : 'translate-y-0 h-[140px]'}`}
        style={{ height: isOpen ? '160px' : '140px' }}
      >
        <h5 className="text-[14px] pb-[4px] mb-[4px] border-b border-[#f9f9f9] text-gray-800 font-semibold truncate">
          {folder.name}
        </h5>
        
        <ul className="list-none flex flex-col gap-1.5 mt-1.5">
           {folderVideos.slice(0, 3).map(video => (
             <li key={video.id} className="flex gap-2 text-[12px] items-center text-gray-600 truncate">
                <div className="w-[6px] h-[6px] rounded-full bg-blue-400 shrink-0" />
                <span className="truncate">{video.prompt || 'Untitled'}</span>
             </li>
           ))}
           {folderVideos.length === 0 && (
             <div className="text-gray-400 text-xs italic mt-3 text-center">Empty</div>
           )}
        </ul>
        
        {folderVideos.length > 3 && (
          <span className="text-[10px] pt-[6px] mt-[6px] border-t border-[#f9f9f9] flex text-gray-500">
            +{folderVideos.length - 3} more
          </span>
        )}
      </div>

      {/* Front flap */}
      <div 
        className="absolute p-4 flex flex-col justify-between text-white origin-top transition-all duration-300 rounded-[20px]"
        style={{ 
           width: '100%',
           height: isOpen ? '135px' : '155px',
           bottom: isOpen ? '-18px' : '0',
           transform: isOpen ? 'rotateX(-20deg) scaleX(1.05)' : 'rotateX(0deg) scaleX(1)',
           background: isOpen ? 'var(--folder-front-open)' : 'var(--folder-front)'
        }}
      >
        <div className="flex justify-between w-full relative z-10">
          <div className="flex flex-col">
            <h6 className="text-[20px] font-bold tracking-tight">{folder.name}</h6>
            <span className="text-white/80 text-xs mt-1">Playlist</span>
          </div>
          <div className="flex gap-1 text-[18px] text-white/90">
            <Settings size={18} />
          </div>
        </div>
        <div className="text-[13px] font-medium mt-auto relative z-10">{folderVideos.length} Videos</div>
      </div>
    </div>
  );
}
