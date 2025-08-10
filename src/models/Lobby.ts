import { customAlphabet } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import { MessageType } from "../types/messageType.ts";
import { createMessage } from "../utils/createMessage.ts";
import Peer from "./Peer.ts";

export default class Lobby {
  static HOST_ID = 1;
  id: string;
  host: number;
  peers: Peer[];
  maxPeers: number;

  constructor(host: number, maxPeers: number = 8) {
    const nanoid = customAlphabet(
      "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
      5
    );
    this.id = nanoid();
    this.host = host;
    this.peers = [];
    this.maxPeers = maxPeers;
  }

  getPeerId(peer: Peer) {
    return this.host === peer.id ? Lobby.HOST_ID : peer.id;
  }

  getPeer(id: number) {
    return this.peers.find((p) => p.id === id);
  }

  join(peer: Peer) {
    if (this.peers.length >= this.maxPeers) {
      peer.sendMessage(
        createMessage(MessageType.ERROR, peer.id, "Lobby is full.")
      );
      return;
    }

    const assignedId = this.getPeerId(peer);
    peer.sendMessage(
      createMessage(MessageType.LOBBY_JOINED, assignedId, this.id)
    );
    this.peers.forEach((p) => {
      p.sendMessage(createMessage(MessageType.PEER_CONNECTED, assignedId));
      peer.sendMessage(
        createMessage(MessageType.PEER_CONNECTED, this.getPeerId(p))
      );
    });
    peer.lobbyId = this.id;
    this.peers.push(peer);
  }

  remove(peer: Peer) {
    const assignedId = this.getPeerId(peer);

    peer.lobbyId = "";
    this.peers = this.peers.filter((p) => p.id !== peer.id);
    this.peers.forEach((p) => {
      p.sendMessage(createMessage(MessageType.PEER_DISCONNECTED, assignedId));
    });
    peer.sendMessage(
      createMessage(MessageType.LOBBY_LEFT, assignedId, this.id)
    );
  }
}
