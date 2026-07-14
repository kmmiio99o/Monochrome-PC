import { communicate } from "../../utils";

export function init(): void {
  document.addEventListener("keydown", (e) => {
    const t = e.target as HTMLElement;
    if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable) return;

    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      communicate("shortcut:play-pause");
      return;
    }

    if (e.key === "m" || e.key === "M") {
      communicate("shortcut:mute");
      return;
    }

    if (e.key === "f" || e.key === "F") {
      communicate("shortcut:fullscreen");
      return;
    }
  });
}
