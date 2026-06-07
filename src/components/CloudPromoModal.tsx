import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, LogOut } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
  onLogout: () => void;
}

export default function CloudPromoModal({ isOpen, onClose, onSync, onLogout }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-[440px] bg-gray-50 rounded-[24px] overflow-hidden flex flex-col"
          >
            {/* Image Header */}
            <div className="w-full aspect-[16/9] px-6 pt-6 relative">
               <div className="w-full h-full rounded-[16px] overflow-hidden bg-gray-200">
                  <img 
                    src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780624501/ElevenLabs_image_gpt-image-2_remove_all_t..._2026-06-05T01_52_10_wrsro6.png" 
                    alt="Atmos Cloud"
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>

            {/* Content */}
            <div className="px-8 pt-6 pb-8 flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-black tracking-tight mb-3">Introducing Atmos Cloud</h2>
              <p className="text-[15px] leading-relaxed text-gray-500 font-medium mb-8">
                Your workspace is upgrading. Sync your locally saved videos, images, and tools to our secure cloud database, accessible from anywhere.
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={onLogout}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
                <button
                  onClick={onSync}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  Sync Data
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
