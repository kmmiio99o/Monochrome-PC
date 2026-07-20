import { state } from "../state";

const SET_ACTIVITY = "SET_ACTIVITY";

function resolveVars(text: string): string {
  return text
    .replace(/\{song_name\}/g, state.currentTrack.title)
    .replace(/\{artist\}/g, state.currentTrack.artist)
    .replace(/\{status\}/g, state.isPlaying ? "Playing" : "Paused");
}

function buildTimestamps(
  startTimestamp?: number,
  endTimestamp?: number,
): { start?: number; end?: number } | undefined {
  if (!startTimestamp && !endTimestamp) return undefined;
  return { start: startTimestamp, end: endTimestamp };
}

function sendActivity(activity: Record<string, unknown>): void {
  if (!state.discordRpc) return;
  const pid = process.pid;
  // discord-rpc Client has request() at runtime but it's not in the type definitions
  const rpc = state.discordRpc as unknown as { request: (cmd: string, args: Record<string, unknown>) => Promise<unknown> };
  rpc
    .request(SET_ACTIVITY, { pid, activity })
    .catch(() => {});
}

export function updateDiscordPresence(): void {
  if (!state.discordRpc || !state.rpcSettings.enabled || !state.discordConnected) return;

  if (state.currentTrack.title === "Not Playing") {
    if (state.rpcSettings.showOnIdle) {
      sendActivity({
        type: state.rpcSettings.activityType,
        instance: false,
        state: state.rpcSettings.customStatus
          ? resolveVars(state.rpcSettings.customStatus).substring(0, 128)
          : "Idle",
      });
    } else {
      clearDiscordPresence();
    }
    return;
  }

  if (!state.isPlaying && !state.rpcSettings.showOnPause) {
    clearDiscordPresence();
    return;
  }

  try {
    const s = state.rpcSettings;
    const details = s.customDetails
      ? resolveVars(s.customDetails).substring(0, 128)
      : s.showTitle
        ? state.currentTrack.title.substring(0, 128)
        : undefined;

    const artistState = s.showArtist
      ? state.currentTrack.artist.substring(0, 128)
      : undefined;

    const assets: Record<string, string> = {};
    if (state.currentTrack.albumArt) assets.large_image = state.currentTrack.albumArt;
    assets.large_text = s.largeImageText
      ? resolveVars(s.largeImageText)
      : (state.isPlaying ? "" : "\u23F8 ") +
        state.currentTrack.title +
        (state.currentTrack.artist ? " \u2014 " + state.currentTrack.artist : "");
    if (s.smallImageKey) {
      assets.small_image = s.smallImageKey;
      if (s.smallImageText) assets.small_text = resolveVars(s.smallImageText);
    }

    const buttons: Array<{ label: string; url: string }> = [];
    if (s.button1Label && s.button1Url)
      buttons.push({ label: s.button1Label.substring(0, 32), url: s.button1Url });
    if (s.button2Label && s.button2Url)
      buttons.push({ label: s.button2Label.substring(0, 32), url: s.button2Url });

    let startTimestamp: number | undefined;
    let endTimestamp: number | undefined;
    if (s.showTimestamp && state.isPlaying && state.trackStartTime) {
      startTimestamp = state.trackStartTime;
      const dur = state.currentTrack.duration;
      if (typeof dur === "number" && isFinite(dur) && dur > 0) {
        endTimestamp = state.trackStartTime + dur * 1000;
      }
    }

    const activity: Record<string, unknown> = {
      details,
      state: s.customStatus
        ? resolveVars(s.customStatus).substring(0, 128)
        : artistState,
      assets,
      type: s.activityType,
      instance: false,
      timestamps: buildTimestamps(startTimestamp, endTimestamp),
    };
    if (buttons.length > 0) activity.buttons = buttons;

    sendActivity(activity);
  } catch {
    // Silently fail on RPC errors
  }
}

export function clearDiscordPresence(): void {
  if (state.discordRpc) {
    try {
      state.discordRpc.clearActivity();
    } catch {
      // Silently fail
    }
  }
}
