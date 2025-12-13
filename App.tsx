
import React, { useState, useRef, useEffect } from 'react';
import { AppState, Screen, GeneratedContent, ProcessingOptions, MOCK_LIBRARY, QuizItem, User } from './types';
import { HomeIcon, LibraryIcon, UploadIcon, UserIcon, MicIcon, ChevronLeftIcon, FileAudioIcon, BrainCircuitIcon, CheckIcon, StopIcon, PlayIcon, PauseIcon, GoogleIcon, AppleIcon, MoreVerticalIcon, XIcon, SaveIcon, ShieldCheckIcon, LightbulbIcon } from './components/Icons';
import { generateLearningMaterial } from './services/geminiService';
import { storageService } from './services/storageService';

// --- UTILS ---
const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- LOGO COMPONENT ---
const LuxuryLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 160 30" className={className} fill="none">
    <g className="text-espresso-900">
      {/* Refined Dotted Wave Logo - Animated */}
      <circle 
        cx="15" cy="15" r="2" 
        fill="currentColor" 
        className="animate-[soundWave_2s_ease-in-out_infinite]"
        style={{ transformOrigin: '15px 15px' }} 
      />
      <circle 
        cx="8" cy="15" r="1.5" 
        fill="currentColor" 
        className="animate-[soundWave_2s_ease-in-out_infinite]" 
        style={{ transformOrigin: '8px 15px', animationDelay: '0.2s' }} 
      />
      <circle 
        cx="22" cy="15" r="1.5" 
        fill="currentColor" 
        className="animate-[soundWave_2s_ease-in-out_infinite]" 
        style={{ transformOrigin: '22px 15px', animationDelay: '0.4s' }} 
      />
      <circle 
        cx="28" cy="15" r="1" 
        fill="currentColor" 
        className="animate-[soundWave_2s_ease-in-out_infinite]" 
        style={{ transformOrigin: '28px 15px', animationDelay: '0.6s' }} 
      />
      <circle 
        cx="33" cy="15" r="0.8" 
        fill="currentColor" 
        className="animate-[soundWave_2s_ease-in-out_infinite]" 
        style={{ transformOrigin: '33px 15px', animationDelay: '0.8s' }} 
      />
    </g>
    
    {/* Text */}
    <text x="45" y="21" fontFamily="Playfair Display, serif" fontSize="18" fontWeight="500" letterSpacing="0.12em" fill="currentColor">
      AURALEX
    </text>
  </svg>
);

