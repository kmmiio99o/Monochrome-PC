import { state } from "../state";
import { POLL_INTERVAL_MS, INITIAL_POLL_DELAY_MS } from "../config";
import { PollResult } from "../types";
import { sendNotification } from "./controls";

let _initialPollComplete = false;

const POLL_SCRIPT = `
(function() {
  try {
    var titleEl = document.querySelector('.now-playing-bar .track-info .details .title');
    var artistEl = document.querySelector('.now-playing-bar .track-info .details .artist');
    var audioEl = document.querySelector('#audio-player');
    var title = '';
    if (titleEl) {
      var clone = titleEl.cloneNode(true);
      clone.querySelectorAll('.quality-badge, .shaka-quality-badge').forEach(function(b) { b.remove(); });
      title = (clone.textContent || clone.innerText || '').trim();
    }
    var artist = artistEl ? (artistEl.textContent || artistEl.innerText || '') : '';
    if (title === 'Select a song') {
      return JSON.stringify({ track: { title: 'Not Playing', artist: '' }, isPlaying: false });
    }
    var isPaused = audioEl ? audioEl.paused : true;
    var coverEl = document.querySelector('.now-playing-bar .track-info .cover');
    var albumArt = coverEl ? (coverEl.src || '') : '';
    return JSON.stringify({
      track: { title: title, artist: artist, album: '', albumArt: albumArt, duration: audioEl ? (audioEl.duration || 0) : 0 },
      isPlaying: !isPaused,
      progress: audioEl ? (audioEl.currentTime || 0) : 0
    });
  } catch(e) {
    return JSON.stringify({ track: { title: 'Not Playing', artist: '' }, isPlaying: false });
  }
})()
`;

function pollOnce(): void {
  if (!state.mainWindow || state.mainWindow.isDestroyed()) return;

  state.mainWindow.webContents
    .executeJavaScript(POLL_SCRIPT)
    .then((result: string) => {
      try {
        const data = JSON.parse(result) as PollResult;
        if (!data) return;

        const trackKey =
          data.track.title + "|" + data.track.artist;
        const currentKey =
          state.currentTrack.title + "|" + state.currentTrack.artist;

        if (trackKey !== currentKey) {
          state.currentTrack = data.track;
          state.isPlaying = data.isPlaying;
          state.trackStartTime = data.isPlaying ? Date.now() : null;

          const { updateDiscordPresence } = require("../discord/presence");
          const { updateTray } = require("../app/tray");
          updateDiscordPresence();
          updateTray();
          if (_initialPollComplete) sendNotification(data.track);
        } else if (data.isPlaying !== state.isPlaying) {
          state.isPlaying = data.isPlaying;
          if (data.isPlaying) state.trackStartTime = Date.now();

          const { updateDiscordPresence } = require("../discord/presence");
          const { updateTray } = require("../app/tray");
          updateDiscordPresence();
          updateTray();
        }
      } catch {
        // JSON parse failed — skip this cycle
      }
      _initialPollComplete = true;
    })
    .catch(() => {
      // executeJavaScript failed — page might not be ready
      _initialPollComplete = true;
    });
}

export function startPlayerPolling(): void {
  if (state.playerPollInterval) {
    clearInterval(state.playerPollInterval);
  }

  setTimeout(() => {
    pollOnce();
    state.playerPollInterval = setInterval(pollOnce, POLL_INTERVAL_MS);
  }, INITIAL_POLL_DELAY_MS);
}

export function stopPlayerPolling(): void {
  if (state.playerPollInterval) {
    clearInterval(state.playerPollInterval);
    state.playerPollInterval = null;
  }
}
