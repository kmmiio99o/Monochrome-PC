import * as path from "path";
import { Tray, Menu, nativeImage, app } from "electron";
import { state } from "../state";
import { DISCORD_CLIENT_ID } from "../config";
import { playPause, nextTrack, prevTrack } from "../player/controls";

let _onRpcChanged: (() => void) | null = null;
let _promptCustomStatus: (() => void) | null = null;

export function createTray(
  onRpcChanged: () => void,
  promptCustomStatus: () => void,
): void {
  _onRpcChanged = onRpcChanged;
  _promptCustomStatus = promptCustomStatus;

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

  const statusParts = ["Monochrome Player"];
  if (state.discordConnected) statusParts.push("RPC Connected");
  else if (DISCORD_CLIENT_ID) statusParts.push("RPC Disconnected");
  state.tray.setToolTip(statusParts.join(" \u2022 "));

  const nowPlaying =
    state.isPlaying && state.currentTrack.title !== "Not Playing"
      ? state.currentTrack.title +
        (state.currentTrack.artist ? " \u2014 " + state.currentTrack.artist : "")
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
        label: "Discord RPC " + (state.discordConnected ? "\u2713" : "\u274c"),
        submenu: [
          {
            label: "Enable Rich Presence",
            type: "checkbox",
            checked: state.rpcSettings.enabled,
            click: () => {
              state.rpcSettings.enabled = !state.rpcSettings.enabled;
              _onRpcChanged?.();
            },
          },
          { type: "separator" },
          {
            label: "Show Track Title",
            type: "checkbox",
            checked: state.rpcSettings.showTitle,
            click: () => {
              state.rpcSettings.showTitle = !state.rpcSettings.showTitle;
              _onRpcChanged?.();
            },
          },
          {
            label: "Show Artist",
            type: "checkbox",
            checked: state.rpcSettings.showArtist,
            click: () => {
              state.rpcSettings.showArtist = !state.rpcSettings.showArtist;
              _onRpcChanged?.();
            },
          },
          { type: "separator" },
          {
            label: state.rpcSettings.customStatus
              ? 'Status: \u201c' + state.rpcSettings.customStatus.substring(0, 30) + '\u201d'
              : "Set Custom Status...",
            click: () => _promptCustomStatus?.(),
          },
          {
            label: "Clear Custom Status",
            enabled: !!state.rpcSettings.customStatus,
            click: () => {
              state.rpcSettings.customStatus = "";
              _onRpcChanged?.();
            },
          },
        ],
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
