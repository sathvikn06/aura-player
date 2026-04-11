import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { SongList } from './components/SongList';
import { UploadModal } from './components/UploadModal';
import { motion } from 'motion/react';
import { usePlayerStore } from './store/usePlayerStore';
import { useAuth } from './hooks/useAuth';
import { useAudio } from './hooks/useAudio';
import { Music, Play, Disc, Upload, Search as SearchIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { InstallPrompt } from './components/InstallPrompt';

export default function App() {
  const { currentSong, setSearchQuery, activePlaylistId, playlists } = usePlayerStore();
  const { loading, user } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLDivElement>(null);
  useAudio(); // Initialize audio listener

  const getHeading = () => {
    if (activePlaylistId === 'liked') return 'Liked Songs';
    if (activePlaylistId) {
      const playlist = playlists.find(p => p.id === activePlaylistId);
      return playlist?.name || 'Playlist';
    }
    return 'Your Library';
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, setSearchQuery]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-white/20"
        >
          <Disc size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-background text-white overflow-hidden font-sans">
      <Sidebar 
        onUploadClick={() => setIsUploadOpen(true)} 
        onSearchClick={() => searchInputRef.current?.focus()}
        onLibraryClick={() => libraryRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white">
                <motion.div whileHover={{ x: -1 }}>←</motion.div>
              </button>
              <button className="p-1.5 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white">
                <motion.div whileHover={{ x: 1 }}>→</motion.div>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={16} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-white/5 border border-transparent rounded-full py-2 pl-10 pr-4 focus:bg-white/10 outline-none transition-all text-sm placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-white/80 font-medium text-sm hover:bg-white/10 transition-all"
              >
                <Upload size={16} />
                Upload
              </button>
            )}
            <button className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-sm hover:opacity-90 transition-opacity">
              Upgrade
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-32 custom-scrollbar">
          {/* Hero Section */}
          <section className="mb-10 relative">
            <div className="relative h-64 rounded-2xl overflow-hidden bg-surface flex items-center p-10 border border-white/5">
              <div className="flex-1 z-10">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Featured</span>
                <h2 className="text-5xl font-bold tracking-tight mb-6">Cyberpunk <br /> Atmosphere</h2>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-accent text-black rounded-full font-bold hover:scale-[1.02] transition-transform">
                    <Play size={18} fill="black" />
                    Play
                  </button>
                  <button className="px-6 py-2.5 bg-white/5 rounded-full font-bold hover:bg-white/10 transition-colors border border-white/5">
                    Save
                  </button>
                </div>
              </div>
              <div className="hidden lg:block relative">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img 
                    src="https://picsum.photos/seed/cyber/600/600" 
                    alt="Featured" 
                    className="w-48 h-48 rounded-xl object-cover shadow-2xl border border-white/10"
                  />
                </motion.div>
              </div>
            </div>
          </section>

          {/* Song List Section */}
          <section ref={libraryRef}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight">
                {getHeading()}
              </h3>
              <button className="text-xs font-semibold text-white/40 hover:text-white transition-colors">
                Show all
              </button>
            </div>
            <SongList />
          </section>
        </div>

        <Player />
        
        <UploadModal 
          isOpen={isUploadOpen} 
          onClose={() => setIsUploadOpen(false)} 
          onSuccess={() => (window as any).refreshSongs?.()}
        />

        <Toaster position="top-right" theme="dark" richColors />
        <InstallPrompt />
      </main>
    </div>
  );
}
