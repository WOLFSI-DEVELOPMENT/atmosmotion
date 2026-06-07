import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudUploadIcon as UploadCloud, Cancel01Icon as X, Image01Icon as ImageIcon, Tick01Icon as Check } from 'hugeicons-react';
import { SavedMedia } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedMedia: SavedMedia[];
  onAddMedia: (media: SavedMedia) => void;
  onSelectMedia: (media: SavedMedia) => void;
  selectedIds: string[];
}

export default function MediaModal({ isOpen, onClose, savedMedia, onAddMedia, onSelectMedia, selectedIds }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const name = file.name.replace(/\.svg$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
          onAddMedia({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name,
            content
          });
        };
        reader.readAsText(file);
      } else {
        alert('Please select an SVG file.');
      }
    });
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === 'image/svg+xml') {
        const file = items[i].getAsFile();
        if (file) {
          handleFiles([file] as unknown as FileList);
        }
      } else if (items[i].type === 'text/plain') {
        items[i].getAsString((text) => {
          if (text.trim().startsWith('<svg') && text.trim().endsWith('</svg>')) {
            onAddMedia({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: 'pasted_svg_' + Date.now(),
              content: text
            });
          }
        });
      }
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        onPaste={handlePaste}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-[500px] max-w-[90vw] rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-600" /> Media Library
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition" type="button">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Upload Area */}
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files && handleFiles(e.target.files)} 
                accept=".svg" 
                className="hidden" 
                multiple
              />
              <UploadCloud className={`w-8 h-8 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-gray-800 mb-1">Click or drag SVG files here</p>
              <p className="text-xs text-gray-500">You can also paste SVG code directly</p>
            </div>

            {/* Saved Media Area */}
            {savedMedia.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-gray-700">Saved Media</h3>
                <div className="grid grid-cols-3 gap-3 max-h-[250px] overflow-y-auto">
                  {savedMedia.map(media => {
                    const isSelected = selectedIds.includes(media.id);
                    return (
                      <div 
                        key={media.id}
                        onClick={() => onSelectMedia(media)}
                        className={`relative rounded-lg border p-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                          isSelected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center text-gray-400 overflow-hidden" dangerouslySetInnerHTML={{ __html: media.content }} />
                        <span className="text-xs font-medium text-gray-700 truncate w-full text-center">@{media.name}</span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
