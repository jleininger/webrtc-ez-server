import { expect } from "jsr:@std/expect";
import { WebSocketClient } from "https://deno.land/x/websocket@v0.1.4/mod.ts";
import Peer from "./Peer.ts";

Deno.test("Instantiating a new Peer creates a unique id", () => {
    const peer = new Peer({} as WebSocketClient);
    expect(peer.id).toBeDefined();
    expect(typeof peer.id).toBe("number");
})