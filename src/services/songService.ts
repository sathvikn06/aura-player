import { getSupabase } from '../lib/supabase';
import { Song } from '../types';
import { generateFileHash } from '../lib/utils/audioUtils';

const BUCKET_NAME = 'songs';

export const songService = {
  /**
   * Fetches all songs from Supabase, sorted by created_at.
   */
  async fetchSongs(): Promise<Song[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching songs:', error);
      return [];
    }

    return data as Song[];
  },

  /**
   * Uploads a song to Supabase Storage and Database.
   * Includes duplicate detection via file hashing.
   */
  async uploadSong(
    file: File, 
    metadata: { title: string; artist: string; image_url: string }
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      // 1. Generate hash
      const fileHash = await generateFileHash(file);

      // 2. Check for duplicates
      const { data: existing } = await supabase
        .from('songs')
        .select('id')
        .eq('file_hash', fileHash)
        .single();

      if (existing) {
        return { success: false, error: 'Song already uploaded' };
      }

      // 3. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${fileHash}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 4. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      // 5. Get Duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        audio.onloadedmetadata = resolve;
      });
      const duration = Math.round(audio.duration);
      URL.revokeObjectURL(audio.src);

      // 6. Insert into Database
      const { error: insertError } = await supabase
        .from('songs')
        .insert({
          title: metadata.title,
          artist: metadata.artist,
          image_url: metadata.image_url,
          file_url: publicUrl,
          file_hash: fileHash,
          duration: duration
        });

      if (insertError) throw insertError;

      return { success: true };
    } catch (error: any) {
      console.error('Upload failed:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }
};
