export interface Song {
  id: string;
  title: string;
  artist: string;
  song_url?: string;
  file_url?: string;
  image_url: string;
  duration: number;
  file_hash?: string;
  isCached?: boolean;
  lyrics?: string;
  playCount?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
}
