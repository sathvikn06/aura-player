import { Song } from '../../types';
import { getCachedSong } from '../db';
import { toast } from 'sonner';

/**
 * Downloads a song to the user's device.
 * Prioritizes cached version if available.
 */
export async function downloadSong(song: Song) {
  const toastId = toast.loading(`Preparing download for "${song.title}"...`);
  
  try {
    let blob: Blob | null = await getCachedSong(song.id);
    
    if (!blob) {
      const url = song.song_url || song.file_url;
      if (!url) throw new Error('No song URL found');
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch song');
      blob = await response.blob();
    }
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Set filename
    const extension = song.file_url?.split('.').pop() || 'mp3';
    a.download = `${song.artist} - ${song.title}.${extension}`;
    
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success(`Downloaded "${song.title}"`, { id: toastId });
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download song', { id: toastId });
  }
}
