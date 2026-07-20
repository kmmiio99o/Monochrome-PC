import { state } from "../state";
import { PLAY_PAUSE_JS, NEXT_JS, PREV_JS } from "../config";
import { TrackInfo } from "../types";

export function execInPage(js: string): void {
  if (state.webviewWC && !state.webviewWC.isDestroyed()) {
    state.webviewWC.executeJavaScript(js).catch(() => {});
  }
}

export function sendNotification(track: TrackInfo): void {
  if (!state.mainWindow || state.mainWindow.isDestroyed() || !track || track.title === "Not Playing") return;

  try {
    state.mainWindow.webContents.send("show-toast", track);
  } catch {
    // IPC send failed — window might be closing
  }
}

export function playPause(): void {
  execInPage(PLAY_PAUSE_JS);
}

export function nextTrack(): void {
  execInPage(NEXT_JS);
}

export function prevTrack(): void {
  execInPage(PREV_JS);
}
