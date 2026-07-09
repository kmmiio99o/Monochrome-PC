import { state } from "../state";
import { DISCORD_CLIENT_ID } from "../config";

const DiscordRpc = require("discord-rpc");

export async function initDiscordRpc(): Promise<void> {
  try {
    const { Client } = DiscordRpc;
    state.discordRpc = new Client({ transport: "ipc" });

    state.discordRpc.on("ready", () => {
      state.discordConnected = true;
      const { updateTray } = require("../app/tray");
      const { updateDiscordPresence } = require("./presence");
      updateTray();
      updateDiscordPresence();
    });

    state.discordRpc.on("disconnected", () => {
      state.discordConnected = false;
      const { updateTray } = require("../app/tray");
      updateTray();
    });

    await state.discordRpc.login({ clientId: DISCORD_CLIENT_ID });
  } catch (e: unknown) {
    state.discordConnected = false;
    const { updateTray } = require("../app/tray");
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
