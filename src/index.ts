import {
  WebSocketClient,
  WebSocketServer,
} from "https://deno.land/x/websocket@v0.1.4/mod.ts";
import Lobby from "./models/Lobby.ts";
import Peer from "./models/Peer.ts";
import { MessageType } from "./types/messageType.ts";
import { Message } from "./utils/createMessage.ts";
import { createMessage, log, logError } from "./utils/index.ts";

const PORT = Deno.env.get("PORT") ?? "9080";
const wss = new WebSocketServer(parseInt(PORT));
const lobbies = new Map<string, Lobby>();

function joinLobby(peer: Peer, lobbyId: string) {
  if (lobbyId === "") {
    const lobby = new Lobby(peer.id);
    lobby.join(peer);
    lobbies.set(lobby.id, lobby);
    log(`Player: ${peer.id} created lobby with id: ${lobby.id}`);
  } else {
    const existingLobby = lobbies.get(lobbyId);

    if (existingLobby) {
      existingLobby.join(peer);
      log(`Player: ${peer.id} joined lobby with id: ${lobbyId}`);
    } else {
      logError("lobby does not exist!");
      peer.sendMessage(
        createMessage(MessageType.ERROR, peer.id, "Lobby ID invalid")
      );
    }
  }
}

function leaveLobby(peer: Peer) {
  const lobbyToLeave = lobbies.get(peer.lobbyId);
  lobbyToLeave?.remove(peer);
  if (lobbyToLeave?.getPeerId(peer) === Lobby.HOST_ID) {
    log("host left lobby, closing...", lobbyToLeave.id);
    lobbies.delete(lobbyToLeave.id);
  }
}

function removeFromLobby(lobbyId: string, peerId: number) {
  const lobby = lobbies.get(lobbyId);
  const peerToRemove = lobby?.getPeer(peerId);
  if (peerToRemove?.id == Lobby.HOST_ID) {
    logError("Cannot remove host!");
    return;
  }

  if (peerToRemove) {
    lobby?.remove(peerToRemove);
  } else {
    log(`Peer with id: ${peerId} not found in lobby!`);
  }
}

function parseMessage(peer: Peer, message: string) {
  const { type, id, data } = JSON.parse(message) as Message;

  switch (type) {
    case MessageType.JOIN_LOBBY:
      joinLobby(peer, data);
      break;
    case MessageType.LEAVE_LOBBY:
      leaveLobby(peer);
      break;
    case MessageType.REMOVE_PLAYER:
      removeFromLobby(data, id);
      break;
    case MessageType.OFFER:
    case MessageType.ANSWER:
    case MessageType.CANDIDATE:
      {
        const lobby = lobbies.get(peer.lobbyId);
        if (lobby) {
          const destId = id === 1 ? lobby.host : id;
          const destPeer = lobby.getPeer(destId);
          destPeer?.sendMessage(
            createMessage(type, lobby.getPeerId(peer), data)
          );
        }
      }
      break;
    default:
      logError("Error: Invalid message type");
  }
}

wss.on("connection", function (ws: WebSocketClient) {
  const peer = new Peer(ws);
  log("client connected: ", peer.id);

  ws.on("message", function (message: string) {
    parseMessage(peer, message);
  });

  ws.on("close", () => {
    log(`Client ${peer.id} disconnected, cleaning up...`);

    leaveLobby(peer);
    peer.close();
  });

  ws.on("error", (error) => {
    console.error(error);
  });

  ws.send(createMessage(MessageType.CONNECTED, peer.id));
});

wss.on("error", function (e) {
  console.error("The server encountered an error!", e);
});

console.log("Server running on port:", PORT);
