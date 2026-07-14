import { loadBundleCode } from "./bundle";
import { state } from "../state";

export function injectSettingsTab(): void {
  if (!state.webviewWC || state.webviewWC.isDestroyed()) return;
  const code = loadBundleCode();
  if (code) state.webviewWC.executeJavaScript(code).catch(() => {});
}
