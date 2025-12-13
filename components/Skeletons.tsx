import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-slate-200 animate-pulse ${className}`} />
);

export const ResultsSkeleton: React.FC = () => {
  return (
    <div className="animate-fade-in w-full max-w-full overflow-hidden relative">
      {/* Central Loading Indicator */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-cherry/10 border border-white flex flex-col items-center animate-float">
             <div className="relative mb-4">
                <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-cherry border-t-transparent rounded-full animate-spin"></div>
                <i className="fa-solid fa-wand-magic-sparkles absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-cherry text-lg animate-pulse"></i>
             </div>
             <p className="font-serif text-slate-800 font-bold tracking-widest text-sm uppercase mb-1">Analyzing Audio</p>
             <p className="text-xs text-slate-400 font-medium">Generating smart notes & quizzes...</p>
          </div>
      </div>

      {/* Header Skeleton */}
      <div className="mb-8 flex flex-col md:flex-row justify-between gap-6 opacity-40 pointer-events-none select-none filter blur-sm transition-all duration-1000">
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="h-12 w-2/3 rounded-2xl" /> 
          <Skeleton className="h-5 w-1/2 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-2 border-b border-gray-100 mb-8 pb-1 opacity-40 pointer-events-none select-none filter blur-sm">
        <Skeleton className="h-14 w-40 rounded-t-2xl" />
        <Skeleton className="h-14 w-40 rounded-t-2xl" />
        <Skeleton className="h-14 w-40 rounded-t-2xl" />
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 opacity-40 pointer-events-none select-none filter blur-sm">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 h-96 relative overflow-hidden">
             <div className="flex items-center mb-8 gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-8 w-48 rounded-lg" />
             </div>
             <div className="space-y-6">
               <Skeleton className="h-4 w-full rounded-md" />
               <Skeleton className="h-4 w-11/12 rounded-md" />
               <Skeleton className="h-4 w-full rounded-md" />
               <Skeleton className="h-4 w-4/5 rounded-md" />
               <div className="pt-4 space-y-4">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
               </div>
             </div>
          </div>
        </div>
        
        {/* Sidebar Skeleton */}
         <div className="space-y-6 hidden lg:block">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 h-72 flex flex-col justify-center space-y-4">
               <Skeleton className="w-12 h-12 rounded-2xl mb-2" />
               <Skeleton className="h-4 w-full rounded-md" />
               <Skeleton className="h-4 w-3/4 rounded-md" />
               <Skeleton className="h-4 w-5/6 rounded-md" />
            </div>
         </div>
      </div>
    </div>
  );
};