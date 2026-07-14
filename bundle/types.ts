export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon?: string;
  main: string;
  permissions?: string[];
}

export interface PluginInstance {
  manifest: PluginManifest;
  enabled: boolean;
  api: PluginAPI;
  code: string;
}

export interface TrackInfo {
  title: string;
  artist: string;
  albumArt: string;
}

export interface ElectronSync {
  appVersion?: string;
  currentTrackTitle?: string;
  currentTrackArtist?: string;
  currentTrackAlbumArt?: string;
  isPlaying?: boolean;
  rpcEnabled?: boolean;
  rpcShowTitle?: boolean;
  rpcShowArtist?: boolean;
  rpcShowOnIdle?: boolean;
  rpcShowOnPause?: boolean;
  rpcShowTimestamp?: boolean;
  rpcActivityType?: number;
  rpcCustomDetails?: string;
  rpcLargeImageText?: string;
  rpcSmallImageKey?: string;
  rpcSmallImageText?: string;
  rpcButton1Label?: string;
  rpcButton1Url?: string;
  rpcButton2Label?: string;
  rpcButton2Url?: string;
  rpcConnected?: boolean;
  showNavigationBar?: boolean;
  closeToTray?: boolean;
}

export interface PluginAPI {
  manifest: PluginManifest;

  storage: {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
  };

  ui: {
    injectCSS(css: string): void;
    removeCSS(): void;
    addSettingsTab(name: string, id: string, render: (container: HTMLElement) => void): void;
    showNotification(text: string, duration?: number): void;
  };

  app: {
    onTrackChange(callback: (track: TrackInfo) => void): void;
    onPlayStateChange(callback: (isPlaying: boolean) => void): void;
    onReady(callback: () => void): void;
    getCurrentTrack(): TrackInfo & { isPlaying: boolean };
    executeInPage(js: string): Promise<unknown>;
  };

  ipc: {
    send(channel: string, ...args: unknown[]): void;
    on(channel: string, callback: (...args: unknown[]) => void): void;
  };

  settings: {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
  };

  bus: {
    emit(event: string, ...args: unknown[]): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;
  };
}
