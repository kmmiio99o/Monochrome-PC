import { communicate, addTab, settingItem, toggle, textInput, selectInput, actionBtn, inputStyle, $ } from "../../utils";
import { showAbout } from "./about-modal";

export function renderDesktopTab(version: string): void {
  if ($("settings-tab-electron-app")) return;

  const tab = addTab("Desktop App", "electron-app");
  const I = inputStyle();

  tab.innerHTML =
    '<div class="settings-list">' +
    // -- General --
    '<div class="settings-group">' +
    settingItem("Navigation Bar", "Show navigation controls in the desktop window", toggle("electron-navbar-toggle", false)) +
    settingItem("Close to Tray", "Minimize to system tray instead of quitting", toggle("electron-closetotray-toggle", true)) +
    "</div>" +

    // -- Discord RPC --
    '<div class="settings-group">' +
    '<h3 class="group-title" style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary,#888);margin:24px 0 8px 8px">Discord Rich Presence</h3>' +
    settingItem("Enable RPC", "Show your listening activity on Discord", toggle("electron-rpc-toggle", true)) +
    settingItem("Show Track Title", "Display the current track name", toggle("electron-rpc-title-toggle", true)) +
    settingItem("Show Artist", "Display the artist name", toggle("electron-rpc-artist-toggle", true)) +
    settingItem("Show on Idle", "Show Discord activity when not playing music", toggle("electron-rpc-idle-toggle", false)) +
    settingItem("Show on Pause", "Show Discord activity when music is paused", toggle("electron-rpc-pause-toggle", true)) +
    settingItem("Show Timestamp", "Display elapsed and remaining time", toggle("electron-rpc-timestamp-toggle", true)) +
    settingItem("Activity Type", "Choose how your activity appears",
      selectInput("electron-rpc-activity-type", [[0, "Playing"], [2, "Listening"], [3, "Watching"], [5, "Competing"]], 2)) +
    settingItem("Custom Status", "Override status text \u2014 {song_name}, {artist}, {status}",
      textInput("electron-rpc-custom-status", "", "e.g. Listening to {song_name}")) +
    '<div class="setting-item"><div class="info"><span class="label">Connection</span>' +
    '<span class="description" id="electron-rpc-status">Checking...</span></div>' +
    actionBtn("electron-rpc-reconnect", "Reconnect", "#5865F2") + "</div>" +
    "</div>" +

    // -- Advanced --
    '<div class="settings-group">' +
    '<style>.electron-adv{max-height:0;overflow:hidden;transition:max-height .35s ease,opacity .35s ease;opacity:0}.electron-adv.open{max-height:3000px;opacity:1}</style>' +
    '<h3 class="group-title" id="electron-rpc-advanced-header" style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary,#888);margin:24px 0 8px 8px;cursor:pointer;user-select:none">\u25b8 Advanced</h3>' +
    '<div id="electron-rpc-advanced-body" class="electron-adv">' +
    '<div style="margin:12px 0;padding:0 8px"><div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:2px">Custom Details</div>' +
    '<div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:6px;line-height:1.4">Override the first line \u2014 {song_name}, {artist}, {status}</div>' +
    '<input type="text" id="electron-rpc-custom-details" placeholder="e.g. {song_name}" ' + I + "></div>" +
    '<div style="margin:12px 0;padding:0 8px"><div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:2px">Large Image Text</div>' +
    '<div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:6px;line-height:1.4">Tooltip when hovering album art \u2014 {song_name}, {artist}</div>' +
    '<input type="text" id="electron-rpc-large-image-text" placeholder="Now playing {song_name}" ' + I + "></div>" +
    '<div style="margin:12px 0;padding:0 8px"><div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:2px">Small Image Key</div>' +
    '<div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:6px;line-height:1.4">Discord asset key for a small icon</div>' +
    '<input type="text" id="electron-rpc-small-image-key" placeholder="e.g. monochrome_logo" ' + I + "></div>" +
    '<div style="margin:12px 0;padding:0 8px"><div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:2px">Small Image Text</div>' +
    '<div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:6px;line-height:1.4">Tooltip for the small icon \u2014 {song_name}, {artist}</div>' +
    '<input type="text" id="electron-rpc-small-image-text" placeholder="{status}" ' + I + "></div>" +
    '<div style="margin:0 8px;padding-top:12px;border-top:1px solid var(--border-color,#222)">' +
    '<div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:2px">Custom Buttons</div>' +
    '<div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:10px;line-height:1.4">Add up to 2 buttons to your activity. Both label and URL required.</div>' +
    '<div style="display:flex;flex-direction:column;gap:10px">' +
    '<div style="display:flex;gap:8px"><input type="text" id="electron-rpc-button1-label" placeholder="Button 1 label" ' + I + ">" +
    '<input type="text" id="electron-rpc-button1-url" placeholder="https://..." ' + I + "></div>" +
    '<div style="display:flex;gap:8px"><input type="text" id="electron-rpc-button2-label" placeholder="Button 2 label" ' + I + ">" +
    '<input type="text" id="electron-rpc-button2-url" placeholder="https://..." ' + I + "></div>" +
    "</div></div></div></div>" +

    // -- About --
    '<div style="margin-top:24px;padding:8px 0;text-align:center">' +
    '<button id="electron-about-btn" style="background:#1f1f1f;border:1px solid #333;color:#e0e0e0;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500">About</button>' +
    "</div></div>";

  bindDesktopEvents(version);
}

