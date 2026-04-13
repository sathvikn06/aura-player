import React from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult,
  DraggableProvided,
  DraggableStateSnapshot
} from '@hello-pangea/dnd';
import { usePlayerStore } from '../store/usePlayerStore';
import { GripVertical, X, Music } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({ isOpen, onClose }) => {
  const { 
    queue, 
    currentIndex, 
    reorderQueue, 
    removeFromQueue, 
    playFromQueue 
  } = usePlayerStore();

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderQueue(result.source.index, result.destination.index);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-surface border-l border-glass-border z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-glass-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-text-primary">Queue</h2>
                <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest mt-1">
                  {queue.length} Tracks
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-glass rounded-full transition-colors text-text-secondary/40 hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {queue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary/20 gap-4">
                  <div className="w-12 h-12 rounded-full bg-glass flex items-center justify-center">
                    <Music size={24} />
                  </div>
                  <p className="text-sm font-medium">Queue is empty</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="queue">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="space-y-1"
                      >
                        {queue.map((song, index) => (
                          <Draggable 
                            // @ts-ignore
                            key={`${song.id}-${index}`} 
                            draggableId={`${song.id}-${index}`} 
                            index={index}
                          >
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "group flex items-center gap-3 p-2 rounded-lg transition-all",
                                  snapshot.isDragging ? "bg-accent/20 shadow-2xl scale-[1.02] z-50" : "hover:bg-glass",
                                  currentIndex === index ? "bg-accent/10" : ""
                                )}
                              >
                                <div 
                                  {...provided.dragHandleProps}
                                  className="text-text-secondary/20 group-hover:text-text-secondary/40 cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical size={16} />
                                </div>

                                <div 
                                  className="relative w-10 h-10 flex-shrink-0 cursor-pointer overflow-hidden rounded"
                                  onClick={() => playFromQueue(index)}
                                >
                                  <img 
                                    src={song.image_url} 
                                    alt={song.title} 
                                    className="w-full h-full object-cover"
                                  />
                                  {currentIndex === index && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <div className="flex items-end gap-0.5 h-2.5">
                                        <motion.div animate={{ height: [3, 8, 3] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-accent" />
                                        <motion.div animate={{ height: [8, 3, 8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-accent" />
                                        <motion.div animate={{ height: [5, 7, 5] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-accent" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div 
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => playFromQueue(index)}
                                >
                                  <h4 className={cn(
                                    "text-xs font-semibold truncate",
                                    currentIndex === index ? "text-accent" : "text-text-primary"
                                  )}>
                                    {song.title}
                                  </h4>
                                  <p className="text-[10px] text-text-secondary/40 truncate font-medium">{song.artist}</p>
                                </div>

                                <button 
                                  onClick={() => removeFromQueue(song.id)}
                                  className="p-1.5 text-text-secondary/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            <div className="p-6 border-t border-glass-border">
              <button 
                onClick={onClose}
                className="w-full py-2.5 rounded-lg bg-accent text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
