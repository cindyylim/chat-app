  /* eslint-disable */
declare module 'use-sound' {
  import { HTMLAttributes } from 'react';

  interface UseSoundOptions {
    volume?: number;
    playbackRate?: number;
    interrupt?: boolean;
    soundEnabled?: boolean;
    sprite?: Record<string, [number, number]>;
    [key: string]: any;
  }

  type UseSoundReturn = [
    () => void,
    {
      sound: any;
      stop: () => void;
      pause: () => void;
      resume: () => void;
      isLoaded: boolean;
      isPlaying: boolean;
      duration: number | null;
      volume: number;
      playbackRate: number;
    }
  ];

  export function useSound(
    src: string,
    options?: UseSoundOptions
  ): UseSoundReturn;
} 