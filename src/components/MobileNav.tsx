import React from 'react';
import { Home, Search, Library, Heart, PlusSquare, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileNavProps {
  activeTab: 'home' | 'search' | 'library' | 'liked';
  onTabChange: (tab: 'home' | 'search' | 'library' | 'liked') => void;
  onUploadClick: () => void;
  onBackgroundSettingsClick: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
  activeTab, 
  onTabChange,
  onUploadClick,
  onBackgroundSettingsClick
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-xl border-t border-glass-border flex items-center justify-around px-2 z-50">
      <button 
        onClick={() => onTabChange('home')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === 'home' ? "text-accent" : "text-text-secondary"
        )}
      >
        <Home size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
      </button>
      
      <button 
        onClick={() => onTabChange('search')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === 'search' ? "text-accent" : "text-text-secondary"
        )}
      >
        <Search size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Search</span>
      </button>

      <button 
        onClick={onUploadClick}
        className="flex flex-col items-center gap-1 text-text-secondary hover:text-accent transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center -mt-8 shadow-lg shadow-accent/40 border-4 border-surface">
          <PlusSquare size={20} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">Upload</span>
      </button>

      <button 
        onClick={() => onTabChange('library')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === 'library' ? "text-accent" : "text-text-secondary"
        )}
      >
        <Library size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Library</span>
      </button>

      <button 
        onClick={onBackgroundSettingsClick}
        className="flex flex-col items-center gap-1 text-text-secondary transition-colors"
      >
        <ImageIcon size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Theme</span>
      </button>

      <button 
        onClick={() => onTabChange('liked')}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === 'liked' ? "text-accent" : "text-text-secondary"
        )}
      >
        <Heart size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Liked</span>
      </button>
    </nav>
  );
};
