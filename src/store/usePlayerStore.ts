import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Song, UserProfile, Playlist } from '../types';

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isFullscreen: boolean;
  visualMode: 'artwork' | 'cinema';
  isLoading: boolean;
  user: UserProfile | null;
  searchQuery: string;
  playlists: Playlist[];
  likedSongIds: string[];
  activePlaylistId: string | null;
  
  // Actions
  setCurrentSong: (song: Song | null) => void;
  setQueue: (songs: Song[]) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  removeFromQueue: (songId: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  toggleFullscreen: () => void;
  setVisualMode: (mode: 'artwork' | 'cinema') => void;
  setIsLoading: (isLoading: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  setSearchQuery: (query: string) => void;
  
  // Playlist Actions
  createPlaylist: (name: string) => void;
  toggleLike: (songId: string) => void;
  addToPlaylist: (playlistId: string, songId: string) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  renamePlaylist: (playlistId: string, name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  setActivePlaylist: (id: string | null) => void;
  
  // Playback controls
  nextSong: () => void;
  prevSong: () => void;
  playFromQueue: (index: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      volume: 0.7,
      progress: 0,
      duration: 0,
      isShuffle: false,
      repeatMode: 'none',
      isFullscreen: false,
      visualMode: 'artwork',
      isLoading: false,
      user: null,
      searchQuery: '',
      playlists: [],
      likedSongIds: [],
      activePlaylistId: null,

      setCurrentSong: (song) => {
        const { queue } = get();
        const index = song ? queue.findIndex(s => s.id === song.id) : -1;
        set({ currentSong: song, currentIndex: index, progress: 0 });
      },
      setQueue: (songs) => {
        const { currentSong } = get();
        const index = currentSong ? songs.findIndex(s => s.id === currentSong.id) : -1;
        set({ queue: songs, currentIndex: index });
      },
      reorderQueue: (startIndex, endIndex) => {
        const { queue, currentIndex } = get();
        const result = Array.from(queue);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        
        // Update currentIndex if the moving item is the current song or affects its position
        let newIndex = currentIndex;
        if (currentIndex === startIndex) {
          newIndex = endIndex;
        } else if (startIndex < currentIndex && endIndex >= currentIndex) {
          newIndex--;
        } else if (startIndex > currentIndex && endIndex <= currentIndex) {
          newIndex++;
        }
        
        set({ queue: result, currentIndex: newIndex });
      },
      removeFromQueue: (songId) => {
        const { queue, currentIndex, currentSong } = get();
        const newQueue = queue.filter(s => s.id !== songId);
        let newIndex = currentIndex;
        let newCurrentSong = currentSong;

        if (currentSong?.id === songId) {
          // If we removed the current song, play the next one or stop
          if (newQueue.length > 0) {
            newIndex = currentIndex % newQueue.length;
            newCurrentSong = newQueue[newIndex];
          } else {
            newIndex = -1;
            newCurrentSong = null;
          }
        } else {
          newIndex = newCurrentSong ? newQueue.findIndex(s => s.id === newCurrentSong.id) : -1;
        }

        set({ queue: newQueue, currentIndex: newIndex, currentSong: newCurrentSong });
      },
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setVolume: (volume) => set({ volume }),
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      setRepeatMode: (mode) => set({ repeatMode: mode }),
      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
      setVisualMode: (mode) => set({ visualMode: mode }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setUser: (user) => set({ user }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      createPlaylist: (name) => set((state) => ({
        playlists: [...state.playlists, { id: crypto.randomUUID(), name, songIds: [] }]
      })),

      toggleLike: (songId) => set((state) => ({
        likedSongIds: state.likedSongIds.includes(songId)
          ? state.likedSongIds.filter(id => id !== songId)
          : [...state.likedSongIds, songId]
      })),

      addToPlaylist: (playlistId, songId) => set((state) => ({
        playlists: state.playlists.map(p => 
          p.id === playlistId 
            ? { ...p, songIds: p.songIds.includes(songId) ? p.songIds : [...p.songIds, songId] }
            : p
        )
      })),

      removeFromPlaylist: (playlistId, songId) => set((state) => ({
        playlists: state.playlists.map(p => 
          p.id === playlistId 
            ? { ...p, songIds: p.songIds.filter(id => id !== songId) }
            : p
        )
      })),

      renamePlaylist: (playlistId, name) => set((state) => ({
        playlists: state.playlists.map(p => 
          p.id === playlistId ? { ...p, name } : p
        )
      })),

      deletePlaylist: (playlistId) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== playlistId),
        activePlaylistId: state.activePlaylistId === playlistId ? null : state.activePlaylistId
      })),

      setActivePlaylist: (id) => set({ activePlaylistId: id }),

      playFromQueue: (index) => {
        const { queue } = get();
        if (index >= 0 && index < queue.length) {
          set({ currentSong: queue[index], currentIndex: index, progress: 0, isPlaying: true });
        }
      },

      nextSong: () => {
        const { queue, currentIndex, isShuffle, repeatMode } = get();
        if (queue.length === 0) return;
        
        let nextIndex = 0;
        if (currentIndex !== -1) {
          if (isShuffle) {
            nextIndex = Math.floor(Math.random() * queue.length);
          } else {
            nextIndex = currentIndex + 1;
            if (nextIndex >= queue.length) {
              if (repeatMode === 'all') {
                nextIndex = 0;
              } else {
                set({ isPlaying: false, progress: 0 });
                return;
              }
            }
          }
        }
        
        set({ currentSong: queue[nextIndex], currentIndex: nextIndex, progress: 0, isPlaying: true });
      },

      prevSong: () => {
        const { queue, currentIndex, isShuffle } = get();
        if (queue.length === 0) return;
        
        let prevIndex = 0;
        if (currentIndex !== -1) {
          if (isShuffle) {
            prevIndex = Math.floor(Math.random() * queue.length);
          } else {
            prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
              prevIndex = queue.length - 1;
            }
          }
        }
        
        set({ currentSong: queue[prevIndex], currentIndex: prevIndex, progress: 0, isPlaying: true });
      },
    }),
    {
      name: 'aura-player-storage',
      partialize: (state) => ({
        playlists: state.playlists,
        likedSongIds: state.likedSongIds,
        volume: state.volume,
      }),
    }
  )
);
