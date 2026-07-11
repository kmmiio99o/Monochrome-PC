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

  ipcMain.on("nav:back", () => {
    void state.mainWindow?.webContents.goBack();
  });

  ipcMain.on("nav:forward", () => {
    void state.mainWindow?.webContents.goForward();
  });

  ipcMain.on("nav:reload", () => {
    state.mainWindow?.webContents.reload();
  });

  ipcMain.on("nav:minimize", () => {
    state.mainWindow?.minimize();
  });

  ipcMain.on("nav:maximize", () => {
    if (state.mainWindow?.isMaximized()) state.mainWindow.unmaximize();
    else state.mainWindow?.maximize();
  });

  ipcMain.on("nav:close", () => {
    state.mainWindow?.close();
  });

  ipcMain.handle("nav:toggle", async () => {
    const { updateNavBar } = await import("../app/window");
    await updateNavBar();
    return state.showNavigationBar;
  });
}
