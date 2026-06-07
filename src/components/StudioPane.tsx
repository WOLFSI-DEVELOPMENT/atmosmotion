import React, { useState } from 'react';
import { RemotionData, SavedMedia, SavedVideo } from '../types';
import AtmosAITools from './AtmosAITools';

interface StudioPaneProps {
  data: RemotionData | null;
  savedMedia: SavedMedia[];
  setSavedMedia: React.Dispatch<React.SetStateAction<SavedMedia[]>>;
  savedVideos: SavedVideo[];
}

export default function StudioPane({ savedMedia, setSavedMedia }: StudioPaneProps) {
  const [currentView, setCurrentView] = useState<'menu' | 'atmos'>('menu');

  return (
    <div className="flex-1 flex flex-col bg-white border-l border-black overflow-hidden font-mono text-sm text-black h-full w-full">
      {currentView === 'menu' ? (
        <div className="font-sans flex flex-col h-full bg-white">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-0.5">Tools</h2>
            <p className="text-gray-500 text-xs">Select a tool to enhance your workflow.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 bg-white">
            
            <div className="grid grid-cols-1 gap-5">
              <div 
                onClick={() => setCurrentView('atmos')}
                className="flex flex-col group cursor-pointer"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-gray-50 transition-colors border border-gray-100 flex items-center justify-center">
                   <div className="w-full h-full bg-indigo-50/30 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 flex justify-center items-center">
                         <div className="w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-60" />
                      </div>
                      <div className="text-4xl relative z-10 drop-shadow-sm">✨</div>
                   </div>
                </div>
                <div className="flex gap-3 px-1">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-serif text-xl font-bold shadow-sm">A</div>
                  <div>
                    <h3 className="font-medium text-[14px] mb-0.5 text-gray-900 tracking-tight">Atmos AI Tools</h3>
                    <p className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider">by @tmosteam</p>
                    <p className="text-gray-600 text-[12px] leading-snug">Generate, manipulate, and manage media for your compositions.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                 <span className="text-[13px] text-gray-400 font-medium">More tools coming soon...</span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <AtmosAITools 
          onBack={() => setCurrentView('menu')} 
          savedMedia={savedMedia} 
          setSavedMedia={setSavedMedia} 
        />
      )}
    </div>
  );
}
