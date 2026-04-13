import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { getCachedSong, cacheSong } from '../lib/db';
import { audioController } from '../lib/audioController';

export const useAudio = () => {
  const audio = audioController.audio;
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const preloadedAudioRef = useRef<HTMLAudioElement | null>(null);

  const { 
    currentSong, 
    queue,
    currentIndex,
    isPlaying, 
    volume, 
    setProgress, 
    setDuration, 
    setIsPlaying, 
    setIsLoading,
    nextSong,
    repeatMode,
    isFullscreen,
    equalizer,
    sleepTimer,
    setSleepTimer
  } = usePlayerStore();

  // Handle sleep timer
  useEffect(() => {
    if (sleepTimer === null || sleepTimer <= 0) return;

    const interval = setInterval(() => {
      const { sleepTimer, setSleepTimer, setIsPlaying } = usePlayerStore.getState();
      if (sleepTimer !== null) {
        if (sleepTimer <= 1) {
          setIsPlaying(false);
          setSleepTimer(null);
        } else {
          setSleepTimer(sleepTimer - 1);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sleepTimer]);

  // Handle equalizer updates
  useEffect(() => {
    if (audioController.audioContext) {
      audioController.updateEqualizer(equalizer);
    }
  }, [equalizer]);

  // Initialize visualizer context on first interaction or when entering fullscreen
  useEffect(() => {
    if (isFullscreen) {
      audioController.initVisualizer();
      if (audioController.audioContext?.state === 'suspended') {
        audioController.audioContext.resume();
      }
    }
  }, [isFullscreen]);

  // Smooth progress updates using requestAnimationFrame
  useEffect(() => {
    const updateProgress = () => {
      if (isPlaying) {
        setProgress(audio.currentTime);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, audio, setProgress]);

  // Handle events
  useEffect(() => {
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => {
      const { repeatMode, nextSong } = usePlayerStore.getState();
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextSong();
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [setDuration, setIsLoading, audio]);

  // Preload next song
  useEffect(() => {
    if (!isPlaying || queue.length === 0 || currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % queue.length;
    const nextSong = queue[nextIndex];
    
    if (nextSong && nextSong.id !== currentSong?.id) {
      const preloadNext = async () => {
        const cachedBlob = await getCachedSong(nextSong.id);
        let url = cachedBlob ? URL.createObjectURL(cachedBlob) : (nextSong.song_url || nextSong.file_url);
        
        if (url) {
          if (!preloadedAudioRef.current) {
            preloadedAudioRef.current = new Audio();
          }
          preloadedAudioRef.current.src = url;
          preloadedAudioRef.current.preload = 'auto';

          // If not cached, cache it now
          if (!cachedBlob) {
            try {
              const res = await fetch(url);
              if (res.ok) {
                const blob = await res.blob();
                await cacheSong(nextSong.id, blob);
              }
            } catch (e) {}
          }
        }
      };
      
      // Delay preloading slightly to prioritize current playback
      const timer = setTimeout(preloadNext, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentSong?.id, currentIndex, queue, isPlaying]);

  // Handle volume
  useEffect(() => {
    if (audioController.audioContext && audioController.masterGain) {
      audioController.setMasterGain(volume);
      audio.volume = 1.0; // Keep element volume at max to let masterGain control it
    } else {
      audio.volume = Math.min(volume, 1.0); // Fallback for non-initialized context
    }
  }, [volume, audio]);

  // Handle source changes
  useEffect(() => {
    const loadSong = async () => {
      if (!currentSong) return;

      setIsLoading(true);
      try {
        const cachedBlob = await getCachedSong(currentSong.id);
        let url = currentSong.song_url || currentSong.file_url;

        if (cachedBlob) {
          url = URL.createObjectURL(cachedBlob);
        } else if (url) {
          // Cache in background
          fetch(url)
            .then(async (res) => {
              if (!res.ok) return;
              const blob = await res.blob();
              await cacheSong(currentSong.id, blob);
            })
            .catch(() => {});
        }

        if (url) {
          audio.src = url;
          audio.load();
          
          if (isPlaying) {
            const playPromise = audio.play();
            playPromiseRef.current = playPromise;
            playPromise.catch(e => {
              if (e.name !== 'AbortError') {
                console.error('Playback failed:', e);
                setIsPlaying(false);
                setIsLoading(false);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading audio:', error);
        setIsLoading(false);
      }
    };

    loadSong();
  }, [currentSong?.id, audio]);

  // Handle play/pause toggle
  useEffect(() => {
    const togglePlayback = async () => {
      if (isPlaying) {
        if (audio.src) {
          // Resume AudioContext if needed
          if (audioController.audioContext?.state === 'suspended') {
            await audioController.audioContext.resume();
          }
          
          const playPromise = audio.play();
          playPromiseRef.current = playPromise;
          playPromise.catch(e => {
            if (e.name !== 'AbortError') {
              console.error('Play interrupted:', e);
              setIsPlaying(false);
            }
          });
        }
      } else {
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
            audio.pause();
          } catch (e) {
            audio.pause();
          } finally {
            playPromiseRef.current = null;
          }
        } else {
          audio.pause();
        }
      }
    };

    togglePlayback();
  }, [isPlaying, audio, setIsPlaying]);

  const seek = (time: number) => {
    audio.currentTime = time;
    setProgress(time);
  };

  return { seek };
};
