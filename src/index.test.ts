import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std/assert/mod.ts";
import { MessageType } from "./types/messageType.ts";

const MAX_LOBBIES = parseInt(Deno.env.get("MAX_LOBBIES") ?? "2");

Deno.test("Test max lobbies limit", async () => {
  const connections: WebSocket[] = [];
  const createLobbyMessage = JSON.stringify({
    type: MessageType.JOIN_LOBBY,
    data: "",
  });

  const connectAndCreateLobby = async () => {
    const ws = new WebSocket("ws://localhost:9080");
    connections.push(ws);

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => {
        ws.send(createLobbyMessage);
        resolve();
      };
      ws.onerror = (error) => reject(error);
    });

    const lobbyCreated = await new Promise<boolean>((resolve) => {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type == MessageType.LOBBY_JOINED) {
          resolve(true);
        } else if (data.type == MessageType.ERROR) {
          assertStringIncludes(
            data.data,
            "No Available Lobbies. Please try again."
          );
          resolve(false);
        }
      };
    });

    return lobbyCreated;
  };

  try {
    for (let i = 0; i < MAX_LOBBIES; i++) {
      const lobbyCreated = await connectAndCreateLobby();

      assertEquals(lobbyCreated, true, `Failed to create lobby ${i + 1}`);
    }

    const overlimitLobbyCreated = await connectAndCreateLobby();
    assertEquals(
      overlimitLobbyCreated,
      false,
      "Should not create more than MAX_LOBBIES lobbies"
    );
  } finally {
    for (const ws of connections) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
        await new Promise<void>((resolve) => {
          ws.onclose = () => resolve();
        });
      }
    }
  }
});
