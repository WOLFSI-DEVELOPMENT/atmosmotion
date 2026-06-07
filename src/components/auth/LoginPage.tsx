import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft01Icon as ArrowLeftIcon, ArrowUp02Icon as ArrowUpIcon } from 'hugeicons-react';

interface LoginPageProps {
  onNavigate: (page: 'waitlist' | 'enter-code' | 'login' | 'app') => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      setError('');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const cleanEmail = email.trim();
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, pin: password }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem('isOnboarded', 'true');
          localStorage.setItem('userEmail', cleanEmail);
          onNavigate('app');
        } else {
          setError(data.error || 'Login failed Check email and PIN');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setError('Login request timed out. Please try again.');
        } else {
          setError('An error occurred during login API request');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-black font-sans text-white">
      {/* Left side Form */}
      <div className="flex-1 flex flex-col relative w-full lg:max-w-xl xl:max-w-2xl px-6 lg:px-16 py-10">
        <button 
          onClick={() => onNavigate('waitlist')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors absolute top-6 left-6 text-gray-400 hover:text-white"
        >
          <ArrowLeftIcon size={20} />
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="flex items-center gap-3 font-semibold text-xl tracking-tight mb-8 text-white">
            <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780066101/ChatGPT_Image_May_29_2026_07_42_50_AM_1_tptgxp.png" alt="Atmos design" className="w-[32px] h-[32px] object-contain flex-shrink-0 brightness-0 invert" />
            Atmos design
          </div>
          
          <h1 className="text-3xl font-semibold mb-2 text-white">Welcome back</h1>
          <p className="text-gray-400 mb-8">Sign in to your Atmos design account.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/50 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-14 px-6 rounded-full bg-[#111] border border-white/10 focus:outline-none focus:ring-1 focus:ring-white transition-colors placeholder:text-gray-500 text-white text-[15px]"
              />
            </div>
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="6-Digit PIN"
                maxLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full h-14 px-6 rounded-full bg-[#111] border border-white/10 focus:outline-none focus:ring-1 focus:ring-white transition-colors placeholder:text-gray-500 text-white tracking-widest text-lg"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-white text-black rounded-full font-bold text-[15px] hover:bg-gray-200 disabled:opacity-50 transition-colors mt-6 border-none outline-none"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>

      {/* Right side Presentation (hidden on smaller screens) */}
      <div className="hidden lg:flex flex-1 p-4 pl-0">
        <div className="w-full h-full bg-[#111] border border-white/10 rounded-[32px] overflow-hidden relative">
          <img 
            src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780515333/ChatGPT_Image_Jun_3_2026_12_29_00_PM_lah29i.png" 
            alt="Atmos aesthetic visual" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </div>
  );
}
