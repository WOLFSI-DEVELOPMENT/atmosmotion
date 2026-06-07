import React, { useMemo, useState } from 'react';
import { Player } from '@remotion/player';
import { evaluateRemotionCode } from '../lib/evaluator';
import { SavedVideo } from '../types';
import { PlayIcon as Play } from 'hugeicons-react';

export default function VideoPreviewThumbnail({ video }: { video: SavedVideo }) {
  const [error, setError] = useState(false);

  const Component = useMemo(() => {
    setError(false);
    if (!video.code) return null;
    try {
      const Comp = evaluateRemotionCode(video.code);
      if (!Comp) throw new Error("No default export");
      return Comp;
    } catch (e: any) {
      console.error(e);
      setError(true);
      return null;
    }
  }, [video.code]);

  if (!Component || error) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-full aspect-[4/5] rounded-[24px] flex items-center justify-center p-4 text-center overflow-hidden border border-gray-200 transition-colors group-hover:border-gray-300 relative">
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        <Play className="w-12 h-12 text-gray-400 drop-shadow-sm group-hover:scale-110 group-hover:text-gray-600 transition-all duration-300" fill="currentColor" />
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] w-full aspect-[4/5] rounded-[24px] flex items-center justify-center text-center overflow-hidden transition-all group-hover:scale-[1.02] border border-gray-200 pointer-events-none relative">
      <Player
        component={Component}
        durationInFrames={video.durationInFrames || 150}
        compositionWidth={video.compositionWidth || 1080}
        compositionHeight={video.compositionHeight || 1080}
        fps={video.fps || 30}
        style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', objectFit: 'contain' }}
        controls={false}
        autoPlay
        loop
      />
    </div>
  );
}
