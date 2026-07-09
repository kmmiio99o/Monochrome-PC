import { state } from "../state";

export function updateDiscordPresence(): void {
  if (!state.discordRpc || !state.rpcSettings.enabled || !state.discordConnected) return;
  if (state.currentTrack.title === "Not Playing") {
    clearDiscordPresence();
    return;
  }

  try {
    const details = state.rpcSettings.showTitle
      ? state.currentTrack.title.substring(0, 128)
      : undefined;

    const artistState = state.rpcSettings.showArtist
      ? state.currentTrack.artist.substring(0, 128)
      : undefined;

    const activity: Record<string, unknown> = {
      details,
      state: state.rpcSettings.customStatus
        ? state.rpcSettings.customStatus.substring(0, 128)
        : artistState,
      largeImageKey: state.currentTrack.albumArt || undefined,
      largeImageText:
        (state.isPlaying ? "" : "\u23F8 ") +
        state.currentTrack.title +
        (state.currentTrack.artist ? " \u2014 " + state.currentTrack.artist : ""),
      type: 2,
      instance: false,
    };

    if (state.isPlaying && state.trackStartTime) {
      activity.startTimestamp = state.trackStartTime;
      const dur = state.currentTrack.duration;
      if (typeof dur === "number" && isFinite(dur) && dur > 0) {
        activity.endTimestamp = state.trackStartTime + dur * 1000;
      }
    }

    state.discordRpc.setActivity(activity);
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