function bindDesktopEvents(version: string): void {
  const on = (id: string, ev: string, fn: (this: HTMLElement, ev: Event) => void) => $(id)?.addEventListener(ev, fn);
  const checked = (el: HTMLElement) => (el as HTMLInputElement).checked ? "1" : "0";

  on("electron-navbar-toggle", "change", () => communicate("nav:toggle"));
  on("electron-closetotray-toggle", "change", function () { communicate("closeToTray:" + checked(this)); });
  on("electron-rpc-toggle", "change", () => communicate("rpc:toggle"));
  on("electron-rpc-title-toggle", "change", function () { communicate("rpc:showTitle:" + checked(this)); });
  on("electron-rpc-artist-toggle", "change", function () { communicate("rpc:showArtist:" + checked(this)); });
  on("electron-rpc-idle-toggle", "change", function () { communicate("rpc:showOnIdle:" + checked(this)); });
  on("electron-rpc-pause-toggle", "change", function () { communicate("rpc:showOnPause:" + checked(this)); });
  on("electron-rpc-timestamp-toggle", "change", function () { communicate("rpc:showTimestamp:" + checked(this)); });
  on("electron-rpc-activity-type", "change", function () { communicate("rpc:activityType:" + (this as HTMLSelectElement).value); });
  on("electron-rpc-custom-status", "change", function () { communicate("rpc:customStatus:" + encodeURIComponent((this as HTMLInputElement).value)); });
  on("electron-rpc-custom-details", "change", function () { communicate("rpc:customDetails:" + encodeURIComponent((this as HTMLInputElement).value)); });
  on("electron-rpc-large-image-text", "change", function () { communicate("rpc:largeImageText:" + encodeURIComponent((this as HTMLInputElement).value)); });
  on("electron-rpc-small-image-key", "change", function () { communicate("rpc:smallImageKey:" + encodeURIComponent((this as HTMLInputElement).value)); });
  on("electron-rpc-small-image-text", "change", function () { communicate("rpc:smallImageText:" + encodeURIComponent((this as HTMLInputElement).value)); });
  on("electron-rpc-button1-label", "change", function () { communicate("rpc:button1Label:" + encodeURIComponent((this as HTMLInputElement).value)); });
  on("electron-rpc-button1-url", "change", function () { communicate("rpc:button1Url:" + encodeURIComponent((this as HTMLInputElement).value)); });
  on("electron-rpc-button2-label", "change", function () { communicate("rpc:button2Label:" + encodeURIComponent((this as HTMLInputElement).value)); });
  on("electron-rpc-button2-url", "change", function () { communicate("rpc:button2Url:" + encodeURIComponent((this as HTMLInputElement).value)); });
  on("electron-rpc-reconnect", "click", () => communicate("rpc:reconnect"));

  on("electron-rpc-advanced-header", "click", function () {
    const b = $("electron-rpc-advanced-body");
    b?.classList.toggle("open");
    this.textContent = (b?.classList.contains("open") ? "\u25be" : "\u25b8") + " Advanced";
  });

  on("electron-about-btn", "click", () => showAbout(version));
}
