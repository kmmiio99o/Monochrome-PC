export function isTilingWM(): boolean {
  if (process.platform !== "linux") return false;

  const knownTiling = [
    "i3", "sway", "hyprland", "bspwm", "dwm", "qtile", "niri",
    "awesome", "xmonad", "herbstluftwm", "spectrwm",
    "ratpoison", "stumpwm", "leftwm", "dwl", "river",
  ];

  const desktop = (
    process.env.XDG_SESSION_DESKTOP ||
    process.env.XDG_CURRENT_DESKTOP ||
    ""
  ).toLowerCase();

  if (knownTiling.some((wm) => desktop.includes(wm))) return true;

  if (process.env.SWAYSOCK || process.env.I3SOCK || process.env.HYPRLAND_INSTANCE_SIGNATURE) return true;

  return false;
}
