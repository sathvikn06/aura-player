import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Maximize2, Minimize2, Shuffle, Repeat, Repeat1, Heart, 
  Download, Music, ListMusic, Moon, VolumeX, Volume1,
  Activity, Waves, Sparkles, Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAudio } from '../hooks/useAudio';
import { formatTime, cn } from '../lib/utils';
import { isSongCached } from '../lib/db';
import { downloadSong } from '../lib/utils/downloadUtils';
import { Visualizer } from './Visualizer';
import { QueuePanel } from './QueuePanel';
import { SleepTimerModal } from './SleepTimerModal';
import { BackgroundSlideshow } from './BackgroundSlideshow';

export const Player: React.FC = () => {
  const { 
    currentSong, isPlaying, setIsPlaying, 
    progress, duration, volume, setVolume,
    nextSong, prevSong, isFullscreen, toggleFullscreen,
    isShuffle, toggleShuffle, repeatMode, setRepeatMode,
    visualMode, setVisualMode, isLoading, likedSongIds, toggleLike,
    sleepTimer, toggleMute, visualizerMode, setVisualizerMode, setFilterArtist
  } = usePlayerStore();
  
  const { seek } = useAudio();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    if (currentSong) {
      isSongCached(currentSong.id).then(setIsDownloaded);
    }
  }, [currentSong]);

  if (!currentSong) return null;

  return (
    <>
      {/* Mini Player */}
      <AnimatePresence mode="wait">
        {!isFullscreen && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-16 md:bottom-0 left-0 right-0 h-20 bg-surface/80 backdrop-blur-xl border-t border-glass-border px-4 md:px-6 flex items-center justify-between z-40"
            >
              {/* Tiny Progress Bar for Mobile */}
              <div className="md:hidden absolute top-0 left-0 right-0 h-[2px] bg-glass overflow-hidden">
                <motion.div 
                  className="h-full bg-accent"
                  animate={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                  transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                />
              </div>

              <div className="flex items-center gap-3 md:gap-4 w-full md:w-1/3 min-w-0">
                <div className="relative group overflow-hidden rounded-md flex-shrink-0">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={currentSong.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={currentSong.image_url} 
                      alt={currentSong.title} 
                      className="w-12 h-12 md:w-12 md:h-12 object-cover rounded-lg shadow-lg"
                    />
                  </AnimatePresence>
                  <button 
                    onClick={toggleFullscreen}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Maximize2 size={14} className="text-white" />
                  </button>
                </div>
                <div className="flex flex-col overflow-hidden flex-1 min-w-0" onClick={toggleFullscreen}>
                  <h4 className="font-bold text-sm truncate text-text-primary">
                    {currentSong.title}
                  </h4>
                  <p 
                    onClick={(e) => { e.stopPropagation(); setFilterArtist(currentSong.artist); }}
                    className="text-[10px] text-text-secondary truncate hover:text-accent cursor-pointer transition-colors"
                  >
                    {currentSong.artist}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLike(currentSong.id); }}
                  className={cn(
                    "ml-2 transition-colors",
                    likedSongIds.includes(currentSong.id) ? "text-accent" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <Heart size={20} fill={likedSongIds.includes(currentSong.id) ? "currentColor" : "none"} />
                </button>
                
                {/* Mobile Controls */}
                <div className="md:hidden flex items-center gap-1">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform ml-2"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                      />
                    ) : (
                      isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>
                  <button 
                    onClick={nextSong}
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <SkipForward size={20} fill="currentColor" />
                  </button>
                </div>
              </div>

            <div className="hidden md:flex flex-col items-center gap-1.5 w-1/3">
              <div className="flex items-center gap-5">
                <button 
                  onClick={toggleShuffle}
                  className={cn("transition-colors", isShuffle ? "text-accent" : "text-text-secondary hover:text-text-primary")}
                >
                  <Shuffle size={16} />
                </button>
                <button onClick={prevSong} className="text-text-secondary hover:text-text-primary transition-colors">
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-text-primary text-background flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full"
                    />
                  ) : (
                    isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <button onClick={nextSong} className="text-text-secondary hover:text-text-primary transition-colors">
                  <SkipForward size={20} fill="currentColor" />
                </button>
                <button 
                  onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                  className={cn("transition-colors relative", repeatMode !== 'none' ? "text-accent" : "text-text-secondary hover:text-text-primary")}
                >
                  {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
                  {repeatMode === 'all' && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                  )}
                </button>
              </div>
              <div className="w-full max-w-md flex items-center gap-2">
                <span className="text-[9px] font-bold text-text-secondary/40 w-8 text-right">{formatTime(progress)}</span>
                <div className="flex-1 h-1 bg-glass border border-glass-border rounded-full relative group cursor-pointer">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-text-secondary/40 group-hover:bg-accent transition-colors" 
                    animate={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                    transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                  />
                  <input 
                    type="range" 
                    min={0} 
                    max={duration || 0} 
                    value={progress} 
                    onChange={(e) => seek(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-[9px] font-bold text-text-secondary/40 w-8">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 w-1/3">
              <button 
                onClick={() => setIsQueueOpen(true)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <ListMusic size={18} />
              </button>
              <div className="hidden md:flex items-center gap-2 group">
                <button 
                  onClick={toggleMute}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {volume === 0 ? (
                    <VolumeX size={16} className="text-accent" />
                  ) : volume > 1.0 ? (
                    <Volume2 size={16} className="text-accent" />
                  ) : volume < 0.5 ? (
                    <Volume1 size={16} />
                  ) : (
                    <Volume2 size={16} />
                  )}
                </button>
                <div className="w-20 h-1 bg-glass border border-glass-border rounded-full relative">
                  <div 
                    className={cn(
                      "absolute top-0 left-0 h-full transition-colors",
                      volume > 1.0 ? "bg-accent" : "bg-text-secondary/40 group-hover:bg-accent"
                    )}
                    style={{ width: `${(volume / 2.0) * 100}%` }}
                  />
                  <input 
                    type="range" 
                    min={0} 
                    max={2} 
                    step={0.01} 
                    value={volume} 
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {volume > 1.0 && (
                  <span className="text-[8px] font-bold text-accent uppercase animate-pulse">Boost</span>
                )}
              </div>
              <button onClick={toggleFullscreen} className="text-text-secondary hover:text-text-primary transition-colors">
                <Maximize2 size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Cinematic Player */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col"
          >
            {/* Background Layer */}
            <div className="absolute inset-0 pointer-events-none">
              <BackgroundSlideshow />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-4 md:p-8 flex items-center justify-between">
              <button 
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-glass transition-colors"
              >
                <Minimize2 size={24} className="text-text-secondary hover:text-text-primary" />
              </button>
              <div className="flex items-center gap-1 md:gap-2 bg-glass p-1 rounded-full border border-glass-border">
                <button 
                  onClick={() => setVisualMode('artwork')}
                  className={cn(
                    "px-4 md:px-6 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all",
                    visualMode === 'artwork' ? "bg-text-primary text-background" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  Artwork
                </button>
                <button 
                  onClick={() => setVisualMode('cinema')}
                  className={cn(
                    "px-4 md:px-6 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all",
                    visualMode === 'cinema' ? "bg-text-primary text-background" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  Cinema
                </button>
              </div>
              <button 
                onClick={() => setIsQueueOpen(true)}
                className="p-2 rounded-full hover:bg-glass transition-colors"
              >
                <ListMusic size={24} className="text-text-secondary hover:text-text-primary" />
              </button>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-10">
              <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20 max-w-5xl w-full">
                {/* Artwork Section */}
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={currentSong.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.6 }}
                      src={currentSong.image_url} 
                      alt={currentSong.title} 
                      className={cn(
                        "w-64 h-64 md:w-72 md:h-72 lg:w-[400px] lg:h-[400px] rounded-2xl object-cover shadow-2xl border border-white/10 transition-all duration-700",
                        visualMode === 'cinema' ? "opacity-10 scale-90 blur-md" : "opacity-100"
                      )}
                    />
                  </AnimatePresence>
                </div>

                {/* Info Section */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
                  <div className="mb-8 lg:mb-12">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 md:mb-3 text-text-primary">
                      {currentSong.title}
                    </h2>
                    <p 
                      onClick={() => { setFilterArtist(currentSong.artist); toggleFullscreen(); }}
                      className="text-lg md:text-xl lg:text-2xl text-text-secondary font-medium hover:text-accent cursor-pointer transition-colors"
                    >
                      {currentSong.artist}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="w-full max-w-xl space-y-8 lg:space-y-10">
                    <div className="space-y-3">
                      <div className="w-full h-1.5 bg-glass border border-glass-border rounded-full relative group cursor-pointer">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-text-primary group-hover:bg-accent transition-colors" 
                          animate={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                          transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                        />
                        <input 
                          type="range" 
                          min={0} 
                          max={duration || 0} 
                          value={progress} 
                          onChange={(e) => seek(Number(e.target.value))}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center lg:justify-start gap-6 md:gap-12">
                      <button 
                        onClick={toggleShuffle}
                        className={cn("transition-all", isShuffle ? "text-accent" : "text-text-secondary hover:text-text-primary")}
                      >
                        <Shuffle size={24} />
                      </button>
                      <button onClick={prevSong} className="text-text-secondary hover:text-text-primary transition-all">
                        <SkipBack size={40} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 md:w-8 md:h-8 border-4 border-white/20 border-t-white rounded-full"
                          />
                        ) : (
                          isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1.5" />
                        )}
                      </button>
                      <button onClick={nextSong} className="text-text-secondary hover:text-text-primary transition-all">
                        <SkipForward size={40} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                        className={cn("transition-all relative", repeatMode !== 'none' ? "text-accent" : "text-text-secondary hover:text-text-primary")}
                      >
                        {repeatMode === 'one' ? <Repeat1 size={24} /> : <Repeat size={24} />}
                        {repeatMode === 'all' && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualizer & Lyrics Section */}
              <div className="absolute bottom-24 left-0 right-0 h-32 md:h-48 flex flex-col items-center justify-center pointer-events-auto group">
                <AnimatePresence mode="wait">
                  {showLyrics ? (
                    <motion.div
                      key="lyrics"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="w-full max-w-2xl text-center px-8 overflow-y-auto custom-scrollbar"
                    >
                      <p className="text-lg md:text-2xl font-bold text-text-primary/80 leading-relaxed">
                        {currentSong.lyrics || "Lyrics not available for this track."}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="visualizer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full opacity-20"
                    >
                      <Visualizer className="w-full h-full" color="#ffffff" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mode Selectors */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                  <button 
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={cn(
                      "p-1.5 rounded-full transition-all",
                      showLyrics ? "text-accent" : "text-white/40 hover:text-white"
                    )}
                    title="Toggle Lyrics"
                  >
                    <Languages size={16} />
                  </button>
                  <div className="h-3 w-[1px] bg-white/10" />
                  <button 
                    onClick={() => { setVisualizerMode('bars'); setShowLyrics(false); }}
                    className={cn(
                      "p-1.5 rounded-full transition-all",
                      visualizerMode === 'bars' && !showLyrics ? "text-accent" : "text-white/40 hover:text-white"
                    )}
                    title="Bars Mode"
                  >
                    <Activity size={16} />
                  </button>
                  <button 
                    onClick={() => { setVisualizerMode('waves'); setShowLyrics(false); }}
                    className={cn(
                      "p-1.5 rounded-full transition-all",
                      visualizerMode === 'waves' && !showLyrics ? "text-accent" : "text-white/40 hover:text-white"
                    )}
                    title="Waves Mode"
                  >
                    <Waves size={16} />
                  </button>
                  <button 
                    onClick={() => { setVisualizerMode('particles'); setShowLyrics(false); }}
                    className={cn(
                      "p-1.5 rounded-full transition-all",
                      visualizerMode === 'particles' && !showLyrics ? "text-accent" : "text-white/40 hover:text-white"
                    )}
                    title="Particles Mode"
                  >
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 p-6 md:p-10 flex items-center justify-between">
              <div className="flex items-center gap-4 md:gap-8">
                <button 
                  onClick={() => currentSong && toggleLike(currentSong.id)}
                  className={cn(
                    "flex items-center gap-2 text-[10px] md:text-xs font-bold transition-colors uppercase tracking-widest",
                    currentSong && likedSongIds.includes(currentSong.id) ? "text-accent" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <Heart size={20} fill={currentSong && likedSongIds.includes(currentSong.id) ? "currentColor" : "none"} />
                  <span className="hidden sm:inline">{currentSong && likedSongIds.includes(currentSong.id) ? 'Saved' : 'Save'}</span>
                </button>
                <button 
                  onClick={() => setIsSleepTimerOpen(true)}
                  className={cn(
                    "flex items-center gap-2 text-[10px] md:text-xs font-bold transition-colors uppercase tracking-widest",
                    sleepTimer !== null ? "text-accent" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <Moon size={20} fill={sleepTimer !== null ? "currentColor" : "none"} />
                  <span className="hidden sm:inline">{sleepTimer !== null ? `${sleepTimer}m` : 'Sleep'}</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadSong(currentSong); }}
                  className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-text-secondary hover:text-text-primary transition-colors uppercase tracking-widest"
                >
                  <Download size={20} />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleMute}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {volume === 0 ? (
                    <VolumeX size={20} className="text-accent" />
                  ) : volume > 1.0 ? (
                    <Volume2 size={20} className="text-accent" />
                  ) : (
                    <Volume2 size={20} />
                  )}
                </button>
                <div className="w-24 md:w-32 h-1 bg-glass border border-glass-border rounded-full relative">
                  <div 
                    className={cn(
                      "absolute top-0 left-0 h-full",
                      volume > 1.0 ? "bg-accent" : "bg-text-secondary/40"
                    )}
                    style={{ width: `${(volume / 2.0) * 100}%` }}
                  />
                  <input 
                    type="range" 
                    min={0} 
                    max={2} 
                    step={0.01} 
                    value={volume} 
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {volume > 1.0 && (
                  <span className="text-[8px] font-bold text-accent uppercase animate-pulse">Boost</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
 
      <QueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
      <SleepTimerModal isOpen={isSleepTimerOpen} onClose={() => setIsSleepTimerOpen(false)} />
    </>
  );
};