// --- COMPONENT: LUXURY AUDIO PLAYER ---
const LuxuryAudioPlayer = ({ src }: { src: string }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-stone-100 flex items-center gap-4 w-full animate-fade-in">
            <audio 
                ref={audioRef} 
                src={src} 
                onTimeUpdate={handleTimeUpdate} 
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />
            
            <button 
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-espresso-900 text-white flex items-center justify-center hover:bg-espresso-800 transition-colors shadow-lg shadow-espresso-900/10 flex-shrink-0"
            >
                {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-1" />}
            </button>

            <div className="flex-1">
                <div className="flex justify-between items-center text-xs font-medium text-taupe-500 mb-2">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div className="relative h-2 rounded-full bg-cream-100 overflow-hidden">
                    <div 
                        className="absolute left-0 top-0 h-full bg-sage-500 rounded-full transition-all duration-100"
                        style={{ width: `${(progress / duration) * 100}%` }}
                    />
                    <input 
                        type="range" 
                        min="0" 
                        max={duration || 0} 
                        value={progress} 
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: SAVE PROMPT MODAL ---
const SavePromptModal = ({ onSave, onCancel }: { onSave: () => void, onCancel: () => void }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-espresso-900/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-stone-100 transform transition-all animate-slide-up">
                <div className="w-12 h-12 bg-sage-50 rounded-full flex items-center justify-center text-sage-600 mb-4 mx-auto">
                    <SaveIcon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-serif text-espresso-900 text-center mb-2">Save to Device?</h3>
                <p className="text-taupe-500 text-center font-light mb-8 text-sm">
                    Would you like to save this generated content as a local file on your computer?
                </p>

                <div className="flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-3 bg-stone-100 text-taupe-600 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                    >
                        Skip
                    </button>
                    <button 
                        onClick={onSave}
                        className="flex-1 py-3 bg-espresso-900 text-white rounded-xl font-medium hover:bg-espresso-800 transition-colors shadow-lg shadow-espresso-900/10"
                    >
                        Yes, Save File
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: NAVIGATION ---
const Navigation = ({ currentScreen, setScreen }: { currentScreen: Screen, setScreen: (s: Screen) => void }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', icon: HomeIcon, label: 'Home' },
    { id: 'library', icon: LibraryIcon, label: 'Library' },
    { id: 'upload', icon: UploadIcon, label: 'Upload', highlight: true },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
  ];

  if (['loading', 'auth'].includes(currentScreen)) return null;

  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cream-50/90 backdrop-blur-xl border-t border-espresso-900/5 pb-safe z-50">
        <div className="flex justify-around items-center px-2 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                currentScreen === item.id 
                  ? 'text-espresso-900 -translate-y-1' 
                  : 'text-taupe-500 hover:text-espresso-800'
              } ${item.highlight ? 'bg-espresso-900 text-white shadow-xl -mt-8 mb-4 border-[6px] border-cream-50 h-16 w-16 rounded-full' : ''}`}
            >
              <item.icon className={item.highlight ? "w-6 h-6 text-white" : "w-6 h-6"} />
              {!item.highlight && <span className="text-[10px] font-medium mt-1 font-sans tracking-wide">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Menu Trigger (Three Dot Option) - Top Left */}
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="hidden md:flex fixed top-8 left-8 z-40 p-3 rounded-full bg-cream-50/80 hover:bg-white backdrop-blur-md border border-stone-200/50 hover:border-stone-200 shadow-sm transition-all duration-300 group items-center justify-center"
        aria-label="Open Menu"
      >
        <MoreVerticalIcon className="w-6 h-6 text-espresso-900 opacity-80 group-hover:opacity-100" />
      </button>

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-espresso-900/20 backdrop-blur-sm z-50 transition-opacity duration-500 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Side Drawer (Hidden by default) */}
      <div className={`fixed left-0 top-0 bottom-0 w-80 bg-cream-50/95 backdrop-blur-2xl border-r border-stone-100 z-50 p-10 transition-transform duration-500 cubic-bezier(0.33, 1, 0.68, 1) ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setScreen('dashboard'); setIsDrawerOpen(false); }}>
             <LuxuryLogo className="w-40 h-10" />
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-stone-200/50 rounded-full transition-colors text-taupe-500 hover:text-espresso-900">
             <XIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
           {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setScreen(item.id as Screen); setIsDrawerOpen(false); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-500 group relative overflow-hidden ${
                currentScreen === item.id 
                  ? 'text-espresso-900 shadow-soft bg-white/60' 
                  : 'text-taupe-500 hover:bg-white/40 hover:text-espresso-900'
              }`}
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 bg-espresso-900 transition-all duration-300 ${currentScreen === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentScreen === item.id ? 'text-espresso-900' : 'text-taupe-400'}`} />
              <span className={`text-sm tracking-wide ${currentScreen === item.id ? 'font-medium' : 'font-light'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-10 left-10 right-10 pt-8 border-t border-espresso-900/5">
           <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/40 transition-colors cursor-pointer">
              <div className="h-10 w-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center text-white font-serif italic text-lg shadow-lg">A</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-espresso-900 truncate tracking-wide">Alex User</p>
                <p className="text-xs text-taupe-500 truncate font-light">Premium Member</p>
              </div>
           </div>
        </div>
      </div>
    </>
  );
};

// --- SCREEN: AUTH / LANDING PAGE ---
const AuthScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'credentials' | 'profile'>('credentials');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Switch tabs -> Reset state
  const handleTabChange = (tab: 'login' | 'signup') => {
      setActiveTab(tab);
      setStep('credentials');
      setError('');
      setEmail('');
      setPassword('');
  };

  const validateEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCredentialsSubmit = async () => {
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format. Please check again.');
      setLoading(false);
      return;
    }

    if (activeTab === 'signup' && password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
    }

    try {
        if (activeTab === 'login') {
            const user = await storageService.auth.login(email, password);
            // Login Success
            if (user.name) {
                onLogin(user.name);
            } else {
                setStep('profile'); // Edge case: name missing
            }
        } else {
            // Sign Up Mode
            await storageService.auth.register(email, password);
            setStep('profile'); // Move to profile creation
        }
    } catch (err: any) {
        setError(err.message || "Authentication failed");
    } finally {
        setLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
      if (!name.trim()) {
          setError('Please enter your name.');
          return;
      }
      await storageService.auth.updateProfile(email, name);
      onLogin(name);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
      setGoogleLoading(true);
      try {
          // Simulate the Popup interaction
          const user = await storageService.auth.simulateSocialLogin(provider);
          // In real implementation, check if user has name, if not go to profile
          setStep('profile');
          // For UX, prefill email but hide it or handle in background
          setEmail(user.email);
      } catch (e) {
          setError("Failed to connect to provider.");
      } finally {
          setGoogleLoading(false);
      }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cream-50 via-[#FDFBF7] to-cream-100 font-sans text-espresso-900 relative selection:bg-sage-400 selection:text-white overflow-hidden flex flex-col">
      
      {/* Google Connect Simulation Modal */}
      {googleLoading && (
          <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center animate-fade-in">
              <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-stone-100 border-t-blue-500 rounded-full animate-spin"></div>
                  <h3 className="text-lg font-medium text-espresso-900 mb-1">Connecting to Google</h3>
                  <p className="text-xs text-taupe-500">Verifying credentials and permissions...</p>
              </div>
          </div>
      )}

      {/* Minimal Header */}
      <nav className="w-full px-8 py-8 flex justify-between items-center max-w-7xl mx-auto z-20">
         <LuxuryLogo className="w-48 h-10" />
      </nav>

      {/* Main Content Split Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-32 relative z-10 pb-12">
        
        {/* Left Side: Hero Text */}
        <div className="flex-1 flex flex-col justify-center items-start text-left space-y-8 animate-fade-in max-w-xl">
             <div className="flex items-center gap-3 opacity-0 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="h-px w-12 bg-espresso-900/20"></div>
                <span className="text-espresso-900/60 font-medium tracking-[0.2em] text-[10px] uppercase font-serif">Est. MMXXV</span>
             </div>
             
             <h1 className="text-5xl lg:text-7xl font-serif font-medium leading-[1.1] text-espresso-900 opacity-0 animate-slide-up" style={{animationDelay: '0.2s'}}>
                Master your audio. <br/>
                <span className="italic text-sage-600">Elevate your mind.</span>
             </h1>
             
             <p className="text-lg text-taupe-500 font-light max-w-md leading-relaxed opacity-0 animate-slide-up" style={{animationDelay: '0.3s'}}>
                Seamlessly transform recordings and files into interactive learning materials using advanced AI.
             </p>

             <div className="pt-8 opacity-0 animate-slide-up" style={{animationDelay: '0.4s'}}>
                 <div className="flex items-center gap-4 text-xs text-taupe-400 font-medium tracking-wide">
                     <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sage-500"></div> AI SUMMARIES</span>
                     <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sage-500"></div> FLASHCARDS</span>
                     <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sage-500"></div> QUIZZES</span>
                 </div>
             </div>
        </div>

        {/* Right Side: Floating Card (Auth or Profile) */}
        <div className="flex-1 w-full max-w-[440px] opacity-0 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="relative">
                {/* Soft shadow glow behind */}
                <div className="absolute -inset-4 bg-sage-400/10 rounded-[2rem] blur-2xl transform translate-y-4"></div>
                
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(45,27,27,0.1)] border border-white p-2 relative">
                    {/* Inner Container */}
                    <div className="bg-white rounded-2xl p-8 border border-stone-100 min-h-[520px] flex flex-col justify-center">
                        
                        {step === 'credentials' ? (
                            <>
                                {/* Step 1: Login / Signup Toggle */}
                                <div className="flex items-center gap-8 mb-8 border-b border-stone-100 relative">
                                    <button 
                                        onClick={() => handleTabChange('login')}
                                        className={`text-xs tracking-widest pb-3 relative transition-colors ${activeTab === 'login' ? 'text-espresso-900 font-bold' : 'text-taupe-400 font-medium hover:text-espresso-900'}`}
                                    >
                                        LOG IN
                                        {activeTab === 'login' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-espresso-900 animate-fade-in"></span>}
                                    </button>
                                    <button 
                                        onClick={() => handleTabChange('signup')}
                                        className={`text-xs tracking-widest pb-3 relative transition-colors ${activeTab === 'signup' ? 'text-espresso-900 font-bold' : 'text-taupe-400 font-medium hover:text-espresso-900'}`}
                                    >
                                        SIGN UP
                                        {activeTab === 'signup' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-espresso-900 animate-fade-in"></span>}
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-fade-in flex items-center gap-2">
                                        <div className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0"></div>
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold text-espresso-900 uppercase tracking-widest">Email Address</label>
                                        <div className="relative">
                                            <input 
                                                type="email" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3.5 bg-cream-50 border border-stone-200 focus:border-sage-400 rounded-lg text-espresso-900 text-sm focus:outline-none shadow-sm transition-colors"
                                                placeholder="Enter your email"
                                            />
                                            {validateEmail(email) && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sage-500 animate-fade-in"></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-espresso-900 uppercase tracking-widest">Password</label>
                                            {activeTab === 'login' && <span className="text-[10px] text-sage-600 cursor-pointer hover:underline">Forgot?</span>}
                                        </div>
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-cream-50 border border-stone-200 rounded-lg text-espresso-900 text-sm tracking-[0.2em] focus:outline-none focus:border-sage-400 transition-colors placeholder:tracking-normal"
                                            placeholder="••••••••"
                                            onKeyDown={(e) => e.key === 'Enter' && handleCredentialsSubmit()}
                                        />
                                    </div>

                                    {activeTab === 'login' && (
                                        <div className="flex items-center gap-2 text-xs pt-2">
                                            <div className="w-4 h-4 rounded border border-stone-300 flex items-center justify-center bg-espresso-900 border-espresso-900">
                                                <CheckIcon className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-taupe-500 font-medium">Remember me</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 space-y-3">
                                    <button 
                                        onClick={handleCredentialsSubmit}
                                        disabled={loading}
                                        className="w-full py-4 bg-espresso-800 hover:bg-espresso-900 text-white rounded-xl font-medium tracking-wide transition-all shadow-lg shadow-espresso-900/10 flex items-center justify-center gap-2 group text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Processing...' : (activeTab === 'login' ? 'Log In' : 'Create Account')}
                                        {!loading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
                                    </button>
                                    
                                    <div className="relative py-3">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200"></span></div>
                                        <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-3 text-taupe-400 font-bold tracking-widest">Or continue with</span></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => handleSocialLogin('google')}
                                            className="w-full py-3.5 bg-white border border-stone-200 hover:bg-cream-50 text-espresso-900 rounded-xl font-medium tracking-wide transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <GoogleIcon className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-sm">Google</span>
                                        </button>
                                        <button 
                                            onClick={() => handleSocialLogin('apple')}
                                            className="w-full py-3.5 bg-black border border-black hover:bg-gray-900 text-white rounded-xl font-medium tracking-wide transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <AppleIcon className="w-5 h-5 mb-0.5" /> 
                                            <span className="text-sm">Apple</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Step 2: Name Entry */}
                                <div className="animate-fade-in space-y-6 text-center">
                                    <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-2 text-sage-600">
                                        <UserIcon className="w-8 h-8" />
                                    </div>
                                    
                                    <div>
                                        <h2 className="text-2xl font-serif text-espresso-900 mb-2">Welcome to Auralex</h2>
                                        <p className="text-taupe-500 text-sm">How should we address you?</p>
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-fade-in">
                                            {error}
                                        </div>
                                    )}

                                    <div className="text-left space-y-2 pt-4">
                                        <label className="text-[10px] font-bold text-espresso-900 uppercase tracking-widest">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleProfileSubmit()}
                                            className="w-full px-4 py-3.5 bg-cream-50 border border-sage-400 rounded-lg text-espresso-900 text-sm focus:outline-none shadow-sm transition-colors"
                                            placeholder="Ex: Alex Reynolds"
                                            autoFocus
                                        />
                                    </div>

                                    <button 
                                        onClick={handleProfileSubmit}
                                        className="w-full py-4 bg-espresso-800 hover:bg-espresso-900 text-white rounded-xl font-medium tracking-wide transition-all shadow-lg shadow-espresso-900/10 flex items-center justify-center gap-2 group text-sm mt-8"
                                    >
                                        Complete Profile <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setStep('credentials')}
                                        className="text-xs text-taupe-400 hover:text-espresso-900 underline transition-colors"
                                    >
                                        Back
                                    </button>
                                </div>
                            </>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>

      </main>

      {/* Footer Line */}
      <div className="absolute bottom-0 left-0 right-0 py-8 text-center z-10 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto px-6">
            <div className="border-t border-espresso-900/5 pt-8">
                 <p className="text-[10px] tracking-[0.4em] text-taupe-300 font-serif font-medium">EST. MMXXV</p>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- SCREEN: DASHBOARD ---
const DashboardScreen = ({ 
  user, 
  onNavigate,
  recentItems
}: { 
  user: { name: string }, 
  onNavigate: (s: Screen) => void,
  recentItems: GeneratedContent[]
}) => {
  return (
    <div className="p-8 pt-24 max-w-6xl mx-auto animate-fade-in">
      <header className="mb-12">
        <h1 className="text-4xl font-serif text-espresso-900 mb-2">Welcome back, {user.name}</h1>
        <p className="text-taupe-500 font-light text-lg">Your audio knowledge base is ready.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div 
          onClick={() => onNavigate('upload')}
          className="group relative h-64 rounded-2xl bg-white border border-stone-100 shadow-soft overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-hover"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cream-50 to-white opacity-50" />
          <div className="relative z-10 p-8 h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-espresso-50 flex items-center justify-center text-espresso-900 mb-6 group-hover:scale-110 transition-transform duration-500">
               <UploadIcon className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-serif text-espresso-900 mb-2">Upload Audio</h3>
            <p className="text-taupe-500 font-light">Import MP3, WAV, or M4A files</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('record')} // Just navigates, no permission logic here
          className="group relative h-64 rounded-2xl bg-espresso-900 shadow-xl overflow-hidden cursor-pointer transition-all duration-500 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-espresso-900/20"
        >
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-espresso-800 to-espresso-900" />
           <div className="relative z-10 p-8 h-full flex flex-col items-center justify-center text-center text-white">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors backdrop-blur-md">
               <MicIcon className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-serif mb-2">Record Live</h3>
            <p className="text-white/60 font-light">Capture lectures or meetings in real-time</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-espresso-900">Recent Transformations</h2>
          <button onClick={() => onNavigate('library')} className="text-sage-600 hover:text-sage-500 text-sm font-medium tracking-wide">View All</button>
        </div>
        
        <div className="bg-white rounded-2xl border border-stone-100 shadow-soft overflow-hidden">
          {recentItems.length > 0 ? (
            recentItems.slice(0, 3).map((item, i) => (
              <div key={item.id} className={`p-6 flex items-center justify-between group hover:bg-cream-50 transition-colors cursor-pointer ${i !== recentItems.length -1 ? 'border-b border-stone-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-espresso-50 flex items-center justify-center text-espresso-900">
                    <FileAudioIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-espresso-900 group-hover:text-sage-600 transition-colors">{item.title}</h4>
                    <p className="text-xs text-taupe-500 mt-1">{item.date} • {item.summary.length} Key Points</p>
                  </div>
                </div>
                <ChevronLeftIcon className="w-5 h-5 text-stone-300 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
            ))
          ) : (
             <div className="p-8 text-center text-taupe-400 font-light">
                 No items yet. Upload or record audio to get started.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SCREEN: LIBRARY ---
const LibraryScreen = ({ 
  library, 
  onViewItem 
}: { 
  library: GeneratedContent[], 
  onViewItem: (item: GeneratedContent) => void 
}) => {
  return (
    <div className="p-8 pt-24 max-w-6xl mx-auto animate-fade-in">
      <header className="mb-12">
        <h1 className="text-4xl font-serif text-espresso-900 mb-2">Library</h1>
        <p className="text-taupe-500 font-light text-lg">All your transformed knowledge.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {library.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onViewItem(item)}
            className="bg-white p-6 rounded-2xl border border-stone-100 shadow-soft hover:shadow-hover transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-espresso-50 flex items-center justify-center text-espresso-900 group-hover:bg-sage-50 group-hover:text-sage-600 transition-colors">
                  <FileAudioIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-espresso-900 mb-1 group-hover:text-sage-700 transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-taupe-400">
                    <span>{item.date}</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span>{item.summary.length} Key Points</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span>{item.quiz.length} Questions</span>
                  </div>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center text-stone-300 group-hover:border-sage-200 group-hover:text-sage-600 transition-all">
                <ChevronLeftIcon className="w-5 h-5 rotate-180" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SCREEN: PROFILE ---
const ProfileScreen = ({ user, onLogout }: { user: { name: string }, onLogout: () => void }) => {
  return (
    <div className="p-8 pt-24 max-w-4xl mx-auto animate-slide-up">
       <h1 className="text-4xl font-serif text-espresso-900 mb-12">Profile</h1>
       
       <div className="bg-white rounded-3xl p-8 shadow-soft border border-stone-100 mb-8 flex items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-espresso-800 to-espresso-900 text-white flex items-center justify-center text-3xl font-serif">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-serif text-espresso-900">{user.name}</h2>
            <p className="text-taupe-500 font-light">contact@auralex.com</p>
            <span className="inline-block mt-3 px-3 py-1 bg-sage-50 text-sage-700 text-xs font-bold tracking-widest uppercase rounded-full">Premium Member</span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[{label: 'Audio Hours', val: '12.4'}, {label: 'Notes Created', val: '8'}, {label: 'Quizzes Taken', val: '24'}].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-soft text-center">
                <p className="text-3xl font-serif text-espresso-900 mb-1">{stat.val}</p>
                <p className="text-xs text-taupe-400 font-bold uppercase tracking-wider">{stat.label}</p>
             </div>
          ))}
       </div>

       <button onClick={onLogout} className="w-full py-4 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 transition-colors font-medium">
          Log Out
       </button>
    </div>
  )
};

