import { ipcMain } from "electron";
import { state } from "../state";

export function registerIpcHandlers(onRpcChanged: () => void): void {
  ipcMain.handle("rpc:getState", () => ({ ...state.rpcSettings }));

  ipcMain.handle("rpc:toggle", () => {
    state.rpcSettings.enabled = !state.rpcSettings.enabled;
    onRpcChanged();
    return state.rpcSettings;
  });

  ipcMain.on("prompt:custom-status", (_event, value: string) => {
    state.rpcSettings.customStatus = value || "";
    onRpcChanged();
  });
}
