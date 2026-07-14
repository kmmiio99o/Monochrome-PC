import { bus } from "../../bus";

const JS_PLAY_PAUSE = "(function(){var b=document.querySelector('.now-playing-bar .play-pause-btn');if(b)b.click()})()";
const JS_NEXT = "(function(){var b=document.querySelector('#next-btn');if(b)b.click()})()";
const JS_PREV = "(function(){var b=document.querySelector('#prev-btn');if(b)b.click()})()";

function execute(js: string): void {
  try { eval(js); } catch {}
}

export function init(): void {
  bus.on("track:change", (track: unknown) => {
    const t = track as { title: string; artist: string; albumArt: string };
    if (t.title === "Not Playing" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title,
      artist: t.artist,
      artwork: t.albumArt ? [{ src: t.albumArt, sizes: "512x512", type: "image/png" }] : [],
    });
  });

  bus.on("playState:change", (isPlaying: unknown) => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  });

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => execute(JS_PLAY_PAUSE));
    navigator.mediaSession.setActionHandler("pause", () => execute(JS_PLAY_PAUSE));
    navigator.mediaSession.setActionHandler("nexttrack", () => execute(JS_NEXT));
    navigator.mediaSession.setActionHandler("previoustrack", () => execute(JS_PREV));
  }
}