// --- SCREEN: UPLOAD ---
const UploadScreen = ({ onFileSelect }: { onFileSelect: (file: File) => void }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-8 pt-24 max-w-4xl mx-auto h-full flex flex-col animate-slide-up">
      <h2 className="text-3xl font-serif text-espresso-900 mb-2">Upload Audio</h2>
      <p className="text-taupe-500 font-light mb-8">Supported formats: MP3, WAV, M4A, AAC</p>

      <div 
        className={`flex-1 min-h-[400px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 ${
          dragActive 
            ? "border-sage-400 bg-sage-50" 
            : "border-stone-200 bg-white hover:border-sage-400/50 hover:bg-cream-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-20 h-20 bg-espresso-50 rounded-full flex items-center justify-center mb-6 text-espresso-900">
          <UploadIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-medium text-espresso-900 mb-2">Drag & Drop your audio file</h3>
        <p className="text-taupe-500 mb-8 font-light">or click to browse from your computer</p>
        
        <input 
          ref={inputRef}
          type="file" 
          accept="audio/*,.mp3,.wav,.m4a,.aac,.webm" 
          className="hidden" 
          onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
          onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
        />
        
        <button 
          onClick={() => inputRef.current?.click()}
          className="px-8 py-3 bg-espresso-900 text-white rounded-lg hover:bg-espresso-800 transition-colors shadow-lg shadow-espresso-900/10 font-medium tracking-wide"
        >
          Select File
        </button>
      </div>
    </div>
  );
};

// --- SCREEN: RECORDING ---
const RecordScreen = ({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<BlobPart[]>([]);
    const timerRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };

            mediaRecorder.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                onRecordingComplete(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.current.start();
            setIsRecording(true);
            setDuration(0);
            timerRef.current = window.setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access denied", err);
            alert("Please enable microphone access to record audio.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-8 pt-24 max-w-4xl mx-auto h-full flex flex-col items-center justify-center animate-fade-in text-center">
             <div className="mb-12 relative">
                {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-sage-400/20 animate-ping" />
                )}
                <div className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-sage-50 text-sage-600' : 'bg-espresso-50 text-espresso-900'}`}>
                    <MicIcon className="w-16 h-16" />
                </div>
             </div>

             <div className="text-6xl font-serif font-medium tabular-nums text-espresso-900 mb-4 tracking-tight">
                 {formatTime(duration)}
             </div>
             <p className="text-taupe-500 mb-12 font-light text-lg">
                 {isRecording ? "Recording in progress..." : "Ready to capture high-fidelity audio"}
             </p>

             <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-12 py-4 rounded-full font-medium text-lg tracking-wide transition-all duration-300 shadow-xl ${
                    isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                    : 'bg-espresso-900 hover:bg-espresso-800 text-white shadow-espresso-900/20'
                }`}
             >
                 {isRecording ? (
                     <span className="flex items-center gap-3"><StopIcon className="w-5 h-5" /> Stop Recording</span>
                 ) : (
                     <span className="flex items-center gap-3"><PlayIcon className="w-5 h-5" /> Start Recording</span>
                 )}
             </button>
        </div>
    );
};

// --- SCREEN: LOADING ---
const LoadingScreen = () => {
    return (
        <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
             {/* Background decorative elements */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sage-400/5 rounded-full blur-[100px]" />

             <div className="relative z-10 flex flex-col items-center">
                 <div className="w-20 h-20 mb-12 relative">
                     <div className="absolute inset-0 border-4 border-stone-200 rounded-full" />
                     <div className="absolute inset-0 border-4 border-t-sage-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                     <BrainCircuitIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-sage-600" />
                 </div>
                 
                 <h2 className="text-3xl font-serif text-espresso-900 mb-4">Synthesizing Knowledge</h2>
                 <p className="text-taupe-500 font-light max-w-md leading-relaxed animate-pulse">
                     Our AI is analyzing audio patterns, extracting key concepts, and generating your study materials...
                 </p>
             </div>
        </div>
    );
};

// --- SUB-VIEWS FOR RESULTS SCREEN ---

const SummaryView = ({ summary }: { summary: string[] }) => (
    <div className="bg-white p-10 rounded-3xl shadow-soft border border-stone-100 animate-slide-up">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-sage-50 flex items-center justify-center">
               <BrainCircuitIcon className="w-6 h-6 text-sage-600" />
            </div>
            <div>
                <h3 className="text-2xl font-serif text-espresso-900">Key Takeaways</h3>
                <p className="text-taupe-400 text-sm">Essential concepts extracted from the audio</p>
            </div>
        </div>
        <ul className="grid grid-cols-1 gap-6">
            {summary.map((point, idx) => (
                <li key={idx} className="flex gap-6 group">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cream-100 text-espresso-900 font-serif text-sm flex items-center justify-center mt-1 group-hover:bg-sage-100 group-hover:text-sage-700 transition-colors">
                        {idx + 1}
                    </span>
                    <p className="text-lg text-taupe-600 font-light leading-relaxed pt-1.5">{point}</p>
                </li>
            ))}
        </ul>
    </div>
);

const ThesesView = ({ theses }: { theses: string[] }) => (
    <div className="animate-slide-up">
        <div className="mb-8">
             <h3 className="text-2xl font-serif text-espresso-900">Core Arguments</h3>
             <p className="text-taupe-400 text-sm mt-1">Central claims and hypotheses identified</p>
        </div>
        <div className="space-y-6">
            {theses.length > 0 ? (
                theses.map((thesis, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-soft border border-stone-100 flex gap-6 hover:shadow-hover transition-shadow group">
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex-shrink-0 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <LightbulbIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-espresso-900 mb-2">Argument {i + 1}</h4>
                            <p className="text-taupe-600 font-light leading-relaxed">{thesis}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-12 text-center text-taupe-400 bg-white rounded-2xl border border-dashed border-stone-200">
                    No explicit arguments detected in this audio segment.
                </div>
            )}
        </div>
    </div>
);

const NotesView = ({ notes }: { notes: string }) => {
    // Basic markdown parser for better presentation of deep dive content
    const parseMarkdown = (text: string) => {
        return text.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('###')) {
                return <h4 key={i} className="text-xl font-medium text-espresso-800 mt-6 mb-3">{trimmed.replace(/^###\s*/, '')}</h4>;
            }
            if (trimmed.startsWith('##')) {
                return <h3 key={i} className="text-2xl font-serif text-espresso-900 mt-8 mb-4 border-b border-stone-100 pb-2">{trimmed.replace(/^##\s*/, '')}</h3>;
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                // Check for bold text within list item
                const content = trimmed.replace(/^[-*]\s*/, '');
                return (
                    <div key={i} className="flex gap-3 mb-2 ml-4">
                        <span className="text-sage-500 mt-1.5">•</span>
                        <p className="text-taupe-600 font-light leading-relaxed">
                             {/* Simple bold parser */}
                             {content.split(/(\*\*.*?\*\*)/).map((part, j) => 
                                part.startsWith('**') && part.endsWith('**') 
                                ? <strong key={j} className="text-espresso-800 font-medium">{part.slice(2, -2)}</strong> 
                                : part
                             )}
                        </p>
                    </div>
                );
            }
            if (trimmed === '') return <br key={i} />;
            
            // Regular paragraph with bold support
            return (
                <p key={i} className="text-lg text-taupe-600 font-light leading-relaxed mb-4">
                     {trimmed.split(/(\*\*.*?\*\*)/).map((part, j) => 
                        part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={j} className="text-espresso-800 font-medium">{part.slice(2, -2)}</strong> 
                        : part
                     )}
                </p>
            );
        });
    };

    return (
        <div className="bg-white p-10 rounded-3xl shadow-soft border border-stone-100 animate-slide-up">
            <div className="max-w-3xl mx-auto">
                 <div className="flex items-center gap-4 mb-10 pb-6 border-b border-stone-100">
                    <div className="w-12 h-12 rounded-xl bg-espresso-50 flex items-center justify-center">
                        <FileAudioIcon className="w-6 h-6 text-espresso-900" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif text-espresso-900">Deep Dive Notes</h3>
                        <p className="text-taupe-400 text-sm">Comprehensive study material with external context</p>
                    </div>
                </div>
                <div className="prose prose-lg prose-stone max-w-none">
                    {parseMarkdown(notes)}
                </div>
            </div>
        </div>
    );
};

const ExamplesView = ({ examples }: { examples: string[] }) => (
    <div className="animate-slide-up">
        <div className="mb-8">
             <h3 className="text-2xl font-serif text-espresso-900">Real-World Applications</h3>
             <p className="text-taupe-400 text-sm mt-1">Practical examples to ground the theory</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {examples.map((ex, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-soft border border-stone-100 hover:shadow-hover transition-shadow">
                    <div className="text-6xl font-serif text-cream-200 mb-4 select-none">"</div>
                    <p className="text-lg text-espresso-800 font-light leading-relaxed -mt-8 relative z-10">
                        {ex}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

const QuizView = ({ quiz }: { quiz: QuizItem[] }) => {
    const [selections, setSelections] = useState<{[key: number]: number}>({});
    const [submitted, setSubmitted] = useState<{[key: number]: boolean}>({});

    const handleSelect = (qIdx: number, oIdx: number) => {
        if (submitted[qIdx]) return;
        setSelections(prev => ({ ...prev, [qIdx]: oIdx }));
    };

    const handleSubmit = (qIdx: number) => {
        if (selections[qIdx] === undefined) return;
        setSubmitted(prev => ({ ...prev, [qIdx]: true }));
    };

    return (
        <div className="max-w-3xl mx-auto animate-slide-up space-y-8">
            <div className="bg-espresso-900 text-white p-8 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-serif mb-2">Active Recall</h3>
                    <p className="text-white/70 font-light text-sm">Test your knowledge with {quiz.length} generated questions.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="font-serif text-xl">{Object.keys(submitted).length}/{quiz.length}</span>
                </div>
            </div>

            {quiz.map((item, qIdx) => (
                <div key={qIdx} className="bg-white p-8 rounded-2xl shadow-soft border border-stone-100">
                    <h4 className="text-lg font-medium text-espresso-900 mb-6 flex gap-3">
                        <span className="text-taupe-400">{qIdx + 1}.</span> {item.question}
                    </h4>
                    
                    <div className="space-y-3 mb-6">
                        {item.options.map((option, oIdx) => {
                            const isSelected = selections[qIdx] === oIdx;
                            const isSubmitted = submitted[qIdx];
                            const isCorrect = oIdx === item.correctAnswer;
                            const isWrongSelection = isSelected && !isCorrect;

                            let baseClasses = "w-full p-4 rounded-xl text-left text-sm transition-all border ";
                            if (isSubmitted) {
                                if (isCorrect) baseClasses += "bg-green-50 border-green-200 text-green-800";
                                else if (isWrongSelection) baseClasses += "bg-red-50 border-red-200 text-red-800";
                                else baseClasses += "bg-gray-50 border-transparent text-gray-400 opacity-60";
                            } else {
                                if (isSelected) baseClasses += "bg-espresso-50 border-espresso-900 text-espresso-900 font-medium";
                                else baseClasses += "bg-white border-stone-200 text-taupe-600 hover:bg-cream-50";
                            }

                            return (
                                <button
                                    key={oIdx}
                                    onClick={() => handleSelect(qIdx, oIdx)}
                                    disabled={isSubmitted}
                                    className={baseClasses}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option}</span>
                                        {isSubmitted && isCorrect && <CheckIcon className="w-4 h-4 text-green-600" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {!submitted[qIdx] ? (
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSubmit(qIdx)}
                                disabled={selections[qIdx] === undefined}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selections[qIdx] !== undefined 
                                    ? 'bg-espresso-900 text-white hover:bg-espresso-800' 
                                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                }`}
                            >
                                Check Answer
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4 p-4 bg-sage-50 rounded-lg border border-sage-100 animate-fade-in">
                            <p className="text-xs font-bold text-sage-800 uppercase tracking-wider mb-1">Explanation</p>
                            <p className="text-sage-700 text-sm leading-relaxed">{item.explanation}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// --- SCREEN: RESULTS ---
