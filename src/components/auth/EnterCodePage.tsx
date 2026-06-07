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

  const inputClassName = "w-full h-14 rounded-full bg-[#1a1a1d] px-6 text-white placeholder:text-white/35 focus:outline-none focus:ring-0";
  const primaryButtonClassName = "group relative w-full h-16 rounded-full bg-white text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-white shadow-[0_0_0_3px_rgba(255,255,255,0.45)] hover:scale-[1.01]";
  const optionButtonClassName = (active: boolean) =>
    `h-14 rounded-full px-4 font-medium transition-all border-0 ${active ? 'bg-white text-black' : 'bg-[#1a1a1d] text-white/72 hover:bg-[#232327] hover:text-white'}`;
  const PrimaryButtonContent = ({ label }: { label: string }) => (
    <span className="flex items-center justify-center gap-4">
      <span>{label}</span>
      <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </span>
  );

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
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center font-sans text-white relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === -1 && (
          <motion.div 
            key="step-code"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center z-10 w-full max-w-md px-6"
          >
            <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780066101/ChatGPT_Image_May_29_2026_07_42_50_AM_1_tptgxp.png" alt="Atmos design" className="w-[48px] h-[48px] object-contain flex-shrink-0 mb-8 brightness-0 invert" />
            
            <h1 className="text-3xl font-semibold mb-8">Enter invite code</h1>
            
            <input
               ref={inputRef}
               type="text"
               value={code}
               onChange={(e) => setCode(e.target.value.toUpperCase())}
               onKeyDown={(e) => e.key === 'Enter' && handleCheckCode()}
               placeholder="ABCDEF"
               className={`${inputClassName} text-center text-xl font-medium uppercase mb-4`}
            />
            {error && <p className="text-red-500 mb-4 text-sm font-medium">{error}</p>}

            <button 
              onClick={handleCheckCode}
              disabled={isLoading || !code.trim()}
              className={`${primaryButtonClassName} mb-6`}
            >
              <PrimaryButtonContent label={isLoading ? 'Checking...' : 'Continue'} />
            </button>

            <button 
              onClick={() => onNavigate('waitlist')}
              className="text-sm text-white/45 hover:text-white transition-colors"
            >
              Back to waitlist
            </button>
          </motion.div>
        )}

        {step === 0 && (
          <motion.div key="step-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md px-6">
            <h1 className="text-4xl font-medium mb-4 text-center tracking-tight">Welcome to Atmos.</h1>
            <p className="text-white/50 text-lg mb-8 text-center">What should we call you?</p>
            <input
              ref={inputRef}
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && formData.name && handleNext()}
              className={`${inputClassName} text-lg mb-8`}
              placeholder="Your name"
            />
            <button onClick={handleNext} disabled={!formData.name} className={primaryButtonClassName}><PrimaryButtonContent label="Next" /></button>
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
              className={`${inputClassName} text-lg mb-8`}
              placeholder="name@company.com"
            />
            <button onClick={handleNext} disabled={!formData.email} className={primaryButtonClassName}><PrimaryButtonContent label="Next" /></button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md px-6">
            <h1 className="text-4xl font-medium mb-4 text-center tracking-tight">Secure your account</h1>
            <p className="text-white/50 text-lg mb-8 text-center">Create a 6-digit PIN</p>
            <input
              ref={inputRef}
              type="password"
              maxLength={6}
              value={formData.pin}
              onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
              onKeyDown={e => e.key === 'Enter' && formData.pin.length === 6 && handleNext()}
              className={`${inputClassName} h-16 text-center text-3xl tracking-[1em] mb-8`}
            />
            <button onClick={handleNext} disabled={formData.pin.length !== 6} className={primaryButtonClassName}><PrimaryButtonContent label="Next" /></button>
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
                  className={optionButtonClassName(formData.role === r)}
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
                  className={optionButtonClassName(formData.goal === g)}
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
                  className={`${optionButtonClassName(formData.source === s)} text-sm`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md px-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full mx-auto mb-6 flex items-center justify-center text-black">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-4xl font-medium mb-4 text-center tracking-tight">You're all set!</h1>
            <p className="text-white/50 text-lg mb-8">Let's start creating.</p>
            <button onClick={handleNext} disabled={isLoading} className={primaryButtonClassName}>
               <PrimaryButtonContent label={isLoading ? 'Finishing setup...' : 'Continue'} />
            </button>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div key="step-7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md px-6 text-center">
            <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1780066101/ChatGPT_Image_May_29_2026_07_42_50_AM_1_tptgxp.png" alt="Atmos design" className="w-[80px] h-[80px] object-contain flex-shrink-0 mb-6 mx-auto brightness-0 invert" />
            <h1 className="text-5xl font-serif mb-8 text-center tracking-tight">Have fun, {formData.name.split(' ')[0]}!</h1>
            <button onClick={() => onNavigate('app')} className={primaryButtonClassName}>
               <PrimaryButtonContent label="Enter Atmos" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
