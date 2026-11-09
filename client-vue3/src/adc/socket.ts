import { io } from "socket.io-client";
import { getCredentials } from "./auth";
import { readJSON, writeJSON } from "./storage";
import type { Path, ServerEvents } from "./types";

// adc-core broadcasts changes to rooms named after content paths:
// a folder type ("cahiers") gets folderCreated/Updated/Removed,
// a folder ("cahiers/mon-cahier") gets its own folder and file events.

const SESSION_KEY = "cahiers.socket_session";

const socket = io({
  autoConnect: false,
  // read at each (re)connection: the server only reads the token here
  auth: (cb) => {
    const { token, token_path } = getCredentials();
    cb({ sessionID: readJSON<string>(SESSION_KEY), token, token_path });
  },
});

socket.on("session", ({ sessionID }: { sessionID: string }) =>
  writeJSON(SESSION_KEY, sessionID)
);

// rooms are counted, so several components can watch the same path
const rooms = new Map<Path, number>();

socket.on("connect", () => {
  for (const room of rooms.keys()) socket.emit("joinRoom", { room });
});

export function connect() {
  socket.connect();
}

// to send new credentials (login, logout)
export function reconnect() {
  if (socket.connected) socket.disconnect().connect();
}

export function onConnectionChange(handler: (is_connected: boolean) => void) {
  const onConnect = () => handler(true);
  const onDisconnect = () => handler(false);
  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  return () => {
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
  };
}

export function joinRoom(room: Path) {
  const count = rooms.get(room) ?? 0;
  rooms.set(room, count + 1);
  if (count === 0 && socket.connected) socket.emit("joinRoom", { room });
}

export function leaveRoom(room: Path) {
  const count = rooms.get(room) ?? 0;
  if (count <= 1) {
    rooms.delete(room);
    if (socket.connected) socket.emit("leaveRoom", { room });
  } else rooms.set(room, count - 1);
}

export function onEvent<E extends keyof ServerEvents>(
  event: E,
  handler: (content: ServerEvents[E]) => void
) {
  socket.on(event as string, handler);
  return () => {
    socket.off(event as string, handler);
  };
}
