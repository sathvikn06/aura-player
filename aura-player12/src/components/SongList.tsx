import React, { useEffect, useState } from 'react';
import { Play, Heart, MoreHorizontal, Clock, Download, Music, Plus, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Song } from '../types';
import { getSupabase } from '../lib/supabase';
import { isSongCached } from '../lib/db';
import { formatTime } from '../lib/utils';
import { songService } from '../services/songService';
import { downloadSong } from '../lib/utils/downloadUtils';
import { toast } from 'sonner';
import { EditMetadataModal } from './EditMetadataModal';

export const SongList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  
  const { 
    currentSong, 
    setCurrentSong, 
    setQueue, 
    setIsPlaying, 
    searchQuery,
    likedSongIds,
    toggleLike,
    playlists,
    addToPlaylist,
    removeFromPlaylist,
    activePlaylistId,
    songs,
    setSongs,
    filterArtist,
    setFilterArtist
  } = usePlayerStore();

  const fetchSongs = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    
    setLoading(true);
    const data = await songService.fetchSongs();
    
    if (data && data.length > 0) {
      const songsWithCache = await Promise.all(data.map(async (song) => ({
        ...song,
        isCached: await isSongCached(song.id)
      })));
      setSongs(songsWithCache);
    } else {
      setSongs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    (window as any).refreshSongs = fetchSongs;
  }, []);

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
    setQueue(filteredSongs);
    setIsPlaying(true);
  };

  const handleAddToPlaylist = (playlistId: string, songId: string) => {
    addToPlaylist(playlistId, songId);
    setShowPlaylistMenu(null);
    toast.success('Added to playlist');
  };

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesArtist = !filterArtist || song.artist === filterArtist;
    
    if (!matchesSearch || !matchesArtist) return false;

    if (activePlaylistId === 'liked') {
      return likedSongIds.includes(song.id);
    }

    if (activePlaylistId) {
      const playlist = playlists.find(p => p.id === activePlaylistId);
      return playlist?.songIds.includes(song.id);
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 items-center">
            <div className="w-8 h-4 bg-glass rounded animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-glass rounded-md animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="w-32 h-4 bg-glass rounded animate-pulse" />
                <div className="w-20 h-3 bg-glass rounded animate-pulse" />
              </div>
            </div>
            <div className="w-24 h-4 bg-glass rounded animate-pulse" />
            <div className="w-12 h-4 bg-glass rounded animate-pulse mx-auto" />
            <div className="w-10 h-4 bg-glass rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
        <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center mb-4">
          <Music size={32} />
        </div>
        <p className="text-lg font-medium text-text-primary">
          {activePlaylistId === 'liked' ? 'No liked songs yet' : 
           activePlaylistId ? 'This playlist is empty' : 'No songs found'}
        </p>
        <p className="text-sm">
          {activePlaylistId === 'liked' ? 'Start liking songs to see them here' : 
           activePlaylistId ? 'Add some tracks to get started' : 'Try searching for something else'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4 md:hidden">
        <button 
          onClick={() => handlePlay(filteredSongs[0])}
          className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-full text-sm font-bold shadow-lg shadow-accent/20 active:scale-95 transition-transform"
        >
          <Play size={16} fill="currentColor" />
          <span>Play All</span>
        </button>
        <span className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">
          {filteredSongs.length} Tracks
        </span>
      </div>

      <div className="grid grid-cols-[40px_1fr_80px] md:grid-cols-[40px_1fr_1fr_80px_100px] gap-4 px-4 py-2 text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest border-b border-glass-border mb-2">
        <span className="hidden md:block text-center">#</span>
        <span className="md:hidden text-center">#</span>
        <span>Title</span>
        <span className="hidden md:block">Artist</span>
        <span className="text-center">Time</span>
        <span className="hidden md:block text-right"></span>
      </div>

      {filteredSongs.map((song, index) => (
        <motion.div
          key={song.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          onClick={() => handlePlay(song)}
          className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[40px_1fr_1fr_80px_100px] gap-4 px-4 py-3 md:py-2 rounded-xl items-center cursor-pointer group transition-all ${
            currentSong?.id === song.id ? 'bg-accent/10' : 'hover:bg-glass'
          }`}
        >
          {/* Index / Play Button */}
          <div className="flex items-center justify-center w-8">
            {currentSong?.id === song.id ? (
              <div className="flex items-end gap-0.5 h-3">
                <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-accent" />
                <motion.div animate={{ height: [10, 4, 10] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-accent" />
                <motion.div animate={{ height: [6, 8, 6] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-accent" />
              </div>
            ) : (
              <>
                <span className="text-xs font-medium text-text-secondary/40 md:group-hover:hidden">{index + 1}</span>
                <Play size={12} className="hidden md:group-hover:block text-text-secondary" fill="currentColor" />
                <Play size={12} className="md:hidden text-text-secondary/40" fill="currentColor" />
              </>
            )}
          </div>

          {/* Song Info */}
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <img src={song.image_url} alt={song.title} className="w-10 h-10 md:w-8 md:h-8 rounded-lg object-cover flex-shrink-0 shadow-lg" />
            <div className="flex flex-col min-w-0">
              <span className={`text-sm md:text-sm font-bold md:font-medium truncate ${currentSong?.id === song.id ? 'text-accent' : 'text-text-primary'}`}>
                {song.title}
              </span>
              <div className="flex items-center gap-2">
                <span 
                  onClick={(e) => { e.stopPropagation(); setFilterArtist(song.artist); }}
                  className="md:hidden text-[10px] text-text-secondary truncate hover:text-accent transition-colors"
                >
                  {song.artist}
                </span>
                {song.isCached && (
                  <div className="flex items-center gap-1">
                    <Download size={8} className="text-accent/60" />
                    <span className="text-[9px] text-accent/40 font-bold uppercase tracking-tight">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Artist (Desktop Only) */}
          <span 
            onClick={(e) => { e.stopPropagation(); setFilterArtist(song.artist); }}
            className="hidden md:block text-sm text-text-secondary truncate hover:text-accent transition-colors"
          >
            {song.artist}
          </span>

          {/* Time & More Menu */}
          <div className="flex items-center justify-end gap-4">
            <span className="text-xs font-medium text-text-secondary/40">{formatTime(song.duration)}</span>
            
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(showPlaylistMenu === song.id ? null : song.id); }}
                className="p-2 -mr-2 text-text-secondary/40 hover:text-text-primary transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>
              
              <AnimatePresence>
                {showPlaylistMenu === song.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(null); }} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-48 md:w-56 bg-surface border border-glass-border rounded-2xl py-2 z-50 shadow-2xl overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-glass-border mb-1">
                        <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">Options</p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(song.id); setShowPlaylistMenu(null); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-glass flex items-center gap-3 transition-colors"
                      >
                        <Heart size={16} className={likedSongIds.includes(song.id) ? 'text-accent' : ''} fill={likedSongIds.includes(song.id) ? 'currentColor' : 'none'} />
                        {likedSongIds.includes(song.id) ? 'Remove from Liked' : 'Save to Liked Songs'}
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); downloadSong(song); setShowPlaylistMenu(null); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-glass flex items-center gap-3 transition-colors"
                      >
                        <Download size={16} />
                        Download Track
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingSong(song); setShowPlaylistMenu(null); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-glass flex items-center gap-3 transition-colors"
                      >
                        <Edit2 size={16} />
                        Edit Metadata
                      </button>

                      {activePlaylistId && activePlaylistId !== 'liked' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFromPlaylist(activePlaylistId, song.id); setShowPlaylistMenu(null); toast.success('Removed from playlist'); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-red-400/60 hover:text-red-400 hover:bg-glass flex items-center gap-3 transition-colors"
                        >
                          <X size={16} />
                          Remove from Playlist
                        </button>
                      )}

                      <div className="px-3 py-2 border-t border-glass-border mt-1">
                        <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">Add to Playlist</p>
                      </div>
                      
                      {playlists.length === 0 ? (
                        <p className="px-4 py-2 text-[11px] text-text-secondary/40 italic">No playlists created</p>
                      ) : (
                        <div className="max-h-32 overflow-y-auto custom-scrollbar">
                          {playlists.map(p => (
                            <button
                              key={p.id}
                              onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(p.id, song.id); }}
                              className="w-full text-left px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-glass transition-colors truncate flex items-center gap-3"
                            >
                              <Plus size={14} className="text-text-secondary/20" />
                              {p.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ))}

      <EditMetadataModal 
        song={editingSong}
        isOpen={!!editingSong}
        onClose={() => setEditingSong(null)}
        onSuccess={fetchSongs}
      />
    </div>
  );
};
