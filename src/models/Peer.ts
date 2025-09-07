import { customAlphabet } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import { WebSocketClient } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

const nanoid = customAlphabet("123456789", 5);

export default class Peer {
  id: number;
  socket: WebSocketClient;
  lobbyId = "";

  constructor(socket: WebSocketClient) {
    this.id = parseInt(nanoid());
    this.socket = socket;
  }

  sendMessage(msg: string) {
    this.socket.send(msg);
  }

  close() {
    this.socket.close(0);
  }

  get isClosed() {
    return this.socket.isClosed;
  }
}
