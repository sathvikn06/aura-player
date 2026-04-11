import { Song, UserProfile } from '../types';

/**
 * Singleton Audio Instance to ensure only one audio element exists.
 */
class AudioController {
  private static instance: AudioController;
  public audio: HTMLAudioElement;
  public audioContext: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  public source: MediaElementAudioSourceNode | null = null;

  private constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
  }

  public static getInstance(): AudioController {
    if (!AudioController.instance) {
      AudioController.instance = new AudioController();
    }
    return AudioController.instance;
  }

  public initVisualizer() {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.source = this.audioContext.createMediaElementSource(this.audio);
      
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      this.analyser.fftSize = 256;
    } catch (e) {
      console.error('Failed to initialize AudioContext:', e);
    }
  }
}

export const audioController = AudioController.getInstance();
