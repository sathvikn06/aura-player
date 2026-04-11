import React, { useEffect, useState } from 'react';
import { Play, Heart, MoreHorizontal, Clock, Download, Music, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Song } from '../types';
import { getSupabase } from '../lib/supabase';
import { isSongCached } from '../lib/db';
import { formatTime } from '../lib/utils';
import { songService } from '../services/songService';
import { downloadSong } from '../lib/utils/downloadUtils';
import { toast } from 'sonner';

export const SongList: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
  
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
    activePlaylistId
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
    
    if (!matchesSearch) return false;

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
            <div className="w-8 h-4 bg-white/5 rounded animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-md animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="w-32 h-4 bg-white/5 rounded animate-pulse" />
                <div className="w-20 h-3 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
            <div className="w-12 h-4 bg-white/5 rounded animate-pulse mx-auto" />
            <div className="w-10 h-4 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Music size={32} />
        </div>
        <p className="text-lg font-medium">
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
      <div className="grid grid-cols-[40px_1fr_1fr_80px_100px] gap-4 px-4 py-2 text-[10px] font-bold text-white/20 uppercase tracking-widest border-b border-white/5 mb-2">
        <span className="text-center">#</span>
        <span>Title</span>
        <span>Artist</span>
        <span className="text-center">Time</span>
        <span className="text-right"></span>
      </div>

      {filteredSongs.map((song, index) => (
        <motion.div
          key={song.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          onClick={() => handlePlay(song)}
          className={`grid grid-cols-[40px_1fr_1fr_80px_100px] gap-4 px-4 py-2 rounded-lg items-center cursor-pointer group transition-all ${
            currentSong?.id === song.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-center">
            {currentSong?.id === song.id ? (
              <div className="flex items-end gap-0.5 h-3">
                <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-accent" />
                <motion.div animate={{ height: [10, 4, 10] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-accent" />
                <motion.div animate={{ height: [6, 8, 6] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-accent" />
              </div>
            ) : (
              <span className="text-xs font-medium text-white/20 group-hover:hidden">{index + 1}</span>
            )}
            <Play size={12} className={`hidden group-hover:block ${currentSong?.id === song.id ? 'text-accent' : 'text-white/60'}`} fill="currentColor" />
          </div>

          <div className="flex items-center gap-3 overflow-hidden">
            <img src={song.image_url} alt={song.title} className="w-8 h-8 rounded object-cover flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className={`text-sm font-medium truncate ${currentSong?.id === song.id ? 'text-accent' : 'text-white/90'}`}>
                {song.title}
              </span>
              {song.isCached && (
                <div className="flex items-center gap-1">
                  <Download size={8} className="text-accent/60" />
                  <span className="text-[9px] text-accent/40 font-bold uppercase tracking-tight">Offline</span>
                </div>
              )}
            </div>
          </div>

          <span className="text-sm text-white/40 truncate">{song.artist}</span>

          <span className="text-xs font-medium text-white/20 text-center">{formatTime(song.duration)}</span>

          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {activePlaylistId && activePlaylistId !== 'liked' && (
              <button 
                onClick={(e) => { e.stopPropagation(); removeFromPlaylist(activePlaylistId, song.id); toast.success('Removed from playlist'); }}
                className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                title="Remove from playlist"
              >
                <X size={14} />
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); downloadSong(song); }}
              className="p-1.5 text-white/20 hover:text-white transition-colors"
              title="Download"
            >
              <Download size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
              className={`p-1.5 transition-colors ${likedSongIds.includes(song.id) ? 'text-accent' : 'text-white/20 hover:text-white'}`}
            >
              <Heart size={14} fill={likedSongIds.includes(song.id) ? 'currentColor' : 'none'} />
            </button>
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(showPlaylistMenu === song.id ? null : song.id); }}
                className="p-1.5 text-white/20 hover:text-white transition-colors"
              >
                <Plus size={14} />
              </button>
              
              <AnimatePresence>
                {showPlaylistMenu === song.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 4 }}
                    className="absolute right-0 top-full mt-1 w-44 bg-surface border border-white/5 rounded-lg py-1.5 z-50 shadow-2xl"
                  >
                    <p className="px-3 py-1 text-[9px] font-bold text-white/20 uppercase tracking-widest">Add to Playlist</p>
                    {playlists.length === 0 ? (
                      <p className="px-3 py-2 text-[11px] text-white/40 italic">No playlists</p>
                    ) : (
                      playlists.map(p => (
                        <button
                          key={p.id}
                          onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(p.id, song.id); }}
                          className="w-full text-left px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors truncate"
                        >
                          {p.name}
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
