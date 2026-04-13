import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

export const useKeyboardShortcuts = () => {
  const { 
    isPlaying, setIsPlaying, 
    nextSong, prevSong, 
    volume, setVolume,
    toggleFullscreen,
    isFullscreen
  } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'ArrowRight':
          if (e.metaKey || e.ctrlKey) {
            nextSong();
          } else {
            // Optional: Seek forward
          }
          break;
        case 'ArrowLeft':
          if (e.metaKey || e.ctrlKey) {
            prevSong();
          } else {
            // Optional: Seek backward
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(volume + 0.1, 2.0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(volume - 0.1, 0));
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          setVolume(volume > 0 ? 0 : 1.0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isFullscreen, nextSong, prevSong, setIsPlaying, setVolume, toggleFullscreen]);
};
