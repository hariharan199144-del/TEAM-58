import React from 'react';
import { Screen, User } from '../types';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isSidebarOpen: boolean;
  user: User | null;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate, isSidebarOpen, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', icon: 'fa-home', label: 'Home' },
    { id: 'record', icon: 'fa-microphone', label: 'Record' },
    { id: 'upload', icon: 'fa-cloud-upload', label: 'Upload' },
    { id: 'history', icon: 'fa-history', label: 'History' },
  ];

  return (
    <>
      {/* Desktop Sidebar - Collapsible */}
      <nav 
        className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 shadow-sm transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-6 pt-20 flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-cherry rounded-lg flex items-center justify-center text-white shrink-0">
            <i className="fa-solid fa-wave-square"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight whitespace-nowrap">Auralex</h1>
        </div>
        
        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Screen)}
              className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap ${
                currentScreen === item.id 
                  ? 'bg-cherry text-white shadow-md' 
                  : 'text-slate-500 hover:bg-sand/30 hover:text-cherry'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center transition-transform group-hover:scale-110`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 mt-auto">
           <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl whitespace-nowrap overflow-hidden">
             {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full" />
             ) : (
                <div className="w-8 h-8 rounded-full bg-tan flex items-center justify-center text-cherry font-bold text-xs shrink-0">
                  {user?.name.substring(0,2).toUpperCase() || 'US'}
                </div>
             )}
             <div className="flex-1 min-w-0">
               <p className="font-semibold text-slate-700 text-sm truncate">{user?.name || 'User'}</p>
               <button onClick={onLogout} className="text-xs text-cherry hover:underline">Log Out</button>
             </div>
           </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 px-6 py-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Screen)}
            className={`flex flex-col items-center space-y-1 transition-colors duration-200 ${
              currentScreen === item.id ? 'text-cherry' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              currentScreen === item.id ? 'bg-cherry/10' : ''
            }`}>
              <i className={`fa-solid ${item.icon} text-lg ${currentScreen === item.id ? 'transform scale-110' : ''}`}></i>
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        {/* Mobile Logout Button (Small) */}
         <button
            onClick={onLogout}
            className="flex flex-col items-center space-y-1 text-slate-400 hover:text-red-600 transition-colors"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full">
              <i className="fa-solid fa-right-from-bracket text-lg"></i>
            </div>
            <span className="text-[10px] font-medium">Exit</span>
          </button>
      </nav>
    </>
  );
};

export default Navigation;