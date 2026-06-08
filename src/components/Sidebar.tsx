import React, { useState } from 'react';
import { DashboardCircleAddIcon, DiscoverCircleIcon, FolderLibraryIcon, Download01Icon, UserAdd01Icon, Bug02Icon, Cancel01Icon, UserCircleIcon, AiGenerativeIcon, Store01Icon } from 'hugeicons-react';
import { HelpCircle, Blocks, Sparkles } from 'lucide-react';
import AccountSettingsModal from './AccountSettingsModal';

interface SidebarProps {
  activeTab: 'create' | 'super-atmos' | 'marketplace' | 'tools';
  onTabChange: (tab: 'create' | 'super-atmos' | 'marketplace' | 'tools') => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'feature' | 'bug'>('feature');
  const [feedbackText, setFeedbackText] = useState('');
  
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [invitesRemaining, setInvitesRemaining] = useState<number>(10);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const navButtonClass = (isActive = false) =>
    `h-10 w-14 rounded-full flex items-center justify-center transition-colors ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const fetchInvites = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      const res = await fetch('/api/get-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setInvitesRemaining(data.remaining);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openInviteModal = () => {
    setIsInviteOpen(true);
    fetchInvites();
  };

  const generateCode = async () => {
    setIsLoadingInvite(true);
    setInviteError('');
    try {
      const email = localStorage.getItem('userEmail');
      const res = await fetch('/api/generate-invite', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
         setInviteCode(data.code);
         setInvitesRemaining(data.remaining);
      } else {
         setInviteError(data.error);
      }
    } catch(e) {
      setInviteError('Failed to generate invite code.');
    } finally {
      setIsLoadingInvite(false);
    }
  };

  const resetInvite = () => {
    setIsInviteOpen(false);
    setTimeout(() => {
       setInviteCode(null);
       setInviteError('');
    }, 200);
  };

  const submitFeedback = () => {
    // Basic mock submission
    setIsFeedbackOpen(false);
    setFeedbackText('');
  };

  return (
    <div className="w-[72px] h-screen bg-white flex-shrink-0 flex flex-col items-center px-2 py-5 relative">
      {/* App Title & Icon */}
      <div className="flex items-center justify-center mb-8">
        <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780066101/ChatGPT_Image_May_29_2026_07_42_50_AM_1_tptgxp.png" alt="Atmos design" className="w-9 h-9 object-contain flex-shrink-0" />
      </div>

      <div className="flex flex-col items-center gap-2 flex-grow">
        {/* Create Tab / Button */}
        <button
          onClick={() => onTabChange('create')}
          className={navButtonClass(activeTab === 'create')}
          title="Create"
          aria-label="Create"
        >
          <DashboardCircleAddIcon className="w-5 h-5 flex-shrink-0" strokeWidth={activeTab === 'create' ? 2 : 1.5} />
        </button>

        {/* Super Atmos Tab */}
        <button
          onClick={() => onTabChange('super-atmos')}
          className={navButtonClass(activeTab === 'super-atmos')}
          title="Super Atmos"
          aria-label="Super Atmos"
        >
          <AiGenerativeIcon className="w-5 h-5 flex-shrink-0" strokeWidth={activeTab === 'super-atmos' ? 2 : 1.5} />
        </button>

        {/* Marketplace Tab */}
        <button
          onClick={() => onTabChange('marketplace')}
          className={navButtonClass(activeTab === 'marketplace')}
          title="Marketplace"
          aria-label="Marketplace"
        >
          <Store01Icon className="w-5 h-5 flex-shrink-0" />
        </button>

        <div className="my-2" />

        {/* Tools Tab */}
        <button
          onClick={() => onTabChange('tools')}
          className={navButtonClass(activeTab === 'tools')}
          title="Tools"
          aria-label="Tools"
        >
          <Blocks className="w-5 h-5 flex-shrink-0" />
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-2 pt-4 mt-auto">
        <button
          onClick={openInviteModal}
          className={navButtonClass()}
          title="Invite Friends"
          aria-label="Invite Friends"
        >
          <UserAdd01Icon className="w-5 h-5 flex-shrink-0" />
        </button>

        <button
          onClick={() => setIsFeedbackOpen(true)}
          className={navButtonClass()}
          title="Suggest / Report"
          aria-label="Suggest or report"
        >
          <Bug02Icon className="w-5 h-5 flex-shrink-0" />
        </button>

        <button
          onClick={() => setIsFaqOpen(true)}
          className={navButtonClass()}
          title="FAQ"
          aria-label="FAQ"
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
        </button>

        <button
          onClick={() => setIsAccountOpen(true)}
          className={`${navButtonClass()} mt-2`}
          title="Account"
          aria-label="Account"
        >
          <UserCircleIcon className="w-5 h-5 flex-shrink-0" />
        </button>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-7 relative text-center flex flex-col items-center">
              <button 
                onClick={resetInvite}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
              >
                <Cancel01Icon className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl tracking-tight font-bold text-gray-900 mt-2 mb-3">Invite your friends</h3>
              <p className="text-[15px] leading-relaxed text-gray-500 mb-6 max-w-[90%]">
                You have {invitesRemaining} {invitesRemaining === 1 ? 'invite' : 'invites'} remaining. Anyone with the code below will be able to join.
              </p>

              {inviteError && (
                 <div className="mb-4 text-red-500 text-sm font-medium p-2 bg-red-50 rounded-lg w-full text-center">
                    {inviteError}
                 </div>
              )}

              <div className="w-full bg-[#f1f1f1] rounded-2xl h-[100px] flex items-center justify-center mb-6">
                {inviteCode ? (
                  <div className="flex gap-4 tracking-widest font-mono text-xl font-bold text-gray-900">
                    {inviteCode.split('').map((char, i) => (
                      <span key={i}>{char}</span>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-4 h-4 grid grid-cols-2 grid-rows-2 gap-[2px]">
                         <div className="bg-[#b3b3b3] w-full h-full rounded-tl-sm" />
                         <div className="bg-[#b3b3b3] w-full h-full rounded-tr-sm" />
                         <div className="bg-[#b3b3b3] w-full h-full rounded-bl-sm" />
                         <div className="bg-[#b3b3b3] w-full h-full rounded-br-sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={resetInvite}
                  className="flex-1 py-3.5 bg-[#f1f1f1] text-gray-900 text-sm font-semibold rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={inviteCode ? () => navigator.clipboard.writeText(inviteCode) : generateCode}
                  disabled={isLoadingInvite || (!inviteCode && invitesRemaining <= 0)}
                  className="flex-1 py-3.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingInvite ? 'Generating...' : inviteCode ? 'Copy code' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg tracking-tight font-bold text-gray-900">Feedback</h3>
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
              >
                <Cancel01Icon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="flex bg-[#f5f5f5] p-1 rounded-xl">
                <button
                  onClick={() => setFeedbackType('feature')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${feedbackType === 'feature' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Suggest Feature
                </button>
                <button
                  onClick={() => setFeedbackType('bug')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${feedbackType === 'bug' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Report Bug
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {feedbackType === 'feature' ? 'What would you like to see?' : 'What went wrong?'}
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={feedbackType === 'feature' ? 'Describe your idea...' : 'Describe the issue...'}
                  className="w-full h-32 p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition-shadow"
                />
              </div>

              <button
                onClick={submitFeedback}
                disabled={!feedbackText.trim()}
                className="w-full py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg tracking-tight font-bold text-gray-900">Frequently Asked Questions</h3>
              <button 
                onClick={() => setIsFaqOpen(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
              >
                <Cancel01Icon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-gray-900">What is Atmos design?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Atmos design is a platform for generating dynamic, animated videos and motions using natural language AI prompts.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-gray-900">How do I save my videos?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your generations are automatically saved directly in your browser. You can revisit them in the "My Videos" tab.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-gray-900">How do I invite friends?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Click the "Invite Friends" button in the sidebar to generate a unique entry code you can share.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-gray-900">How can I export my work?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Head to the "Exports" tab to view downloaded videos and export your completed animations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AccountSettingsModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </div>
  );
}
