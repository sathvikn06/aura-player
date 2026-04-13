import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { SongList } from './components/SongList';
import { UploadModal } from './components/UploadModal';
import { Equalizer } from './components/Equalizer';
import { motion } from 'motion/react';
import { usePlayerStore } from './store/usePlayerStore';
import { useAuth } from './hooks/useAuth';
import { useAudio } from './hooks/useAudio';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Music, Play, Disc, Upload, Search as SearchIcon, Home, Heart, Plus, Sliders, X, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { InstallPrompt } from './components/InstallPrompt';
import { cn } from './lib/utils';
import { BackgroundSlideshow } from './components/BackgroundSlideshow';
import { BackgroundSettings } from './components/BackgroundSettings';

import { MobileNav } from './components/MobileNav';

export default function App() {
  const { 
    currentSong, 
    setSearchQuery, 
    activePlaylistId, 
    playlists, 
    setActivePlaylist,
    songs,
    setCurrentSong,
    setQueue,
    setIsPlaying,
    likedSongIds,
    toggleLike,
    createPlaylist,
    recentlyPlayed,
    filterArtist,
    setFilterArtist,
    searchQuery
  } = usePlayerStore();
  const { loading, user } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [mobileTab, setMobileTab] = useState<'home' | 'search' | 'library' | 'liked'>('home');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLDivElement>(null);
  useAudio(); // Initialize audio listener
  useKeyboardShortcuts(); // Initialize keyboard shortcuts

  const featuredSong = songs.length > 0 ? songs[0] : null;

  const handlePlayFeatured = () => {
    if (featuredSong) {
      setCurrentSong(featuredSong);
      setQueue(songs);
      setIsPlaying(true);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreatingPlaylist(false);
    }
  };

  const isFeaturedLiked = featuredSong ? likedSongIds.includes(featuredSong.id) : false;

  const getHeading = () => {
    if (activePlaylistId === 'liked' || mobileTab === 'liked') return 'Liked Songs';
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

  const filteredSongs = songs.filter(song => 
    (song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!filterArtist || song.artist === filterArtist)
  );

  const recentlyAdded = [...songs].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 6);
  const topPlayed = [...songs].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 6);

  const displaySongs = mobileTab === 'liked' 
    ? filteredSongs.filter(s => likedSongIds.includes(s.id))
    : filteredSongs;

  if (loading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-accent/20"
        >
          <Disc size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex text-text-primary overflow-hidden font-sans relative">
      <BackgroundSlideshow />
      <div className="hidden md:block">
        <Sidebar 
          onUploadClick={() => setIsUploadOpen(true)} 
          onSearchClick={() => searchInputRef.current?.focus()}
          onLibraryClick={() => libraryRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 px-4 md:px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 md:gap-6 flex-1">
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => window.history.back()}
                className="p-1.5 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white"
              >
                <motion.div whileHover={{ x: -1 }}>←</motion.div>
              </button>
              <button 
                onClick={() => window.history.forward()}
                className="p-1.5 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white"
              >
                <motion.div whileHover={{ x: 1 }}>→</motion.div>
              </button>
            </div>

            {/* Search Input */}
            <div className={cn(
              "relative w-full max-w-md group transition-all",
              mobileTab === 'search' ? "md:max-w-md" : "max-w-[160px] md:max-w-md"
            )}>
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={16} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setMobileTab('search')}
                className="w-full bg-white/5 border border-transparent rounded-full py-2 pl-10 pr-4 focus:bg-white/10 outline-none transition-all text-sm placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setIsBackgroundSettingsOpen(true)}
              className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              title="Background Settings"
            >
              <ImageIcon size={18} />
            </button>
            <button 
              onClick={() => setIsEqualizerOpen(true)}
              className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              title="Equalizer"
            >
              <Sliders size={18} />
            </button>

            {isCreatingPlaylist ? (
              <form onSubmit={handleCreatePlaylist} className="relative">
                <input
                  autoFocus
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onBlur={() => !newPlaylistName && setIsCreatingPlaylist(false)}
                  placeholder="Playlist name..."
                  className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm outline-none focus:border-accent transition-colors w-32 md:w-40"
                />
              </form>
            ) : (
              <button 
                onClick={() => setIsCreatingPlaylist(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-white/5 text-white/80 font-medium text-sm hover:bg-white/10 transition-all"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New Playlist</span>
              </button>
            )}

            {user && (
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-accent text-black font-bold text-sm hover:scale-[1.02] transition-transform"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Upload</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-40 md:pb-32 custom-scrollbar">
          {/* Artist Filter Badge */}
          {filterArtist && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">Filtering by Artist:</span>
              <button 
                onClick={() => setFilterArtist(null)}
                className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold border border-accent/20 hover:bg-accent/20 transition-colors"
              >
                {filterArtist}
                <X size={14} />
              </button>
            </div>
          )}

          {/* Hero Section - Only on Home */}
          {mobileTab === 'home' && !activePlaylistId && (
            <section className="mb-10 relative">
              {featuredSong ? (
                <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-surface/40 backdrop-blur-md flex items-center p-6 md:p-10 border border-white/5">
                  <div className="flex-1 z-10">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Featured Track</span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 md:mb-6 truncate max-w-md">
                      {featuredSong.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handlePlayFeatured}
                        className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-accent text-black rounded-full font-bold hover:scale-[1.02] transition-transform text-sm md:text-base"
                      >
                        <Play size={16} md:size={18} fill="black" />
                        Play Now
                      </button>
                      <button 
                        onClick={() => featuredSong && toggleLike(featuredSong.id)}
                        className={cn(
                          "px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold transition-colors border border-white/5 text-sm md:text-base flex items-center gap-2",
                          isFeaturedLiked ? "bg-accent/10 text-accent border-accent/20" : "bg-white/5 text-white hover:bg-white/10"
                        )}
                      >
                        <Heart size={16} fill={isFeaturedLiked ? "currentColor" : "none"} />
                        {isFeaturedLiked ? 'Liked' : 'Like'}
                      </button>
                    </div>
                  </div>
                  <div className="hidden lg:block relative">
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <img 
                        src={featuredSong.image_url} 
                        alt={featuredSong.title} 
                        className="w-48 h-48 rounded-xl object-cover shadow-2xl border border-white/10"
                      />
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-surface/40 backdrop-blur-md flex flex-col items-center justify-center p-6 md:p-10 border border-white/5 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Music size={32} className="text-white/20" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Welcome to Aura Player</h2>
                  <p className="text-white/40 text-sm max-w-md mb-6">
                    Your music library is currently empty. Start by uploading your favorite tracks to build your personal collection.
                  </p>
                  {user && (
                    <button 
                      onClick={() => setIsUploadOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold hover:scale-[1.02] transition-transform"
                    >
                      <Upload size={18} />
                      Upload First Song
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Recently Played - Only on Home */}
          {mobileTab === 'home' && recentlyPlayed.length > 0 && !activePlaylistId && !filterArtist && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold tracking-tight">Recently Played</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recentlyPlayed.slice(0, 6).map((song) => (
                  <motion.div
                    key={`recent-${song.id}`}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      setCurrentSong(song);
                      setQueue(recentlyPlayed);
                      setIsPlaying(true);
                    }}
                    className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-square mb-3 overflow-hidden rounded-xl">
                      <img 
                        src={song.image_url} 
                        alt={song.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <Play size={20} fill="black" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm truncate mb-1">{song.title}</h4>
                    <p className="text-xs text-white/40 truncate">{song.artist}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Top Played - Only on Home */}
          {mobileTab === 'home' && topPlayed.length > 0 && !activePlaylistId && !filterArtist && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold tracking-tight">Top Played</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {topPlayed.map((song) => (
                  <motion.div
                    key={`top-${song.id}`}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      setCurrentSong(song);
                      setQueue(topPlayed);
                      setIsPlaying(true);
                    }}
                    className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-square mb-3 overflow-hidden rounded-xl">
                      <img src={song.image_url} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black shadow-xl">
                          <Play size={20} fill="black" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm truncate mb-1">{song.title}</h4>
                    <p className="text-xs text-white/40 truncate">{song.artist}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Recently Added - Only on Home */}
          {mobileTab === 'home' && recentlyAdded.length > 0 && !activePlaylistId && !filterArtist && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold tracking-tight">Recently Added</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recentlyAdded.map((song) => (
                  <motion.div
                    key={`added-${song.id}`}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      setCurrentSong(song);
                      setQueue(recentlyAdded);
                      setIsPlaying(true);
                    }}
                    className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-square mb-3 overflow-hidden rounded-xl">
                      <img src={song.image_url} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black shadow-xl">
                          <Play size={20} fill="black" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm truncate mb-1">{song.title}</h4>
                    <p className="text-xs text-white/40 truncate">{song.artist}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Song List Section */}
          <section ref={libraryRef}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight">
                {getHeading()}
              </h3>
            </div>
            <SongList />
          </section>
        </div>

        <Player />

        <MobileNav 
          activeTab={mobileTab}
          onTabChange={(tab) => {
            setMobileTab(tab);
            if (tab === 'liked') setActivePlaylist('liked');
            else if (tab === 'home' || tab === 'library') setActivePlaylist(null);
            
            if (tab === 'search') searchInputRef.current?.focus();
            else libraryRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          onUploadClick={() => setIsUploadOpen(true)}
          onBackgroundSettingsClick={() => setIsBackgroundSettingsOpen(true)}
        />
        
        <UploadModal 
          isOpen={isUploadOpen} 
          onClose={() => setIsUploadOpen(false)} 
          onSuccess={() => (window as any).refreshSongs?.()}
        />

        <Equalizer 
          isOpen={isEqualizerOpen} 
          onClose={() => setIsEqualizerOpen(false)} 
        />

        <BackgroundSettings 
          isOpen={isBackgroundSettingsOpen}
          onClose={() => setIsBackgroundSettingsOpen(false)}
        />

        <Toaster position="top-right" theme="dark" richColors />
        <InstallPrompt />
      </main>
    </div>
  );
}
