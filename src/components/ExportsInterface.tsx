import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SavedVideo } from '../types';
import VideoPreviewThumbnail from './VideoPreviewThumbnail';
import { Clock, Monitor, FileVideo, Download, Edit, Play } from 'lucide-react';

interface Props {
  savedVideos: SavedVideo[];
  onOpenVideo: (v: SavedVideo) => void;
}

export default function ExportsInterface({ savedVideos, onOpenVideo }: Props) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-100 flex items-center justify-between px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Exports</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {savedVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No exports yet</h2>
            <p className="max-w-md">Your exported videos will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {savedVideos.map((video) => (
              <div 
                key={video.id} 
                className="bg-[#f5f5f5] rounded-[24px] p-1.5 flex items-stretch gap-5 transition-colors cursor-default"
              >
                {/* Thumbnail */}
                <div 
                  className="w-[200px] flex-shrink-0 h-[130px] rounded-[20px] overflow-hidden bg-gray-200 cursor-pointer"
                  onClick={() => onOpenVideo(video)}
                >
                  <VideoPreviewThumbnail 
                    video={video} 
                  />
                </div>
                
                {/* Information */}
                <div className="flex-1 py-4 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-4">
                    {video.prompt || "Untitled Video"}
                  </h3>
                  <div className="flex items-center gap-6 text-[#6B7280] font-medium">
                    <div className="flex items-center gap-2.5">
                       <Clock className="w-5 h-5 text-[#858b97]" />
                       <span className="text-[15px]">{Math.round(((video.durationInFrames || 300) / (video.fps || 30)) * 10) / 10}s</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                       <Monitor className="w-5 h-5 text-[#858b97]" />
                       <span className="text-[15px]">
                         {video.compositionWidth && video.compositionHeight 
                            ? (video.compositionWidth === video.compositionHeight ? '1:1' 
                               : video.compositionWidth > video.compositionHeight ? '16:9' : '9:16')
                            : '16:9'}
                       </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                       <FileVideo className="w-5 h-5 text-[#858b97]" />
                       <span className="text-[15px]">MP4</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-center pr-2 py-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="flex text-[13px] font-bold items-center justify-center gap-2 bg-[#e8e8e8] text-gray-800 hover:bg-[#dce0e5] hover:text-gray-900 rounded-full px-5 py-2 transition-colors border-none min-w-[120px]"
                  >
                    <Download className="w-[15px] h-[15px]" strokeWidth={2.5} /> Download
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onOpenVideo(video); }}
                    className="flex text-[13px] font-bold items-center justify-center gap-2 bg-[#e8e8e8] text-gray-800 hover:bg-[#dce0e5] hover:text-gray-900 rounded-full px-5 py-2 transition-colors border-none min-w-[120px]"
                  >
                     <Edit className="w-[15px] h-[15px]" strokeWidth={2.5} /> Edit
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="flex text-[13px] font-bold items-center justify-center gap-2 bg-[#e8e8e8] text-gray-800 hover:bg-[#dce0e5] hover:text-gray-900 rounded-full px-5 py-2 transition-colors border-none min-w-[120px]"
                  >
                     <Play className="w-[15px] h-[15px]" strokeWidth={2.5} /> Watch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
