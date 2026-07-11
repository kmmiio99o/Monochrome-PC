import { state } from "../state";

function resolveVars(text: string): string {
  return text
    .replace(/\{song_name\}/g, state.currentTrack.title)
    .replace(/\{artist\}/g, state.currentTrack.artist)
    .replace(/\{status\}/g, state.isPlaying ? "Playing" : "Paused");
}

export function updateDiscordPresence(): void {
  if (!state.discordRpc || !state.rpcSettings.enabled || !state.discordConnected) return;

  if (state.currentTrack.title === "Not Playing") {
    if (state.rpcSettings.showOnIdle) {
      setPresence({
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

    const artistState = s.showArtist ? state.currentTrack.artist.substring(0, 128) : undefined;

    const activity: Record<string, unknown> = {
      details,
      largeImageKey: state.currentTrack.albumArt || undefined,
      largeImageText:
        s.largeImageText
          ? resolveVars(s.largeImageText)
          : (state.isPlaying ? "" : "\u23F8 ") +
            state.currentTrack.title +
            (state.currentTrack.artist ? " \u2014 " + state.currentTrack.artist : ""),
      type: s.activityType,
      instance: false,
    };

    const activityState = s.customStatus
      ? resolveVars(s.customStatus).substring(0, 128)
      : artistState;
    if (activityState) activity.state = activityState;

    if (s.smallImageKey) {
      activity.smallImageKey = s.smallImageKey;
      if (s.smallImageText) activity.smallImageText = resolveVars(s.smallImageText);
    }

    const buttons: Array<{ label: string; url: string }> = [];
    if (s.button1Label && s.button1Url) buttons.push({ label: s.button1Label.substring(0, 32), url: s.button1Url });
    if (s.button2Label && s.button2Url) buttons.push({ label: s.button2Label.substring(0, 32), url: s.button2Url });
    if (buttons.length > 0) activity.buttons = buttons;

    if (s.showTimestamp && state.isPlaying && state.trackStartTime) {
      activity.startTimestamp = state.trackStartTime;
      const dur = state.currentTrack.duration;
      if (typeof dur === "number" && isFinite(dur) && dur > 0) {
        activity.endTimestamp = state.trackStartTime + dur * 1000;
      }
    }

    state.discordRpc.setActivity(activity).catch(() => {});
  } catch {
    // Silently fail on RPC errors
  }
}

function setPresence(activity: Record<string, unknown>): void {
  if (!state.discordRpc) return;
  try {
    state.discordRpc.setActivity(activity).catch(() => {});
  } catch {
    // Silently fail
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
