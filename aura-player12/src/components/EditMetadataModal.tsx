import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit2, Save, Image as ImageIcon } from 'lucide-react';
import { Song } from '../types';
import { songService } from '../services/songService';
import { toast } from 'sonner';

interface EditMetadataModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditMetadataModal: React.FC<EditMetadataModalProps> = ({ song, isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState(song?.title || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [imageUrl, setImageUrl] = useState(song?.image_url || '');
  const [loading, setLoading] = useState(false);

  // Update state when song changes
  React.useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setImageUrl(song.image_url);
    }
  }, [song]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!song) return;

    setLoading(true);
    const result = await songService.updateSongMetadata(song.id, {
      title: title.trim(),
      artist: artist.trim(),
      image_url: imageUrl.trim()
    });

    if (result.success) {
      toast.success('Song updated successfully');
      onSuccess();
      onClose();
    } else {
      toast.error(result.error || 'Failed to update song');
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-white/10 rounded-3xl p-6 md:p-8 z-[70] shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Edit2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Edit Metadata</h2>
                  <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Update track details</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <img 
                    src={imageUrl || 'https://picsum.photos/seed/music/400/400'} 
                    alt="Cover Preview" 
                    className="w-32 h-32 rounded-2xl object-cover shadow-xl border border-white/10"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                    <ImageIcon size={24} className="text-white/60" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Title</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent/50 transition-all"
                    placeholder="Song title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Artist</label>
                  <input
                    required
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent/50 transition-all"
                    placeholder="Artist name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Cover Image URL</label>
                  <input
                    required
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent/50 transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                  />
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
