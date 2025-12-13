import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (email && password.length >= 6) {
        onLogin({
          name: email.split('@')[0],
          email: email,
        });
      } else {
        setError('Invalid credentials (min 6 chars).');
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        name: 'Google User',
        email: 'user@gmail.com',
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cream relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-tan/20 rounded-full blur-3xl -translate-y-1/2"></div>
      
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between p-6 md:p-12 relative z-10 gap-12">
        
        {/* Left Side: Branding */}
        <div className="flex-1 text-center md:text-left space-y-8 animate-slide-right">
          <div className="flex items-center justify-center md:justify-start gap-4">
             <div className="w-16 h-16 rounded-full border-2 border-dotted border-cherry/30 flex items-center justify-center animate-heartbeat">
               <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cherry to-tan opacity-80 shadow-lg"></div>
             </div>
             <h1 className="text-5xl md:text-6xl font-serif font-bold text-coffee tracking-tight animate-blur-slide opacity-0">AURALEX</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-normal text-slate-800 leading-tight">
              Master your audio.<br/>
              <span className="font-serif italic text-cherry">Elevate your mind.</span>
            </h2>
            <p className="text-slate-500 max-w-md leading-relaxed">
              Seamlessly transform recordings and files into interactive learning materials using advanced AI.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-bold tracking-widest text-slate-400 opacity-60">
             <div className="h-px bg-slate-300 w-12"></div>
             <span>EST. MMXXV</span>
             <div className="h-px bg-slate-300 w-12"></div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="flex-1 w-full max-w-md animate-slide-up">
           <div className="bg-white rounded-[2rem] shadow-2xl shadow-tan/20 p-8 md:p-10 border border-white">
              
              {/* Tabs */}
              <div className="flex bg-gray-50 p-1 rounded-full mb-8">
                <button 
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 text-xs font-bold tracking-wider rounded-full transition-all duration-300 ${isLogin ? 'bg-white shadow-sm text-cherry' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  LOG IN
                </button>
                <button 
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 text-xs font-bold tracking-wider rounded-full transition-all duration-300 ${!isLogin ? 'bg-white shadow-sm text-cherry' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  SIGN UP
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                   <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1 block">Email Address</label>
                   <div className="relative group">
                     <i className="fa-regular fa-envelope absolute left-4 top-4 text-slate-300 group-focus-within:text-cherry transition-colors"></i>
                     <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       placeholder="name@example.com"
                       className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-tan focus:bg-white focus:ring-4 focus:ring-tan/10 transition-all"
                       required
                     />
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1 block">Password</label>
                   <div className="relative group">
                     <i className="fa-solid fa-lock absolute left-4 top-4 text-slate-300 group-focus-within:text-cherry transition-colors"></i>
                     <input 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="••••••••"
                       className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-tan focus:bg-white focus:ring-4 focus:ring-tan/10 transition-all"
                       required
                     />
                   </div>
                </div>

                {error && <div className="text-red-500 text-xs bg-red-50 p-2 rounded-lg text-center">{error}</div>}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-coffee text-white rounded-xl py-4 font-bold text-sm tracking-wide shadow-lg hover:bg-slate-900 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? 'Processing...' : (
                    <>
                      {isLogin ? 'Start Learning' : 'Create Account'} 
                      <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </>
                  )}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                 <div className="h-px bg-slate-100 flex-1"></div>
                 <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Or Continue With</span>
                 <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl py-3.5 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span>Google</span>
              </button>

           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;