import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Music, User, Image as ImageIcon, Loader2 } from 'lucide-react';
import { PremiumButton } from './PremiumButton';
import { GlassCard } from './GlassCard';
import { songService } from '../services/songService';
import { toast } from 'sonner';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Auto-fill title from filename
      const fileName = e.target.files[0].name.replace(/\.[^/.]+$/, "");
      if (!title) setTitle(fileName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !artist) return;

    setIsUploading(true);
    const toastId = toast.loading('Uploading track to Aura Cloud...');

    const result = await songService.uploadSong(file, {
      title,
      artist,
      image_url: imageUrl || `https://picsum.photos/seed/${title}/800/800`
    });

    setIsUploading(false);

    if (result.success) {
      toast.success('Track published successfully!', { id: toastId });
      onSuccess();
      onClose();
      // Reset form
      setFile(null);
      setTitle('');
      setArtist('');
      setImageUrl('');
    } else {
      toast.error(result.error || 'Failed to upload song', { id: toastId });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <GlassCard hover={false} className="p-6 md:p-8 border-glass-border bg-surface">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">Upload New Track</h2>
                <button onClick={onClose} className="p-2 hover:bg-glass rounded-full transition-colors text-text-secondary hover:text-text-primary">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="audio-upload"
                    required
                  />
                  <label
                    htmlFor="audio-upload"
                    className="flex flex-col items-center justify-center w-full h-28 md:h-32 border-2 border-dashed border-glass-border rounded-2xl hover:border-accent/20 hover:bg-accent/5 transition-all cursor-pointer group"
                  >
                    {file ? (
                      <div className="flex items-center gap-3 text-text-primary">
                        <Music size={24} className="text-accent" />
                        <span className="font-medium truncate max-w-[200px] text-sm">{file.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={28} className="text-text-secondary/40 group-hover:text-accent/60 transition-colors mb-2" />
                        <span className="text-xs md:text-sm text-text-secondary/40 group-hover:text-accent/60">Select Audio File</span>
                      </>
                    )}
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Music className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
                    <input
                      type="text"
                      placeholder="Track Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-glass border border-glass-border rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none transition-colors text-sm text-text-primary"
                      required
                    />
                  </div>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
                    <input
                      type="text"
                      placeholder="Artist Name"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="w-full bg-glass border border-glass-border rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none transition-colors text-sm text-text-primary"
                      required
                    />
                  </div>

                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
                    <input
                      type="url"
                      placeholder="Cover Image URL (Optional)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-glass border border-glass-border rounded-xl py-3 pl-12 pr-4 focus:border-accent outline-none transition-colors text-sm text-text-primary"
                    />
                  </div>
                </div>

                <PremiumButton
                  type="submit"
                  disabled={isUploading || !file}
                  className="w-full py-3.5 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Publish Track'
                  )}
                </PremiumButton>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
