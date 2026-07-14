import { PluginManager } from "./manager";
import { notifyTrackChange } from "./api";
import { getSync, communicate, fireReady } from "./utils";

import { init as initSettings } from "./core/settings/index";
import { init as initTheme } from "./core/theme-injector/index";
import { init as initNotifications } from "./core/notifications/index";
import { init as initMediaInfo } from "./core/media-info/index";
import { init as initShortcuts } from "./core/shortcuts/index";

declare global {
  interface Window {
    __electronSettingsSync?: Record<string, unknown>;
    __pluginManager?: PluginManager;
  }
}

const CORE_PLUGINS = [
  { id: "core:settings", name: "Desktop Settings", version: "1.0.0", author: "kmmiio99o", description: "Desktop App settings and plugin management", main: "" },
  { id: "core:theme-injector", name: "Theme Injector", version: "1.0.0", author: "kmmiio99o", description: "Custom CSS injection for Monochrome", main: "" },
  { id: "core:notifications", name: "Notifications", version: "1.0.0", author: "kmmiio99o", description: "Toast notifications on track changes", main: "" },
  { id: "core:media-info", name: "Media Info", version: "1.0.0", author: "kmmiio99o", description: "Media Session API integration for OS controls", main: "" },
  { id: "core:shortcuts", name: "Shortcuts", version: "1.0.0", author: "kmmiio99o", description: "Keyboard shortcuts for playback control", main: "" },
];

(function main() {
  if (document.getElementById("settings-tab-electron-app")) return;

  const sel = document.querySelector(".settings-tabs");
  const sp = document.getElementById("page-settings");
  if (!sel || !sp) return;

  const mgr = new PluginManager();
  (window as unknown as Record<string, unknown>).__pluginManager = mgr;

  for (const m of CORE_PLUGINS) {
    mgr.registerCore(m, true);
  }

  initSettings(mgr);
  initTheme();
  initNotifications();
  initMediaInfo();
  initShortcuts();

  fireReady();

  const sync = getSync();
  if (sync.currentTrackTitle) {
    notifyTrackChange({
      title: sync.currentTrackTitle,
      artist: sync.currentTrackArtist || "",
      albumArt: sync.currentTrackAlbumArt || "",
    });
  }

  communicate("sync:request");
})();
