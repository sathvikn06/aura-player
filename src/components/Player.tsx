import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Maximize2, Minimize2, Shuffle, Repeat, Repeat1, Heart, 
  Download, Music, Monitor, ListMusic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAudio } from '../hooks/useAudio';
import { formatTime, cn } from '../lib/utils';
import { isSongCached } from '../lib/db';
import { downloadSong } from '../lib/utils/downloadUtils';
import { Visualizer } from './Visualizer';
import { QueuePanel } from './QueuePanel';

export const Player: React.FC = () => {
  const { 
    currentSong, isPlaying, setIsPlaying, 
    progress, duration, volume, setVolume,
    nextSong, prevSong, isFullscreen, toggleFullscreen,
    isShuffle, toggleShuffle, repeatMode, setRepeatMode,
    visualMode, setVisualMode, isLoading
  } = usePlayerStore();
  
  const { seek } = useAudio();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

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
            className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t border-white/5 px-6 flex items-center justify-between z-40"
          >
            <div className="flex items-center gap-4 w-1/3">
              <div className="relative group overflow-hidden rounded-md">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentSong.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={currentSong.image_url} 
                    alt={currentSong.title} 
                    className="w-12 h-12 object-cover"
                  />
                </AnimatePresence>
                <button 
                  onClick={toggleFullscreen}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
              <div className="flex flex-col overflow-hidden">
                <h4 className="font-semibold text-sm truncate max-w-[180px]">
                  {currentSong.title}
                </h4>
                <p className="text-xs text-white/40 truncate max-w-[180px]">
                  {currentSong.artist}
                </p>
              </div>
              <button className="ml-2 text-white/20 hover:text-white transition-colors">
                <Heart size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-1.5 w-1/3">
              <div className="flex items-center gap-5">
                <button 
                  onClick={toggleShuffle}
                  className={cn("transition-colors", isShuffle ? "text-accent" : "text-white/20 hover:text-white")}
                >
                  <Shuffle size={16} />
                </button>
                <button onClick={prevSong} className="text-white/60 hover:text-white transition-colors">
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full"
                    />
                  ) : (
                    isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />
                  )}
                </button>
                <button onClick={nextSong} className="text-white/60 hover:text-white transition-colors">
                  <SkipForward size={20} fill="currentColor" />
                </button>
                <button 
                  onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                  className={cn("transition-colors relative", repeatMode !== 'none' ? "text-accent" : "text-white/20 hover:text-white")}
                >
                  {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
                  {repeatMode === 'all' && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                  )}
                </button>
              </div>
              <div className="w-full max-w-md flex items-center gap-2">
                <span className="text-[9px] font-bold text-white/20 w-8 text-right">{formatTime(progress)}</span>
                <div className="flex-1 h-1 bg-white/5 rounded-full relative group cursor-pointer">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-white/60 group-hover:bg-accent transition-colors" 
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
                <span className="text-[9px] font-bold text-white/20 w-8">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 w-1/3">
              <button 
                onClick={() => setIsQueueOpen(true)}
                className="text-white/20 hover:text-white transition-colors"
              >
                <ListMusic size={18} />
              </button>
              <div className="flex items-center gap-2 group">
                <Volume2 size={16} className="text-white/20 group-hover:text-white transition-colors" />
                <div className="w-20 h-1 bg-white/5 rounded-full relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-white/40 group-hover:bg-accent transition-colors" 
                    style={{ width: `${volume * 100}%` }}
                  />
                  <input 
                    type="range" 
                    min={0} 
                    max={1} 
                    step={0.01} 
                    value={volume} 
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <button onClick={toggleFullscreen} className="text-white/20 hover:text-white transition-colors">
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
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentSong.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  src={currentSong.image_url} 
                  alt="" 
                  className="w-full h-full object-cover blur-[100px] scale-110"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-8 flex items-center justify-between">
              <button 
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <Minimize2 size={24} className="text-white/60 hover:text-white" />
              </button>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/5">
                <button 
                  onClick={() => setVisualMode('artwork')}
                  className={cn(
                    "px-6 py-1.5 rounded-full text-xs font-bold transition-all",
                    visualMode === 'artwork' ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  Artwork
                </button>
                <button 
                  onClick={() => setVisualMode('cinema')}
                  className={cn(
                    "px-6 py-1.5 rounded-full text-xs font-bold transition-all",
                    visualMode === 'cinema' ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  Cinema
                </button>
              </div>
              <button 
                onClick={() => setIsQueueOpen(true)}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <ListMusic size={24} className="text-white/60 hover:text-white" />
              </button>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10">
              <div className="flex flex-col lg:flex-row items-center gap-20 max-w-5xl w-full">
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
                        "w-72 h-72 lg:w-[400px] lg:h-[400px] rounded-2xl object-cover shadow-2xl border border-white/10 transition-all duration-700",
                        visualMode === 'cinema' ? "opacity-10 scale-90 blur-md" : "opacity-100"
                      )}
                    />
                  </AnimatePresence>
                </div>

                {/* Info Section */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="mb-12">
                    <h2 className="text-5xl lg:text-6xl font-bold tracking-tight mb-3">
                      {currentSong.title}
                    </h2>
                    <p className="text-xl lg:text-2xl text-white/40 font-medium">
                      {currentSong.artist}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="w-full max-w-xl space-y-10">
                    <div className="space-y-3">
                      <div className="w-full h-1.5 bg-white/5 rounded-full relative group cursor-pointer">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-white group-hover:bg-accent transition-colors" 
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
                      <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center lg:justify-start gap-12">
                      <button 
                        onClick={toggleShuffle}
                        className={cn("transition-all", isShuffle ? "text-accent" : "text-white/20 hover:text-white")}
                      >
                        <Shuffle size={24} />
                      </button>
                      <button onClick={prevSong} className="text-white/60 hover:text-white transition-all">
                        <SkipBack size={40} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full"
                          />
                        ) : (
                          isPlaying ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1.5" />
                        )}
                      </button>
                      <button onClick={nextSong} className="text-white/60 hover:text-white transition-all">
                        <SkipForward size={40} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                        className={cn("transition-all relative", repeatMode !== 'none' ? "text-accent" : "text-white/20 hover:text-white")}
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

              {/* Visualizer */}
              <div className="absolute bottom-24 left-0 right-0 h-24 pointer-events-none">
                <Visualizer className="w-full h-full opacity-10" color="#ffffff" />
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 p-10 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <button className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">
                  <Heart size={18} />
                  Save
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadSong(currentSong); }}
                  className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
              <div className="flex items-center gap-4">
                <Volume2 size={18} className="text-white/40" />
                <div className="w-32 h-1 bg-white/5 rounded-full relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-white/40" 
                    style={{ width: `${volume * 100}%` }}
                  />
                  <input 
                    type="range" 
                    min={0} 
                    max={1} 
                    step={0.01} 
                    value={volume} 
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
};
