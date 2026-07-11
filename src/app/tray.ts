import * as path from "path";
import { Tray, Menu, nativeImage, app } from "electron";
import { state } from "../state";
import { playPause, nextTrack, prevTrack } from "../player/controls";
import { saveSettings } from "../settings/store";
import { updateNavBar } from "./window";

export function createTray(): void {
  const iconPath = path.join(__dirname, "..", "..", "assets", "icon.png");
  let icon: Electron.NativeImage;
  try {
    icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } catch {
    icon = nativeImage.createEmpty();
  }

  state.tray = new Tray(icon);
  state.tray.on("double-click", () => {
    if (state.mainWindow) {
      state.mainWindow.show();
      state.mainWindow.focus();
    }
  });

  rebuildTrayMenu();
}

export function updateTray(): void {
  rebuildTrayMenu();
}

function rebuildTrayMenu(): void {
  if (!state.tray) return;

  state.tray.setToolTip("Monochrome Player");

  const nowPlaying =
    state.isPlaying && state.currentTrack.title !== "Not Playing"
      ? state.currentTrack.title + (state.currentTrack.artist ? " \u2014 " + state.currentTrack.artist : "")
      : null;

  const template: Electron.MenuItemConstructorOptions[] = [];

  if (nowPlaying) {
    template.push({
      label: nowPlaying.substring(0, 60),
      enabled: false,
    });
    template.push({ type: "separator" });
  }

  template.push(
    {
      label: state.isPlaying ? "Pause" : "Play",
      click: () => playPause(),
    },
    { label: "Next Track", click: () => nextTrack() },
    { label: "Previous Track", click: () => prevTrack() },
    { type: "separator" },
    {
      label: "Show Window",
      click: () => {
        if (state.mainWindow) {
          state.mainWindow.show();
          state.mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: "Show Navigation Bar",
      type: "checkbox",
      checked: state.showNavigationBar,
      click: async () => {
        await updateNavBar();
        saveSettings();
        rebuildTrayMenu();
      },
    },
    { type: "separator" },
    {
      label: "Close to Tray",
      type: "checkbox",
      checked: state.closeToTray,
      click: () => {
        state.closeToTray = !state.closeToTray;
      },
    },
    {
      label: "Quit",
      click: () => {
        state.isQuitting = true;
        app.quit();
      },
    },
  );
  state.tray.setContextMenu(Menu.buildFromTemplate(template));
}
