import React, { useState } from 'react';
import { Home, Search, Library, Heart, PlusSquare, LogOut, User, Upload, ListMusic, MoreVertical, Edit2, Trash2, Check, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';

interface SidebarProps {
  onUploadClick?: () => void;
  onSearchClick?: () => void;
  onLibraryClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onUploadClick, onSearchClick, onLibraryClick }) => {
  const { user, login, logout } = useAuth();
  const { playlists, createPlaylist, renamePlaylist, deletePlaylist, activePlaylistId, setActivePlaylist } = usePlayerStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const navItems = [
    { icon: Home, label: 'Home', active: !activePlaylistId, onClick: () => { setActivePlaylist(null); onLibraryClick?.(); } },
    { icon: Search, label: 'Search', onClick: onSearchClick },
    { icon: Library, label: 'Library', onClick: onLibraryClick },
  ];

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renamePlaylist(id, editName.trim());
      setEditingId(null);
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
    setShowMenuId(null);
  };

  return (
    <div className="hidden md:flex w-60 h-full flex-col bg-background border-r border-white/5 py-8 px-4">
      <div className="flex items-center gap-2.5 px-4 mb-10">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <span className="font-bold text-black text-lg">A</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Aura</h1>
      </div>

      <nav className="space-y-8 flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                item.active ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} strokeWidth={item.active ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Library</p>
          
          <button
            onClick={() => setActivePlaylist('liked')}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all text-sm font-medium ${
              activePlaylistId === 'liked' ? 'bg-white/5 text-accent' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart size={18} fill={activePlaylistId === 'liked' ? 'currentColor' : 'none'} strokeWidth={activePlaylistId === 'liked' ? 2.5 : 2} />
            <span>Liked Songs</span>
          </button>

          {isCreating ? (
            <form onSubmit={handleCreatePlaylist} className="px-4 py-2">
              <input
                autoFocus
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onBlur={() => !newPlaylistName && setIsCreating(false)}
                placeholder="Playlist name..."
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-accent transition-colors"
              />
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
            >
              <PlusSquare size={18} />
              <span>Create Playlist</span>
            </button>
          )}
          
          {user && (
            <button
              onClick={onUploadClick}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
            >
              <Upload size={18} />
              <span>Upload Song</span>
            </button>
          )}
        </div>

        {playlists.length > 0 && (
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Playlists</p>
            {playlists.map((playlist) => (
              <div key={playlist.id} className="relative group">
                {editingId === playlist.id ? (
                  <div className="px-4 py-1">
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded px-2 py-1">
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(playlist.id)}
                        className="w-full bg-transparent text-xs outline-none"
                      />
                      <button onClick={() => handleRename(playlist.id)} className="text-accent hover:text-accent/80">
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <button
                      onClick={() => setActivePlaylist(playlist.id)}
                      className={`flex items-center gap-3 flex-1 px-4 py-2 rounded-lg transition-all text-sm font-medium text-left min-w-0 ${
                        activePlaylistId === playlist.id ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ListMusic size={18} strokeWidth={activePlaylistId === playlist.id ? 2.5 : 2} className="flex-shrink-0" />
                      <span className="truncate">{playlist.name}</span>
                    </button>
                    
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowMenuId(showMenuId === playlist.id ? null : playlist.id); }}
                        className="p-1.5 text-white/20 hover:text-white"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {showMenuId === playlist.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowMenuId(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: 10 }}
                            className="absolute left-full ml-2 top-0 w-32 bg-surface border border-white/5 rounded-lg py-1 z-50 shadow-2xl"
                          >
                            <button
                              onClick={() => startEditing(playlist.id, playlist.name)}
                              className="w-full text-left px-3 py-1.5 text-[11px] text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2"
                            >
                              <Edit2 size={12} />
                              Rename
                            </button>
                            <button
                              onClick={() => { deletePlaylist(playlist.id); setShowMenuId(null); }}
                              className="w-full text-left px-3 py-1.5 text-[11px] text-red-400/60 hover:text-red-400 hover:bg-white/5 flex items-center gap-2"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        {user ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full bg-white/10" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold truncate w-24">{user.displayName}</span>
                <span className="text-[10px] text-white/20">Pro Member</span>
              </div>
            </div>
            <button onClick={logout} className="p-2 text-white/20 hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-white text-black hover:opacity-90 transition-all text-sm font-bold justify-center"
          >
            <User size={18} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
};
