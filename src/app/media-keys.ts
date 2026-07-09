import { globalShortcut } from "electron";
import { PLAY_PAUSE_JS, NEXT_JS, PREV_JS } from "../config";
import { execInPage } from "../player/controls";

export function registerMediaKeys(): void {
  globalShortcut.register("MediaPlayPause", () => execInPage(PLAY_PAUSE_JS));
  globalShortcut.register("MediaNextTrack", () => execInPage(NEXT_JS));
  globalShortcut.register("MediaPreviousTrack", () => execInPage(PREV_JS));
}

export function unregisterMediaKeys(): void {
  globalShortcut.unregisterAll();
}
