import { BrowserWindow, Tray } from "electron";
import { RpcSettings, TrackInfo, DiscordClient } from "./types";
import { DEFAULT_RPC_SETTINGS } from "./config";

export const state = {
  mainWindow: null as BrowserWindow | null,
  tray: null as Tray | null,
  discordRpc: null as DiscordClient | null,
  discordConnected: false,
  rpcSettings: { ...DEFAULT_RPC_SETTINGS } as RpcSettings,
  currentTrack: { title: "Not Playing", artist: "", albumArt: "" } as TrackInfo,
  isPlaying: false,
  trackStartTime: null as number | null,
  playerPollInterval: null as ReturnType<typeof setInterval> | null,
  closeToTray: true,
  isQuitting: false,
};
