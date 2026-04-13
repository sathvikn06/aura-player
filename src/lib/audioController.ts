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
  public filters: BiquadFilterNode[] = [];
  public masterGain: GainNode | null = null;
  public compressor: DynamicsCompressorNode | null = null;

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
      this.masterGain = this.audioContext.createGain();
      this.compressor = this.audioContext.createDynamicsCompressor();
      
      // Configure compressor for normalization
      this.compressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
      this.compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);

      // Create Equalizer Filters
      const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
      this.filters = frequencies.map((freq, i) => {
        const filter = this.audioContext!.createBiquadFilter();
        filter.type = i === 0 ? 'lowshelf' : i === frequencies.length - 1 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
      });

      // Connect nodes: source -> compressor -> filters -> masterGain -> analyser -> destination
      this.source.connect(this.compressor);
      
      let lastNode: AudioNode = this.compressor;
      this.filters.forEach(filter => {
        lastNode.connect(filter);
        lastNode = filter;
      });
      
      lastNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      this.analyser.fftSize = 256;
    } catch (e) {
      console.error('Failed to initialize AudioContext:', e);
    }
  }

  public setMasterGain(value: number) {
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.01);
    }
  }

  public updateEqualizer(gains: number[]) {
    if (!this.filters.length) return;
    gains.forEach((gain, i) => {
      if (this.filters[i]) {
        this.filters[i].gain.setTargetAtTime(gain, this.audioContext!.currentTime, 0.01);
      }
    });
  }
}

export const audioController = AudioController.getInstance();
