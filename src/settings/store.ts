import * as path from "path";
import * as fs from "fs";
import { app } from "electron";
import { state } from "../state";

function settingsPath(): string {
  return path.join(app.getPath("userData"), "rpc-settings.json");
}

export function loadSettings(): void {
  try {
    const raw = fs.readFileSync(settingsPath(), "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.enabled === "boolean") state.rpcSettings.enabled = parsed.enabled;
      if (typeof parsed.showTitle === "boolean") state.rpcSettings.showTitle = parsed.showTitle;
      if (typeof parsed.showArtist === "boolean") state.rpcSettings.showArtist = parsed.showArtist;
      if (typeof parsed.customStatus === "string") state.rpcSettings.customStatus = parsed.customStatus;
      if (typeof parsed.showOnIdle === "boolean") state.rpcSettings.showOnIdle = parsed.showOnIdle;
      if (typeof parsed.activityType === "number") state.rpcSettings.activityType = parsed.activityType;
      if (typeof parsed.showTimestamp === "boolean") state.rpcSettings.showTimestamp = parsed.showTimestamp;
      if (typeof parsed.customDetails === "string") state.rpcSettings.customDetails = parsed.customDetails;
      if (typeof parsed.largeImageText === "string") state.rpcSettings.largeImageText = parsed.largeImageText;
      if (typeof parsed.smallImageKey === "string") state.rpcSettings.smallImageKey = parsed.smallImageKey;
      if (typeof parsed.smallImageText === "string") state.rpcSettings.smallImageText = parsed.smallImageText;
      if (typeof parsed.button1Label === "string") state.rpcSettings.button1Label = parsed.button1Label;
      if (typeof parsed.button1Url === "string") state.rpcSettings.button1Url = parsed.button1Url;
      if (typeof parsed.button2Label === "string") state.rpcSettings.button2Label = parsed.button2Label;
      if (typeof parsed.button2Url === "string") state.rpcSettings.button2Url = parsed.button2Url;
      if (typeof parsed.showNavigationBar === "boolean") state.showNavigationBar = parsed.showNavigationBar;
    }
  } catch {
    // File doesn't exist or is invalid — use defaults
  }
}

export function saveSettings(): void {
  try {
    const dir = path.dirname(settingsPath());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const data = { ...state.rpcSettings, showNavigationBar: state.showNavigationBar };
    fs.writeFileSync(settingsPath(), JSON.stringify(data, null, 2));
  } catch {
    // Silently fail on write errors
  }
}
