import * as path from "path";
import { RpcSettings, DiscordActivity } from "./types";

export const DISCORD_CLIENT_ID = "1524834746486489300";

export const WINDOW_WIDTH = 1280;
export const WINDOW_HEIGHT = 820;
export const WINDOW_MIN_WIDTH = 800;
export const WINDOW_MIN_HEIGHT = 600;

export const POLL_INTERVAL_MS = 2000;
export const INITIAL_POLL_DELAY_MS = 5000;

export const PROMPT_WINDOW_WIDTH = 400;
export const PROMPT_WINDOW_HEIGHT = 180;

export const DEFAULT_RPC_SETTINGS: RpcSettings = {
  enabled: true,
  showTitle: true,
  showArtist: true,
  customStatus: "",
};

export const EMPTY_PRESENCE: DiscordActivity = {
  type: 2,
  instance: false,
};

export const PLAY_PAUSE_JS = `(function() { var btn = document.querySelector('.now-playing-bar .play-pause-btn'); if (btn) btn.click(); })()`;
export const NEXT_JS = "(function() { var btn = document.querySelector('#next-btn'); if (btn) btn.click(); })()";
export const PREV_JS = "(function() { var btn = document.querySelector('#prev-btn'); if (btn) btn.click(); })()";
