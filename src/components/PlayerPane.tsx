import React, { useMemo, useState } from 'react';
import { Player } from '@remotion/player';
import { evaluateRemotionCode } from '../lib/evaluator';
import { RemotionData, Source } from '../types';
import { Loading01Icon as Loader2, Alert01Icon as AlertCircle, File01Icon as FileText, Download01Icon as Download, UndoIcon as Undo, RedoIcon as Redo, GlobeIcon as Globe, BrainIcon, CheckmarkBadge01Icon as Check } from 'hugeicons-react';
import Markdown from 'react-markdown';
import { renderMediaOnWeb } from '@remotion/web-renderer';
import GenerationAnimation from './GenerationAnimation';
import { motion, AnimatePresence } from 'motion/react';

interface PlayerPaneProps {
  data: RemotionData | null;
  isLoading?: boolean;
  isSearching?: boolean;
  sources?: Source[];
  onSendMessage?: (msg: string) => void;
  historyIndex?: number;
  historyLength?: number;
  onUndo?: () => void;
  onRedo?: () => void;
}

export default function PlayerPane({ data, isLoading, isSearching, sources = [], onSendMessage, historyIndex = -1, historyLength = 0, onUndo, onRedo }: PlayerPaneProps) {
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  const [loadingText, setLoadingText] = useState('Generating...');
  
  React.useEffect(() => {
    if (!isLoading) {
      setLoadingText('Generating...');
      return;
    }
    if (isSearching) {
      setLoadingText('Deep searching...');
      return;
    }
    
    // Cycle text
    const texts = ['Thinking...', 'Brainstorming...', 'Planning...', 'Plan is being created...'];
    let idx = 0;
    setLoadingText(texts[0]);
    const interval = setInterval(() => {
      idx = Math.min(idx + 1, texts.length - 1);
      setLoadingText(texts[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading, isSearching]);

  const Component = useMemo(() => {
    setError(null);
    if (!data?.code) return null;
    try {
      const Comp = evaluateRemotionCode(data.code);
      if (!Comp) throw new Error("No default export found in the generated code.");
      return Comp;
    } catch (e: any) {
      setError(e.message || 'Failed to compile Remotion code');
      return null;
    }
  }, [data?.code]);

  const handleExport = async () => {
    if (!Component || !data) return;
    try {
      setIsExporting(true);
      setExportProgress(0);
      const result = await renderMediaOnWeb({
        composition: {
          id: "MyVideo",
          component: Component,
          durationInFrames: data.durationInFrames || 150,
          fps: data.fps || 30,
          width: data.compositionWidth || 1920,
          height: data.compositionHeight || 1080,
        },
        videoCodec: 'h264',
        container: 'mp4',
        inputProps: {},
        onProgress: (payload: any) => {
          const progress = typeof payload === 'number' ? payload : (payload?.progress ?? 0);
          setExportProgress(progress * 100);
        },
      });

      const videoBlob = typeof result.getBlob === 'function' 
        ? await result.getBlob() 
        : ((result as any).blob || new Blob([(result as any).buffer || ''], { type: 'video/mp4' }));
      const videoUrl = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = "animation.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(videoUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to export video');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHtml = () => {
    if (!data?.code) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Remotion Export</title>
</head>
<body>
    <div id="root"></div>
    <script type="module">
        // Code is exported directly for reference. 
        // A full build setup is required to run remotion locally.
        const code = ${JSON.stringify(data.code)};
        console.log("Exported React Code:", code);
    </script>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "animation.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div 
          key="generating"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full bg-transparent relative overflow-hidden"
        >
          <GenerationAnimation />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none gap-4">
            {isSearching && sources && sources.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center -space-x-3 mb-2"
              >
                {sources.slice(0, 5).map((source, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20, rotate: -15 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 shadow-md flex items-center justify-center overflow-hidden z-[10]"
                    style={{ zIndex: 10 - i }}
                  >
                    {source.icon ? (
                      <img src={source.icon} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <Globe className="w-4 h-4 text-gray-500" />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
              <span className="text-gray-900 font-medium">{loadingText}</span>
            </div>
          </div>
        </motion.div>
      ) : !data ? (
        <motion.div 
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full flex flex-col items-center justify-center bg-transparent text-gray-500"
        >
          <p className="text-sm">Describe a motion graphic in the chat to generate it.</p>
        </motion.div>
      ) : data.planMarkdown && !data.code ? (
        <motion.div 
          key="plan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full bg-transparent flex flex-col relative overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-8 pb-32 flex flex-col items-center">
            <div className="w-full max-w-4xl py-12">
               <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                  <FileText className="w-8 h-8 text-gray-800" />
                  <h2 className="text-2xl font-semibold text-gray-900">Animation Plan</h2>
               </div>
               <div className="prose prose-gray max-w-none prose-p:text-gray-600 prose-headings:text-gray-900 prose-li:text-gray-600">
                  <Markdown>{data.planMarkdown}</Markdown>
               </div>
               
               {data.sources && data.sources.length > 0 && (
                 <div className="mt-8 border-t border-gray-100 pt-6">
                   <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Sources</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {data.sources.map((source, i) => (
                       <a 
                         key={i} 
                         href={source.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-start gap-3 p-3 rounded-[16px] bg-[#f8f9fa] hover:bg-[#f1f3f5] transition-colors group cursor-pointer no-underline"
                       >
                         <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100/50">
                           {source.icon ? (
                             <img src={source.icon} className="w-4 h-4 object-contain" alt="" />
                           ) : (
                             <Globe className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                           )}
                         </div>
                         <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                           <span className="text-[13px] font-semibold text-gray-900 truncate">
                             {source.title || new URL(source.url).hostname}
                           </span>
                           <span className="text-[11px] text-gray-500 truncate">
                             {source.url}
                           </span>
                         </div>
                       </a>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
            <div className="bg-[#f5f5f5] border border-gray-200/50 rounded-full h-[52px] flex items-center p-1.5 transition-all">
              <AnimatePresence mode="wait">
                {!isEditMode ? (
                  <motion.div
                    key="plan-controls"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <button 
                      onClick={() => setIsEditMode(true)}
                      className="px-4 py-2 text-[15px] font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Edit your plan
                    </button>
                    <button 
                      onClick={() => onSendMessage?.("Approve plan")}
                      className="bg-gray-900 text-white px-6 py-2 rounded-full text-[15px] font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Approve
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-controls"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <span className="px-5 py-2 text-[15px] font-medium text-gray-800 whitespace-nowrap">
                      Edit mode
                    </span>
                    <button 
                      onClick={() => setIsEditMode(false)}
                      className="bg-white border border-gray-200/60 text-gray-800 px-6 py-2 rounded-full text-[15px] font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Exit
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="player"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full bg-transparent flex flex-col items-center justify-center p-8 relative"
        >
          {historyLength > 1 && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-4 py-1.5 px-3">
              <button 
                onClick={onUndo}
                disabled={historyIndex <= 0}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous version"
              >
                <Undo className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
              <div className="text-xs font-semibold text-gray-400 min-w-8 text-center">{historyIndex + 1} / {historyLength}</div>
              <button 
                onClick={onRedo}
                disabled={historyIndex >= historyLength - 1}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next version"
              >
                <Redo className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            </div>
          )}
          <div className="absolute top-6 right-6 z-20 flex gap-2">
            <button
              onClick={handleExportHtml}
              className="flex items-center gap-2 bg-gray-200/50 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border-none"
            >
              <Download className="w-4 h-4" />
              <span>Export HTML</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rendering {Math.round(exportProgress)}%</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export MP4</span>
                </>
              )}
            </button>
          </div>
          <div 
            className="w-full max-w-4xl relative rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300"
            style={{ aspectRatio: `${data?.compositionWidth || 1920}/${data?.compositionHeight || 1080}` }}
          >
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-8 text-center z-10 space-y-4">
                <AlertCircle className="w-12 h-12 opacity-80" />
                <p className="font-medium text-lg text-red-600">Compilation Error</p>
                <div className="bg-red-50 p-4 rounded text-sm opacity-90 font-mono whitespace-pre-wrap text-left max-w-2xl max-h-[60%] overflow-y-auto text-red-800">
                  {error}
                </div>
                {onSendMessage && (
                  <button 
                    onClick={() => onSendMessage(`Please fix this compilation error in the code:\n\n${error}`)}
                    className="mt-4 bg-red-100 text-red-700 px-6 py-2 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors cursor-pointer"
                  >
                    Ask AI to Fix Error
                  </button>
                )}
              </div>
            ) : Component && data ? (
              <>
                <Player
                  component={Component}
                  durationInFrames={data.durationInFrames || 150}
                  compositionWidth={data.compositionWidth || 1920}
                  compositionHeight={data.compositionHeight || 1080}
                  fps={data.fps || 30}
                  style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}
                  controls
                  autoPlay
                  loop
                />
              </>
            ) : (
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
