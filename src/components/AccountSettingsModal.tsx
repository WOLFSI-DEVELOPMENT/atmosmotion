import React, { useState } from 'react';
import { 
  Folder01Icon, 
  UserCircleIcon, 
  CreditCardIcon, 
  TextFontIcon, 
  Logout01Icon,
  Cancel01Icon,
  Tick01Icon,
  Database01Icon
} from 'hugeicons-react';
import { Eye, EyeOff } from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'workspace' | 'profile' | 'subscription' | 'fonts' | 'data'>('profile');
  
  // Profile state
  const defaultEmail = localStorage.getItem('userEmail') || 'survivalcreativeminecraftadven@gmail.com';
  const defaultName = defaultEmail.split('@')[0];
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Data state
  const [storageUsed, setStorageUsed] = useState('2.4 GB');
  
  // Font state
  const [selectedFont, setSelectedFont] = useState(localStorage.getItem('preferredFont') || 'Inter');
  
  if (!isOpen) return null;

  const handleSaveProfile = () => {
    localStorage.setItem('displayName', displayName);
    // show success toast or similar ideally
  };

  const handleUpdateEmail = () => {
    localStorage.setItem('userEmail', email);
  };
  
  const handleUpdateFont = (font: string) => {
    setSelectedFont(font);
    localStorage.setItem('preferredFont', font);
    // Need to trigger re-render or global css change ideally
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all local data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: UserCircleIcon },
    { id: 'fonts', label: 'Fonts', icon: TextFontIcon },
    { id: 'data', label: 'Data & Storage', icon: Database01Icon },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-[900px] h-[700px] flex overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Sidebar */}
        <div className="w-[240px] bg-gray-50 flex flex-col border-r border-gray-100 flex-shrink-0 relative">
          <div className="p-4 pt-6 flex-1 flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all ${
                    isActive ? 'bg-gray-200/60 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 opacity-70" />
                  <span className="text-[14px]">{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="p-4 border-t border-gray-200/50">
            <button
               onClick={() => {
                 localStorage.removeItem('isOnboarded');
                 localStorage.removeItem('userEmail');
                 window.location.reload();
               }}
               className="w-full flex items-center px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer"
            >
              <Logout01Icon className="w-5 h-5 mr-3 opacity-70" />
              <span className="text-[14px]">Log out</span>
            </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Header */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white z-10 flex-shrink-0">
             <h2 className="text-xl font-bold text-gray-900 tracking-tight">
               {tabs.find(t => t.id === activeTab)?.label}
             </h2>
             <button 
               onClick={onClose}
               className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
             >
               <Cancel01Icon className="w-5 h-5" />
             </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-none">
            
            {activeTab === 'profile' && (
              <div className="flex flex-col max-w-xl">
                 {/* Profile Header */}
                 <div className="mb-8 flex flex-col gap-4">
                   <h3 className="text-[15px] font-semibold text-gray-900">Your Profile</h3>
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white text-2xl font-medium tracking-tight">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[16px] font-bold text-gray-900">{displayName}</span>
                         <span className="text-[14px] text-gray-500">{email}</span>
                      </div>
                   </div>
                 </div>

                 {/* Display Name */}
                 <div className="mb-8 flex flex-col gap-2">
                   <h3 className="text-[14px] font-semibold text-gray-900">Display Name</h3>
                   <div className="flex items-center gap-3">
                     <input 
                       type="text" 
                       value={displayName}
                       onChange={(e) => setDisplayName(e.target.value)}
                       className="flex-1 h-10 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                     />
                     <button onClick={handleSaveProfile} className="h-10 px-5 bg-white border border-gray-200 rounded-lg text-gray-700 text-[14px] font-medium hover:bg-gray-50 transition-colors">
                       Save
                     </button>
                   </div>
                 </div>

                 {/* Login Section */}
                 <div className="w-full h-px bg-gray-100 mb-8" />
                 
                 <div className="mb-8 flex flex-col gap-4">
                   <h3 className="text-[15px] font-semibold text-gray-900">Login</h3>
                   
                   <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                       <span className="text-[14px] font-semibold text-gray-900">Email</span>
                       <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-medium rounded-md">Verified</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <input 
                         type="email" 
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="flex-1 h-10 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                       />
                       <button onClick={handleUpdateEmail} className="h-10 px-5 bg-white border border-gray-200 rounded-lg text-gray-700 text-[14px] font-medium hover:bg-gray-50 transition-colors">
                         Update Email
                       </button>
                     </div>
                     <span className="text-[13px] text-gray-500 mt-1">You will need to verify your new email address before the change takes effect.</span>
                   </div>
                 </div>
                 
                 {/* Set Password */}
                 <div className="flex flex-col gap-3 max-w-sm">
                   <h3 className="text-[14px] font-semibold text-gray-900">Set Password</h3>
                   
                   <div className="relative">
                     <input 
                       type={showNewPassword ? "text" : "password"} 
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                       placeholder="New password"
                       className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                     />
                     <button 
                       type="button"
                       onClick={() => setShowNewPassword(!showNewPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                     >
                       {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                   </div>
                   
                   <div className="relative">
                     <input 
                       type={showConfirmPassword ? "text" : "password"} 
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       placeholder="Confirm password"
                       className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                     />
                     <button 
                       type="button"
                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                     >
                       {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                   </div>

                   <button 
                     disabled={!newPassword || newPassword !== confirmPassword}
                     className="h-10 mt-2 px-5 bg-black rounded-lg text-white text-[14px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:bg-gray-800"
                   >
                     Save Password
                   </button>
                 </div>
              </div>
            )}

            {activeTab === 'fonts' && (
              <div className="flex flex-col max-w-xl">
                 <div className="mb-6">
                   <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Typography Settings</h3>
                   <p className="text-[14px] text-gray-500">Choose your preferred font for the application interface.</p>
                 </div>
                 
                 <div className="flex flex-col gap-3">
                   {['Inter', 'Space Grotesk', 'Outfit', 'Playfair Display'].map((font) => (
                     <div 
                       key={font}
                       onClick={() => handleUpdateFont(font)}
                       className={`p-4 border rounded-xl flex justify-between items-center cursor-pointer transition-all ${selectedFont === font ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                     >
                       <span className="text-[15px] font-medium" style={{ fontFamily: font }}>{font}</span>
                       {selectedFont === font && <Tick01Icon className="w-5 h-5 text-gray-900" />}
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="flex flex-col max-w-xl">
                 <div className="mb-6">
                   <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Data & Storage</h3>
                   <p className="text-[14px] text-gray-500">Manage your local storage and uploaded assets.</p>
                 </div>
                 
                 <div className="p-5 border border-gray-200 rounded-xl mb-6">
                   <div className="flex justify-between mb-2">
                     <span className="text-[14px] font-medium text-gray-900">Local Storage Used</span>
                     <span className="text-[14px] font-medium text-gray-900">{storageUsed} / 5 GB</span>
                   </div>
                   <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[48%]" />
                   </div>
                 </div>

                 <div className="flex flex-col gap-4 border border-gray-200 rounded-xl p-5">
                   <div className="flex flex-col gap-1">
                     <h4 className="text-[14px] font-bold text-gray-900">Clear Local Data</h4>
                     <p className="text-[13px] text-gray-500">This will remove all generated videos, cached assets, and local settings from your browser.</p>
                   </div>
                   <button 
                     onClick={handleClearData}
                     className="w-max px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[13px] font-semibold transition-colors"
                   >
                     Clear All Data
                   </button>
                 </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
