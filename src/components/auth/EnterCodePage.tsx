import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface EnterCodePageProps {
  onNavigate: (page: 'waitlist' | 'enter-code' | 'login' | 'app') => void;
}

export default function EnterCodePage({ onNavigate }: EnterCodePageProps) {
  const [step, setStep] = useState(-1);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin: '',
    role: '',
    goal: '',
    source: ''
  });

  const roles = [
    'Designer', 'Developer', 'Teacher', 'Founder', 
    'Content Creator', 'Marketer', 'Student', 'Other'
  ];
  
  const goals = [
    'Product Demos', 'Explainer Videos', 'Ads', 
    'Social Media', 'Course Materials', 'Presentations', 'Other'
  ];

  const sources = [
    'Twitter / X', 'LinkedIn', 'YouTube', 
    'TikTok', 'Friend / Colleague', 'Search Engine', 'Other'
  ];

  const handleCheckCode = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/check-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.valid) {
        setStep(0);
      } else {
        setError(data.message || 'Invalid code');
      }
    } catch (e) {
      setError('Server error.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitOnboarding = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...formData })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('isOnboarded', 'true');
        localStorage.setItem('userEmail', formData.email);
        setStep(7);
      } else {
        setError(data.error || 'Setup failed');
        setStep(-1);
      }
    } catch (e) {
      setError('Server error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 3 && formData.pin.length !== 6) return;
    if (step === 6) {
      submitOnboarding();
    } else {
      setStep(s => s + 1);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
       inputRef.current.focus();
    }
  }, [step]);

  return (
    <div className="min-h-screen w-full bg-[#fdfdfd] flex flex-col items-center justify-center font-sans text-gray-900 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === -1 && (
          <motion.div 
            key="step-code"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center z-10 w-full max-w-md px-6"
          >
            <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780066101/ChatGPT_Image_May_29_2026_07_42_50_AM_1_tptgxp.png" alt="Atmos design" className="w-[48px] h-[48px] object-contain flex-shrink-0 mb-8" />
            
            <h1 className="text-3xl font-semibold mb-8">Enter invite code</h1>
            
            <input
               ref={inputRef}
               type="text"
               value={code}
               onChange={(e) => setCode(e.target.value.toUpperCase())}
               onKeyDown={(e) => e.key === 'Enter' && handleCheckCode()}
               placeholder="ABCDEF"
               className="w-full h-14 text-center text-xl font-medium rounded-2xl border border-gray-300 bg-transparent focus:outline-none focus:border-black focus:ring-1 focus:ring-black uppercase transition-colors mb-4"
            />
            {error && <p className="text-red-500 mb-4 text-sm font-medium">{error}</p>}

            <button 
              onClick={handleCheckCode}
              disabled={isLoading || !code.trim()}
              className="w-full h-12 px-6 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-6"
            >
              {isLoading ? 'Checking...' : 'Continue'}
            </button>

            <button 
              onClick={() => onNavigate('waitlist')}
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              Back to waitlist
            </button>
          </motion.div>
        )}

        {step === 0 && (
          <motion.div key="step-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md px-6">
            <h1 className="text-4xl font-medium mb-4 text-center tracking-tight">Welcome to Atmos.</h1>
            <p className="text-gray-500 text-lg mb-8 text-center">What should we call you?</p>
            <input
              ref={inputRef}
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && formData.name && handleNext()}
              className="w-full h-14 text-lg border-b-2 border-gray-200 focus:border-black focus:outline-none bg-transparent mb-8"
              placeholder="Your name"
            />
            <button onClick={handleNext} disabled={!formData.name} className="w-full h-12 bg-black text-white rounded-2xl font-medium disabled:opacity-50">Next</button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md px-6">
            <h1 className="text-4xl font-medium mb-4 text-center tracking-tight">What's your email?</h1>
            <input
              ref={inputRef}
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && formData.email && handleNext()}
              className="w-full h-14 text-lg border-b-2 border-gray-200 focus:border-black focus:outline-none bg-transparent mb-8"
              placeholder="name@company.com"
            />
            <button onClick={handleNext} disabled={!formData.email} className="w-full h-12 bg-black text-white rounded-2xl font-medium disabled:opacity-50">Next</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md px-6">
            <h1 className="text-4xl font-medium mb-4 text-center tracking-tight">Secure your account</h1>
            <p className="text-gray-500 text-lg mb-8 text-center">Create a 6-digit PIN</p>
            <input
              ref={inputRef}
              type="password"
              maxLength={6}
              value={formData.pin}
              onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
              onKeyDown={e => e.key === 'Enter' && formData.pin.length === 6 && handleNext()}
              className="w-full h-16 text-center text-3xl tracking-[1em] border-b-2 border-gray-200 focus:border-black focus:outline-none bg-transparent mb-8"
            />
            <button onClick={handleNext} disabled={formData.pin.length !== 6} className="w-full h-12 bg-black text-white rounded-2xl font-medium disabled:opacity-50">Next</button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md px-6">
            <h1 className="text-4xl font-medium mb-8 text-center tracking-tight">Which best describes you?</h1>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => { setFormData({...formData, role: r}); setTimeout(handleNext, 150); }}
                  className={`h-14 font-medium rounded-2xl border transition-all ${formData.role === r ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md px-6">
            <h1 className="text-4xl font-medium mb-8 text-center tracking-tight">What will you create?</h1>
            <div className="flex flex-col gap-3 mb-8">
              {goals.map(g => (
                <button
                  key={g}
                  onClick={() => { setFormData({...formData, goal: g}); setTimeout(handleNext, 150); }}
                  className={`h-14 font-medium rounded-2xl border transition-all ${formData.goal === g ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md px-6">
            <h1 className="text-4xl font-medium mb-8 text-center tracking-tight">How did you hear about us?</h1>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {sources.map(s => (
                <button
                  key={s}
                  onClick={() => { setFormData({...formData, source: s}); setTimeout(handleNext, 150); }}
                  className={`h-14 text-sm font-medium rounded-xl border transition-all ${formData.source === s ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md px-6 text-center">
            <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center text-white">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-4xl font-medium mb-4 text-center tracking-tight">You're all set!</h1>
            <p className="text-gray-500 text-lg mb-8">Let's start creating.</p>
            <button onClick={handleNext} disabled={isLoading} className="w-full h-12 bg-black text-white rounded-2xl font-medium disabled:opacity-50">
               {isLoading ? 'Finishing setup...' : 'Continue'}
            </button>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div key="step-7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md px-6 text-center">
            <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780066101/ChatGPT_Image_May_29_2026_07_42_50_AM_1_tptgxp.png" alt="Atmos design" className="w-[80px] h-[80px] object-contain flex-shrink-0 mb-6 mx-auto" />
            <h1 className="text-5xl font-serif mb-8 text-center tracking-tight">Have fun, {formData.name.split(' ')[0]}!</h1>
            <button onClick={() => onNavigate('app')} className="w-full h-14 bg-black text-white rounded-2xl font-medium text-lg hover:bg-gray-800 transition-colors shadow-lg">
               Enter Atmos
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
