export interface RpcSettings {
  enabled: boolean;
  showTitle: boolean;
  showArtist: boolean;
  customStatus: string;
}

export interface TrackInfo {
  title: string;
  artist: string;
  albumArt?: string;
  duration?: number;
}

export interface PollResult {
  track: TrackInfo;
  isPlaying: boolean;
  progress: number;
}

export interface DiscordActivity {
  details?: string;
  state?: string;
  largeImageKey?: string;
  largeImageText?: string;
  smallImageKey?: string;
  smallImageText?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  type?: number;
  instance?: boolean;
  buttons?: Array<{ label: string; url: string }>;
}

export interface DiscordClient {
  login(options: { clientId: string }): Promise<void>;
  setActivity(args: DiscordActivity, pid?: number): Promise<unknown>;
  clearActivity(pid?: number): Promise<unknown>;
  destroy(): Promise<void>;
  on(event: string, listener: (...args: unknown[]) => void): this;
  removeAllListeners(event?: string): this;
}
