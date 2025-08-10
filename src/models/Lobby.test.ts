import { expect } from "jsr:@std/expect";
import { MessageType } from "../types/messageType.ts";
import { WebSocketClient } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

import Lobby from "./Lobby.ts";


// Mock Peer class
class MockPeer {
  id: number;
  lobbyId = "";
  sentMessages: unknown[];
  socket: WebSocketClient;
  constructor(id: number) {
    this.id = id;
    this.socket = {} as WebSocketClient; // Mock socket for testing
    this.sentMessages = [];
  }
  sendMessage(msg: unknown) {
    this.sentMessages.push(msg);
  }
  close() {}
}

Deno.test("Lobby constructor sets id, host, and empty peers", () => {
  const lobby = new Lobby(41);
  expect(typeof lobby.id).toBe("string");
  expect(lobby.id.length).toBe(5);
  expect(lobby.host).toBe(41);
  expect(lobby.peers.length).toBe(0);
});

Deno.test("Lobby.getPeerId returns HOST_ID for host", () => {
  const hostPeer = new MockPeer(41);
  const otherPeer = new MockPeer(182);
  const lobby = new Lobby(hostPeer.id);

  expect(lobby.getPeerId(hostPeer)).toBe(Lobby.HOST_ID);
  expect(lobby.getPeerId(otherPeer)).toBe(182);
});

Deno.test("Lobby.join adds peer, sets lobbyId, and sends messages", () => {
  const peer1 = new MockPeer(311);
  const peer2 = new MockPeer(41);
  const lobby = new Lobby(peer1.id);

  lobby.join(peer1);
  expect(lobby.peers.length).toBe(1);
  expect(peer1.lobbyId).toBe(lobby.id);

Deno.test("Lobby sends 'full' message when maxPeers is reached", () => {
  const maxPeers = 2;
  const lobby = new Lobby(1, maxPeers);
  
  const peer1 = new MockPeer(1);
  const peer2 = new MockPeer(2);
  const peer3 = new MockPeer(3);

  lobby.join(peer1);
  lobby.join(peer2);
  
  lobby.join(peer3);

  expect(peer3.sentMessages.length).toBe(1);
  expect(peer3.sentMessages[0]).toEqual({
    type: MessageType.ERROR,
    peerId: peer3.id,
    data: "Lobby is full."
  });
  
  expect(lobby.peers.length).toBe(maxPeers);
});

  lobby.join(peer2);
  expect(lobby.peers.length).toBe(2);
  expect(peer2.lobbyId).toBe(lobby.id);

  expect(peer1.sentMessages.length).toBeGreaterThan(0);
  expect(peer1.sentMessages[0]).toEqual(
    JSON.stringify({
      type: MessageType.LOBBY_JOINED,
      id: lobby.getPeerId(peer1),
      data: lobby.id,
    })
  );
  expect(peer2.sentMessages.length).toBeGreaterThan(0);
  expect(peer2.sentMessages[0]).toEqual(
    JSON.stringify({
      type: MessageType.LOBBY_JOINED,
      id: lobby.getPeerId(peer2),
      data: lobby.id,
    })
  );
});

Deno.test("Lobby.getPeer returns correct peer", () => {
  const peer1 = new MockPeer(182);
  const peer2 = new MockPeer(41);
  const lobby = new Lobby(peer1.id);

  lobby.join(peer1);
  lobby.join(peer2);

  expect(lobby.getPeer(182)).toBe(peer1);
  expect(lobby.getPeer(41)).toBe(peer2);
  expect(lobby.getPeer(999)).toBeUndefined();
});

Deno.test("Lobby.remove removes peer and sends messages", () => {
  const peer1 = new MockPeer(41);
  const peer2 = new MockPeer(182);
  const lobby = new Lobby(peer1.id);

  lobby.join(peer1);
  lobby.join(peer2);

  expect(lobby.peers.length).toBe(2);

  lobby.remove(peer2);

  expect(lobby.peers.length).toBe(1);
  expect(lobby.peers[0]).toBe(peer1);
  expect(peer2.lobbyId).toBe("");

  const leftMsg = peer2.sentMessages[2];
  expect(leftMsg).toEqual(
    JSON.stringify({
      type: MessageType.LOBBY_LEFT,
      id: peer2.id,
      data: lobby.id,
    })
  );
});
