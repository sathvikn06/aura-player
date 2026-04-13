import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { X, Upload, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

interface BackgroundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({ isOpen, onClose }) => {
  const { customBackgrounds, addCustomBackground, removeCustomBackground } = usePlayerStore();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [starName, setStarName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (previewUrl && starName.trim()) {
      addCustomBackground(previewUrl, starName.trim());
      setPreviewUrl(null);
      setStarName('');
      toast.success('Background added successfully!');
    } else {
      toast.error('Please provide both an image and a name');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-surface/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <ImageIcon size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Background Settings</h2>
                <p className="text-xs text-white/40">Manage your cinematic slideshow</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Add New Star</h3>
              
              <div className="space-y-4">
                <div className="relative aspect-video rounded-2xl border-2 border-dashed border-white/10 hover:border-accent/40 transition-colors overflow-hidden group">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                      <Upload size={32} className="text-white/20 mb-2 group-hover:text-accent transition-colors" />
                      <span className="text-xs text-white/40 group-hover:text-white transition-colors">Click to upload image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60">Star Name</label>
                  <input 
                    type="text"
                    value={starName}
                    onChange={(e) => setStarName(e.target.value)}
                    placeholder="e.g. Prabhas"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-accent outline-none transition-colors"
                  />
                </div>

                <button 
                  onClick={handleUpload}
                  disabled={!previewUrl || !starName.trim()}
                  className="w-full py-3 bg-accent text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Add to Slideshow
                </button>
              </div>
            </div>

            {/* Current Backgrounds Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Your Custom Stars</h3>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {customBackgrounds.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-20">
                    <ImageIcon size={48} className="mb-2" />
                    <p className="text-xs">No custom backgrounds yet</p>
                  </div>
                ) : (
                  customBackgrounds.map((bg) => (
                    <div key={bg.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl group">
                      <img src={bg.url} alt={bg.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{bg.name}</p>
                        <p className="text-[10px] text-white/40">Custom Upload</p>
                      </div>
                      <button 
                        onClick={() => removeCustomBackground(bg.id)}
                        className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