const ResultsScreen = ({ 
    content, 
    isSyncing, 
    onSaveFile 
}: { 
    content: GeneratedContent, 
    isSyncing: boolean,
    onSaveFile: () => void 
}) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'theses' | 'notes' | 'examples' | 'quiz'>('summary');

    const tabs = [
        { id: 'summary', label: 'Key Takeaways', icon: BrainCircuitIcon, desc: 'Core concepts' },
        { id: 'theses', label: 'Core Arguments', icon: LightbulbIcon, desc: 'Central Claims' },
        { id: 'notes', label: 'Deep Dive', icon: FileAudioIcon, desc: 'Full detailed notes' },
        { id: 'examples', label: 'Applications', icon: LibraryIcon, desc: 'Real-world usage' },
        { id: 'quiz', label: 'Quiz', icon: CheckIcon, desc: 'Test knowledge' },
    ] as const;

    return (
        <div className="p-6 md:p-8 pt-24 max-w-7xl mx-auto animate-slide-up pb-32">
            {/* Header Area */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-sage-700 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                             <CheckIcon className="w-3 h-3" />
                             Processed
                        </span>
                        
                        {/* Guardrail Metric */}
                        <div className="group relative">
                             <span className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 cursor-help ${
                                content.confidenceScore > 80 
                                ? 'bg-sage-50 border-sage-100 text-sage-700' 
                                : 'bg-orange-50 border-orange-100 text-orange-700'
                             }`}>
                                 <ShieldCheckIcon className="w-3 h-3" />
                                 Accuracy: {content.confidenceScore}%
                             </span>
                             {/* Tooltip for Accuracy Note */}
                             <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-white rounded-xl shadow-xl border border-stone-100 text-xs text-taupe-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                 {content.accuracyNote}
                             </div>
                        </div>

                        <span className="text-stone-400 text-sm font-medium">{content.date}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-espresso-900 leading-tight max-w-4xl">
                        {content.title}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                     {isSyncing ? (
                        <div className="flex items-center gap-2 text-taupe-400 animate-pulse mr-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-sage-500"></div>
                            <span className="text-xs font-medium tracking-wide uppercase">Syncing...</span>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2 text-sage-600 mr-4 animate-fade-in">
                            <CheckIcon className="w-4 h-4" />
                            <span className="text-xs font-medium tracking-wide uppercase">Saved</span>
                        </div>
                    )}

                    <button 
                        onClick={onSaveFile}
                        className="group flex items-center gap-2 px-5 py-3 bg-espresso-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-espresso-900/10 hover:bg-espresso-800 transition-all hover:-translate-y-0.5"
                    >
                        <SaveIcon className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </header>

            {/* Audio Player */}
            {content.audioDataUrl && (
                <div className="mb-12 max-w-2xl">
                    <LuxuryAudioPlayer src={content.audioDataUrl} />
                </div>
            )}

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* Navigation Sidebar (Desktop) / Scrollbar (Mobile) */}
                <div className="lg:col-span-3">
                    <nav className="sticky top-24 flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-2 lg:gap-3 no-scrollbar" aria-label="Content Sections">
                        {tabs.map((tab) => {
                            // @ts-ignore
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    // @ts-ignore
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex-shrink-0 flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all duration-300 group
                                        ${isActive 
                                            ? 'bg-white shadow-soft border-l-4 border-l-sage-500 text-espresso-900' 
                                            : 'hover:bg-white/50 text-taupe-500 hover:text-espresso-900 border-l-4 border-l-transparent'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-sage-600' : 'text-taupe-400 group-hover:text-sage-500'}`} />
                                    <div>
                                        <div className={`text-sm font-bold tracking-wide ${isActive ? 'text-espresso-900' : 'text-taupe-600'}`}>
                                            {tab.label}
                                        </div>
                                        {isActive && <div className="text-[10px] text-taupe-400 font-medium hidden lg:block animate-fade-in">{tab.desc}</div>}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 min-h-[500px]">
                     <div className="animate-fade-in">
                        {activeTab === 'summary' && <SummaryView summary={content.summary} />}
                        {activeTab === 'theses' && <ThesesView theses={content.theses} />}
                        {activeTab === 'notes' && <NotesView notes={content.runningNotes} />}
                        {activeTab === 'examples' && <ExamplesView examples={content.examples} />}
                        {activeTab === 'quiz' && <QuizView quiz={content.quiz} />}
                     </div>
                </div>

            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [user, setUser] = useState<{name: string} | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [savedLibrary, setSavedLibrary] = useState<GeneratedContent[]>([]);
  const [historyStack, setHistoryStack] = useState<Screen[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Load Library on Mount
  useEffect(() => {
    const data = storageService.getLibrary();
    setSavedLibrary(data);
  }, []);

  // Navigation Helper
  const navigateTo = (screen: Screen) => {
    if (screen === currentScreen) return;
    setHistoryStack(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  // Back Handler - Right Bottom Corner Logic
  const handleBack = () => {
     if (historyStack.length > 0) {
        const prev = historyStack[historyStack.length - 1];
        setHistoryStack(prev => prev.slice(0, -1));
        setCurrentScreen(prev);
     } else {
        // Fallback if no history (e.g. reload or direct state change)
        if (currentScreen !== 'dashboard' && currentScreen !== 'auth') {
             setCurrentScreen('dashboard');
        }
     }
  };
  
  // Handlers
  const handleLogin = (userName: string) => {
    setUser({ name: userName });
    setCurrentScreen('dashboard');
    setHistoryStack([]); // Reset history on login
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('auth');
    setHistoryStack([]);
  }

  const handleLibraryItemClick = (item: GeneratedContent) => {
      setGeneratedContent(item);
      navigateTo('results');
  }

  // --- SAVE TO LOCAL FILE (FILE SYSTEM ACCESS API) ---
  const saveToLocalFile = async () => {
      if (!generatedContent) return;

      try {
        // Prepare content for JSON
        const contentToSave = JSON.stringify(generatedContent, null, 2);
        
        // Check for File System Access API support
        // @ts-ignore
        if (window.showSaveFilePicker) {
            // @ts-ignore
            const handle = await window.showSaveFilePicker({
                suggestedName: `${generatedContent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`,
                types: [{
                    description: 'Auralex Data File',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(contentToSave);
            await writable.close();
        } else {
            // Fallback for browsers that don't support the API
            const blob = new Blob([contentToSave], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${generatedContent.title}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        setShowSavePrompt(false);
      } catch (err: any) {
          if (err.name !== 'AbortError') {
              console.error("File save error:", err);
              alert("Failed to save file. Please try again.");
          }
      }
  };

  const handleProcessing = async (blob: Blob) => {
    setCurrentScreen('loading'); // Note: 'loading' is transient, we don't push it to history stack
    try {
        const options: ProcessingOptions = { 
            shortNotes: true,
            theses: true,
            examples: true, 
            quiz: true, 
            runningNotes: true 
        };
        const result = await generateLearningMaterial(blob, options);
        
        // Convert Blob to Data URL for playback
        const audioDataUrl = await blobToDataUrl(blob);

        // Add ID and Date
        const fullContent: GeneratedContent = {
            ...result,
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            audioDataUrl // Save audio for playback
        };
        
        setGeneratedContent(fullContent);
        
        // Save to Database (Async)
        setIsSyncing(true);
        const updatedLib = await storageService.saveContent(fullContent);
        setSavedLibrary(updatedLib);
        setIsSyncing(false);

        setCurrentScreen('results'); // Transient transition
        
        // Trigger Save Prompt
        setShowSavePrompt(true);

    } catch (error: any) {
        console.error(error);
        alert(error.message || "Failed to process audio. Please try again.");
        setCurrentScreen('dashboard');
    }
  };

  // Render Content based on Screen
  const renderScreen = () => {
    switch(currentScreen) {
        case 'auth':
            return <AuthScreen onLogin={handleLogin} />;
        case 'loading':
            return <LoadingScreen />;
        case 'dashboard':
            return <DashboardScreen user={user!} onNavigate={navigateTo} recentItems={savedLibrary} />;
        case 'upload':
            return <UploadScreen onFileSelect={(file) => handleProcessing(file)} />;
        case 'record':
            return <RecordScreen onRecordingComplete={(blob) => handleProcessing(blob)} />;
        case 'results':
            return generatedContent ? (
                <ResultsScreen 
                    content={generatedContent} 
                    isSyncing={isSyncing} 
                    onSaveFile={saveToLocalFile} 
                />
            ) : <DashboardScreen user={user!} onNavigate={navigateTo} recentItems={savedLibrary} />;
        case 'library':
            return <LibraryScreen library={savedLibrary} onViewItem={handleLibraryItemClick} />; 
        case 'profile':
            return <ProfileScreen user={user!} onLogout={handleLogout} />;
        default:
            return <DashboardScreen user={user!} onNavigate={navigateTo} recentItems={savedLibrary} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-cream-50 text-espresso-900 font-sans selection:bg-sage-200 relative">
      {/* Save Prompt Overlay */}
      {showSavePrompt && (
          <SavePromptModal 
            onSave={saveToLocalFile} 
            onCancel={() => setShowSavePrompt(false)} 
          />
      )}

      {currentScreen !== 'auth' && currentScreen !== 'loading' && (
        <Navigation currentScreen={currentScreen} setScreen={navigateTo} />
      )}
      
      <main className={`flex-1 transition-all duration-500 ${currentScreen !== 'auth' && currentScreen !== 'loading' ? 'pb-20 md:pb-0' : ''}`}>
        {renderScreen()}
      </main>

      {/* Floating Back Button - Right Bottom Corner */}
      {currentScreen !== 'auth' && currentScreen !== 'dashboard' && currentScreen !== 'loading' && (
        <button 
            onClick={handleBack}
            className="fixed bottom-24 md:bottom-10 right-6 md:right-10 z-40 bg-white text-espresso-900 px-5 py-3 rounded-full shadow-soft hover:shadow-hover border border-stone-100 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:bg-espresso-900 hover:text-white font-medium text-sm tracking-wide group"
        >
            <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
        </button>
      )}
    </div>
  );
}