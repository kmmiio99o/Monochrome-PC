import DiscordRpc from "discord-rpc";
import { state } from "../state";
import { DISCORD_CLIENT_ID } from "../config";
import { updateTray } from "../app/tray";
import { updateDiscordPresence } from "./presence";
import { syncWebviewState } from "../ipc/handlers";

export async function initDiscordRpc(): Promise<void> {
  try {
    const { Client } = DiscordRpc;
    state.discordRpc = new Client({ transport: "ipc" });

    state.discordRpc.on("ready", () => {
      state.discordConnected = true;
      updateTray();
      updateDiscordPresence();
      syncWebviewState();
    });

    state.discordRpc.on("disconnected", () => {
      state.discordConnected = false;
      updateTray();
      syncWebviewState();
    });

    await state.discordRpc.login({ clientId: DISCORD_CLIENT_ID });
  } catch (e: unknown) {
    state.discordConnected = false;
    updateTray();
    console.error("Discord RPC init failed:", (e as Error).message);
  }
}

export function destroyDiscordRpc(): void {
  if (state.discordRpc) {
    state.discordRpc.destroy().catch(() => {});
    state.discordRpc = null;
    state.discordConnected = false;
  }
}

export async function reconnectDiscordRpc(): Promise<void> {
  destroyDiscordRpc();
  await initDiscordRpc();
}
