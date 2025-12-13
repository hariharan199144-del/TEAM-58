import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Recorder from './components/Recorder';
import Quiz from './components/Quiz';
import Login from './components/Login';
import { ResultsSkeleton } from './components/Skeletons';
import { Screen, AnalysisResult, AppState, User } from './types';
import { analyzeAudioContent } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentScreen: 'dashboard',
    isRecording: false,
    isAnalyzing: false,
    audioBlob: null,
    analysisResult: null,
    history: [],
    error: null,
    user: null, 
    isSidebarOpen: true,
  });

  const [activeTab, setActiveTab] = useState<'notes' | 'examples' | 'quiz' | 'thesis'>('notes');

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, user, currentScreen: 'dashboard', isSidebarOpen: true }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, user: null, audioBlob: null, analysisResult: null }));
  };

  const toggleSidebar = () => {
    setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
  };

  const handleNavigate = (screen: Screen) => {
    setState(prev => ({ ...prev, currentScreen: screen, error: null }));
  };

  const handleAnalysisStart = async (blob: Blob) => {
    setState(prev => ({ ...prev, isAnalyzing: true, audioBlob: blob, currentScreen: 'results' })); 
    
    try {
      const result = await analyzeAudioContent(blob);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysisResult: result,
        history: [
          {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            title: result.title,
            duration: 'Audio',
            type: 'record',
            result: result
          },
          ...prev.history
        ]
      }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        currentScreen: 'dashboard',
        error: 'Failed to analyze audio. Please try again.' 
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('audio/')) {
        setState(prev => ({...prev, error: "Please upload a valid audio file."}));
        return;
      }
      handleAnalysisStart(file);
    }
  };

  const getBackgroundClass = () => {
    switch (state.currentScreen) {
      case 'record': return 'bg-slate-900';
      case 'dashboard': return 'bg-cream'; 
      case 'upload': return 'bg-gradient-to-br from-cream to-tan/20';
      case 'results': return 'bg-slate-50';
      default: return 'bg-cream';
    }
  };

  if (!state.user) {
    return <Login onLogin={handleLogin} />;
  }

  // Render Screens
  const renderScreen = () => {
    // Show Skeleton when analyzing
    if (state.isAnalyzing) {
      return <ResultsSkeleton />;
    }

    if (state.error) {
       return (
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center p-6 animate-fade-in">
           <div className="w-16 h-16 bg-red-100 text-cherry rounded-full flex items-center justify-center mb-4">
             <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h3>
           <p className="text-slate-500 mb-6">{state.error}</p>
           <button onClick={() => setState(prev => ({...prev, error: null}))} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">Dismiss</button>
        </div>
       );
    }

    switch (state.currentScreen) {
      case 'dashboard':
        return (
          <div className="space-y-12 animate-slide-up relative z-10">
            
            <header className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-6xl md:text-8xl font-serif font-bold text-slate-800 tracking-tighter animate-blur-slide">
                  AURALEX
                </h1>
                <p className="text-slate-500 text-lg mt-2 font-medium animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                  Welcome back, {state.user.name.split(' ')[0]}
                </p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold tracking-widest text-slate-400">TODAY'S FOCUS</p>
                <p className="text-slate-700 font-medium">{new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'})}</p>
              </div>
            </header>

            {/* THREE ANIMATED TEMPLATES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px] md:h-[500px]">
              
              {/* Template 1: The Studio (Record) */}
              <div 
                onClick={() => handleNavigate('record')}
                className="group relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cherry/30 col-span-1 md:col-span-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D2424] to-black z-0"></div>
                {/* Animated Waveform Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-3 bg-cherry rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-cherry group-hover:border-cherry transition-colors">
                    <i className="fa-solid fa-microphone-lines text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-3xl font-serif text-white mb-2 leading-none">Studio<br/>Mode</h3>
                    <p className="text-white/60 text-sm mb-4">Record high-fidelity audio notes.</p>
                    <span className="inline-flex items-center text-white text-xs font-bold tracking-widest uppercase border-b border-white/30 pb-1 group-hover:border-cherry transition-colors">
                      Start Recording <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </span>
                  </div>
                </div>
              </div>

              {/* Template 2: The Cloud (Upload) */}
              <div 
                onClick={() => handleNavigate('upload')}
                className="group relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-tan/40 col-span-1 md:col-span-1"
              >
                <div className="absolute inset-0 bg-gradient-to-bl from-[#E6DBAC] to-[#FDFBF7] z-0"></div>
                {/* Floating Elements Animation */}
                <div className="absolute top-10 right-10 w-24 h-24 bg-white/40 rounded-full blur-xl animate-float"></div>
                <div className="absolute bottom-20 left-10 w-32 h-32 bg-cherry/5 rounded-full blur-xl animate-float-delayed"></div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                  <div className="w-12 h-12 rounded-full bg-slate-800/5 backdrop-blur-md flex items-center justify-center text-slate-800 border border-slate-800/10 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-3xl font-serif text-slate-800 mb-2 leading-none">Import<br/>Audio</h3>
                    <p className="text-slate-600 text-sm mb-4">Analyze pre-recorded lectures.</p>
                    <span className="inline-flex items-center text-slate-800 text-xs font-bold tracking-widest uppercase border-b border-slate-800/30 pb-1 group-hover:border-slate-800 transition-colors">
                      Upload File <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </span>
                  </div>
                </div>
              </div>

               {/* Template 3: The Library (History) */}
               <div 
                onClick={() => handleNavigate('history')}
                className="group relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-300 col-span-1 md:col-span-1"
              >
                <div className="absolute inset-0 bg-slate-100 z-0"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-cherry border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-book-open text-xl"></i>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                     <div className="text-center">
                        <span className="block text-5xl font-bold text-slate-300 group-hover:text-cherry transition-colors mb-2">{state.history.length}</span>
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Saved Sessions</span>
                     </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-slate-800 leading-none mb-1">Your Library</h3>
                    <span className="inline-flex items-center text-slate-500 text-xs font-bold tracking-widest uppercase group-hover:text-cherry transition-colors">
                      View All <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100/50">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-serif font-bold text-slate-800">Recent Insights</h3>
                 <button className="text-xs font-bold text-cherry tracking-widest uppercase hover:underline">See All</button>
               </div>
               
               {state.history.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                    <i className="fa-solid fa-scroll text-4xl mb-3 opacity-50"></i>
                    <p className="text-sm">Your knowledge base is empty.</p>
                 </div>
               ) : (
                 <div className="grid gap-4">
                   {state.history.slice(0, 3).map((item) => (
                     <div key={item.id} className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-tan hover:bg-white hover:shadow-lg hover:shadow-tan/10 transition-all duration-300 animate-slide-up">
                       <div className="flex items-center space-x-4">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${item.type === 'record' ? 'bg-cherry/10 text-cherry' : 'bg-tan/30 text-slate-800'}`}>
                           <i className={`fa-solid ${item.type === 'record' ? 'fa-microphone' : 'fa-file-audio'}`}></i>
                         </div>
                         <div>
                           <h4 className="font-bold text-slate-800 text-sm group-hover:text-cherry transition-colors">{item.title || "Untitled Session"}</h4>
                           <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">{item.type.toUpperCase()}</span>
                             <span className="text-xs text-slate-400">{item.date}</span>
                           </div>
                         </div>
                       </div>
                       <button 
                         onClick={() => {
                           if(item.result) {
                             setState(prev => ({...prev, analysisResult: item.result!, currentScreen: 'results'}));
                           }
                         }}
                         className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-cherry hover:text-white hover:border-cherry transition-all"
                        >
                         <i className="fa-solid fa-chevron-right text-xs"></i>
                       </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        );

      case 'record':
        return (
          <div className="h-full flex items-center animate-slide-right">
             <Recorder onAnalysisStart={handleAnalysisStart} />
          </div>
        );

      case 'upload':
        return (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in p-6 relative">
            <div className="absolute inset-0 bg-dots-pattern opacity-30 pointer-events-none"></div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-tan/20 border border-white text-center max-w-md w-full relative overflow-hidden z-10 animate-float">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cherry to-tan"></div>
               <div className="w-24 h-24 bg-gradient-to-br from-cream to-white text-slate-800 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner border border-tan/20">
                 <i className="fa-solid fa-cloud-arrow-up text-3xl text-cherry"></i>
               </div>
               <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">Upload Audio</h2>
               <p className="text-slate-500 mb-8 text-sm px-4">Drag and drop or select an audio file to unlock AI insights.</p>
               
               <label className="block w-full group cursor-pointer">
                 <span className="sr-only">Choose file</span>
                 <input 
                   type="file" 
                   accept="audio/*" 
                   onChange={handleFileUpload}
                   className="block w-full text-sm text-slate-500
                     file:mr-4 file:py-4 file:px-6
                     file:rounded-full file:border-0
                     file:text-xs file:font-bold file:tracking-widest file:uppercase
                     file:bg-slate-800 file:text-white
                     file:shadow-lg
                     group-hover:file:bg-cherry
                     group-hover:file:scale-105
                     file:transition-all
                     cursor-pointer bg-slate-50 rounded-full border border-slate-200"
                 />
               </label>
            </div>
          </div>
        );
      
      case 'results':
        if (!state.analysisResult) return null;
        return (
          <div className="animate-fade-in pb-20 md:pb-0">
             <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h2 className="text-3xl font-serif font-bold text-slate-800">{state.analysisResult.title || "Analysis Result"}</h2>
                 <p className="text-slate-500 mt-1 italic">{state.analysisResult.summary}</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleNavigate('dashboard')} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold tracking-wide transition-colors uppercase">Close</button>
               </div>
             </header>

             {/* Result Tabs */}
             <div className="flex space-x-2 border-b border-gray-200 mb-8 overflow-x-auto pb-1 scrollbar-hide">
               {[
                 { id: 'notes', label: 'Study Notes', icon: 'fa-book-open' },
                 { id: 'examples', label: 'Examples', icon: 'fa-lightbulb' },
                 { id: 'quiz', label: 'Take Quiz', icon: 'fa-graduation-cap' },
                 { id: 'thesis', label: 'Thesis', icon: 'fa-scroll' }
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center space-x-2 px-6 py-4 rounded-t-2xl text-sm font-bold tracking-wide transition-colors whitespace-nowrap ${
                     activeTab === tab.id 
                       ? 'bg-white text-cherry border-b-2 border-cherry shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]' 
                       : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                   }`}
                 >
                   <i className={`fa-solid ${tab.icon}`}></i>
                   <span>{tab.label}</span>
                 </button>
               ))}
             </div>

             <div className="min-h-[400px]">
                {activeTab === 'notes' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-tan/20 rounded-bl-[4rem] pointer-events-none"></div>
                        <h3 className="text-xl font-serif font-bold text-slate-800 mb-6 flex items-center">
                          <i className="fa-solid fa-list-ul mr-3 text-cherry"></i>
                          Key Points
                        </h3>
                        <ul className="space-y-4">
                          {state.analysisResult.shortNotes.map((note, i) => (
                            <li key={i} className="flex items-start text-slate-700 leading-relaxed group hover:bg-cream p-3 rounded-xl transition-colors">
                              <span className="w-2 h-2 bg-tan rounded-full mt-2.5 mr-4 flex-shrink-0 group-hover:bg-cherry transition-colors"></span>
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-serif font-bold text-slate-800 mb-6 flex items-center">
                          <i className="fa-solid fa-align-left mr-3 text-cherry"></i>
                          Running Notes
                        </h3>
                        <div className="prose prose-slate max-w-none text-slate-700 font-light">
                           <p className="whitespace-pre-line leading-loose">{state.analysisResult.runningNotes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'examples' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
                    {state.analysisResult.examples.map((example, i) => (
                      <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-tan/20 transition-all hover:-translate-y-1">
                        <div className="w-12 h-12 bg-cream text-cherry rounded-2xl flex items-center justify-center mb-6 font-serif font-bold text-xl">
                          {i + 1}
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{example}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <Quiz questions={state.analysisResult.quiz} />
                )}

                {activeTab === 'thesis' && (
                  <div className="animate-slide-up bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-100 max-w-4xl mx-auto print:shadow-none print:border-none">
                     {/* Title Page */}
                     <div className="text-center mb-16 border-b pb-12 border-slate-100">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">{state.analysisResult.thesis.titlePage.title}</h1>
                        <p className="text-xl text-slate-600 mb-2 font-medium">{state.analysisResult.thesis.titlePage.author}</p>
                        <p className="text-slate-500 italic">{state.analysisResult.thesis.titlePage.institution}</p>
                        <p className="text-slate-400 mt-6 text-sm tracking-widest uppercase">{state.analysisResult.thesis.titlePage.date}</p>
                     </div>
                     
                     {/* Sections */}
                     <div className="space-y-12 text-slate-700 leading-loose text-lg font-light">
                        <section>
                          <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 border-b border-tan/30 pb-2 inline-block">Abstract</h3>
                          <p>{state.analysisResult.thesis.abstract}</p>
                        </section>

                        <section>
                          <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 border-b border-tan/30 pb-2 inline-block">1. Introduction</h3>
                          <p>{state.analysisResult.thesis.introduction}</p>
                        </section>

                        <section>
                          <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 border-b border-tan/30 pb-2 inline-block">2. Literature Review</h3>
                          <p>{state.analysisResult.thesis.literatureReview}</p>
                        </section>

                        <section>
                          <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 border-b border-tan/30 pb-2 inline-block">3. Methodology</h3>
                          <p>{state.analysisResult.thesis.methodology}</p>
                        </section>

                        <section>
                          <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 border-b border-tan/30 pb-2 inline-block">4. Results & Analysis</h3>
                          <p>{state.analysisResult.thesis.resultsAnalysis}</p>
                        </section>

                        <section>
                          <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 border-b border-tan/30 pb-2 inline-block">5. Discussion</h3>
                          <p>{state.analysisResult.thesis.discussion}</p>
                        </section>

                        <section>
                          <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 border-b border-tan/30 pb-2 inline-block">6. Conclusion</h3>
                          <p>{state.analysisResult.thesis.conclusion}</p>
                        </section>
                        
                        {/* References */}
                        <section className="bg-cream/50 p-8 rounded-2xl">
                          <h3 className="text-2xl font-serif font-bold text-slate-800 mb-6">References</h3>
                          <ul className="list-disc pl-5 space-y-4 text-base text-slate-600">
                            {state.analysisResult.thesis.references.map((ref, i) => <li key={i} className="pl-2">{ref}</li>)}
                          </ul>
                        </section>
                     </div>
                  </div>
                )}
             </div>
          </div>
        );
      
      case 'history':
        return (
           <div className="animate-slide-up space-y-8">
              <header>
                <h2 className="text-4xl font-serif font-bold text-slate-800">History</h2>
                <p className="text-slate-500 mt-2">Your past recordings and uploads.</p>
              </header>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                 {state.history.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                      <i className="fa-solid fa-box-open text-5xl mb-6 opacity-30"></i>
                      <p>No history yet.</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-slate-100">
                       {state.history.map((item) => (
                         <div key={item.id} className="p-6 flex items-center justify-between hover:bg-cream transition-colors group animate-slide-up">
                            <div className="flex items-center space-x-5">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${item.type === 'record' ? 'bg-cherry text-white' : 'bg-tan text-slate-800'}`}>
                                <i className={`fa-solid ${item.type === 'record' ? 'fa-microphone' : 'fa-file-audio'} text-xl`}></i>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-lg group-hover:text-cherry transition-colors">{item.title}</h4>
                                <p className="text-sm text-slate-500 mt-1">{item.date} • {item.duration}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                if(item.result) {
                                  setState(prev => ({...prev, analysisResult: item.result!, currentScreen: 'results'}));
                                }
                              }}
                              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-colors"
                            >
                              View
                            </button>
                         </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${getBackgroundClass()}`}>
      <Navigation 
        currentScreen={state.currentScreen} 
        onNavigate={handleNavigate} 
        isSidebarOpen={state.isSidebarOpen}
        user={state.user}
        onLogout={handleLogout}
      />

      {/* Sidebar Toggle Button (Desktop Only) */}
      <div className="fixed top-5 left-5 z-50 hidden md:block">
        <button
          onClick={toggleSidebar}
          className="w-12 h-12 bg-white/80 backdrop-blur text-slate-700 rounded-full shadow-sm border border-slate-200 flex items-center justify-center hover:bg-cherry hover:text-white transition-all hover:scale-110"
          title="Toggle Sidebar"
        >
          <i className={`fa-solid ${state.isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'} text-lg`}></i>
        </button>
      </div>
      
      {/* Main Content Layout */}
      <main className={`
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        min-h-screen
        ${state.isSidebarOpen ? 'md:ml-64' : 'md:ml-0'} 
        p-4 md:p-8
        pb-24 md:pb-8
      `}>
        <div className="max-w-7xl mx-auto h-full pt-16 md:pt-4">
          {renderScreen()}
        </div>
      </main>
    </div>
  );
};

export default App;