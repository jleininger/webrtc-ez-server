import { MessageType } from "../types/messageType.ts";

export type Message = {
  type: MessageType;
  id: number;
  data: string;
};

export function createMessage(type: MessageType, id: number, data = "") {
  return JSON.stringify({ type, id, data });
}
