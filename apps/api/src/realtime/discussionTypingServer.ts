import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, WebSocket, type RawData } from "ws";
import { ProfileModel } from "../models/Profile.js";
import { verifyAccessToken } from "../utils/token.js";

type ConnectionIdentity = {
  userId: string | null;
  role: string | null;
};

type SocketState = {
  userId: string | null;
  role: string | null;
  displayName: string | null;
  avatar: string | null;
  profileImageUrl: string | null;
  contentId: string | null;
  isAlive: boolean;
};

type JoinMessage = {
  type: "join";
  contentId: string;
};

type TypingMessage = {
  type: "typing";
  contentId: string;
  isTyping: boolean;
};

type ClientMessage = JoinMessage | TypingMessage;

type ServerMessage =
  | {
      type: "connected";
    }
  | {
      type: "joined";
      contentId: string;
    }
  | {
      type: "typing";
      contentId: string;
      isTyping: boolean;
      participant: {
        userId: string;
        displayName: string;
        avatar: string | null;
        profileImageUrl: string | null;
      };
    };

type TypingRequest = IncomingMessage & {
  discussionTypingIdentity?: ConnectionIdentity;
};

const PING_INTERVAL_MS = 30_000;
const socketStates = new Map<WebSocket, SocketState>();
const rooms = new Map<string, Set<WebSocket>>();

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function safeSend(socket: WebSocket, message: ServerMessage) {
  if (socket.readyState !== socket.OPEN) {
    return;
  }

  socket.send(JSON.stringify(message));
}

function getSocketParticipant(state: SocketState) {
  if (!state.userId) {
    return null;
  }

  return {
    userId: state.userId,
    displayName: state.displayName || "Membre",
    avatar: state.avatar,
    profileImageUrl: state.profileImageUrl
  };
}

function broadcastToRoom(contentId: string, message: ServerMessage, exclude?: WebSocket) {
  const room = rooms.get(contentId);
  if (!room) {
    return;
  }

  for (const socket of room) {
    if (socket === exclude) {
      continue;
    }

    safeSend(socket, message);
  }
}

function leaveRoom(socket: WebSocket, options?: { broadcastStop?: boolean }) {
  const state = socketStates.get(socket);
  if (!state?.contentId) {
    return;
  }

  const previousContentId = state.contentId;
  const participant = getSocketParticipant(state);

  const room = rooms.get(previousContentId);
  if (room) {
    room.delete(socket);
    if (room.size === 0) {
      rooms.delete(previousContentId);
    }
  }

  state.contentId = null;

  if (options?.broadcastStop !== false && participant) {
    broadcastToRoom(
      previousContentId,
      {
        type: "typing",
        contentId: previousContentId,
        isTyping: false,
        participant
      },
      socket
    );
  }
}

function joinRoom(socket: WebSocket, contentId: string) {
  const normalizedContentId = contentId.trim();
  if (!normalizedContentId) {
    return;
  }

  const state = socketStates.get(socket);
  if (!state) {
    return;
  }

  if (state.contentId === normalizedContentId) {
    safeSend(socket, { type: "joined", contentId: normalizedContentId });
    return;
  }

  leaveRoom(socket);

  const room = rooms.get(normalizedContentId) ?? new Set<WebSocket>();
  room.add(socket);
  rooms.set(normalizedContentId, room);
  state.contentId = normalizedContentId;

  safeSend(socket, { type: "joined", contentId: normalizedContentId });
}

function parseClientMessage(raw: RawData): ClientMessage | null {
  try {
    const payload = JSON.parse(raw.toString()) as Partial<ClientMessage>;

    if (payload.type === "join" && isNonEmptyString(payload.contentId)) {
      return {
        type: "join",
        contentId: payload.contentId
      };
    }

    if (
      payload.type === "typing" &&
      isNonEmptyString(payload.contentId) &&
      typeof payload.isTyping === "boolean"
    ) {
      return {
        type: "typing",
        contentId: payload.contentId,
        isTyping: payload.isTyping
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function hydrateState(state: SocketState) {
  if (!state.userId) {
    return;
  }

  const profile = await ProfileModel.findOne({ userId: state.userId })
    .select("displayName avatar profileImageUrl")
    .lean<{ displayName?: string; avatar?: string | null; profileImageUrl?: string | null } | null>();

  state.displayName = profile?.displayName || "Membre";
  state.avatar = profile?.avatar || null;
  state.profileImageUrl = profile?.profileImageUrl || null;
}

export function createDiscussionTypingServer() {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", async (socket: WebSocket, request: IncomingMessage) => {
    const identity = (request as TypingRequest).discussionTypingIdentity ?? {
      userId: null,
      role: null
    };

    const state: SocketState = {
      userId: identity.userId,
      role: identity.role,
      displayName: null,
      avatar: null,
      profileImageUrl: null,
      contentId: null,
      isAlive: true
    };

    socketStates.set(socket, state);
    void hydrateState(state);

    socket.on("pong", () => {
      const currentState = socketStates.get(socket);
      if (currentState) {
        currentState.isAlive = true;
      }
    });

    socket.on("message", (raw: RawData) => {
      const message = parseClientMessage(raw);
      if (!message) {
        return;
      }

      if (message.type === "join") {
        joinRoom(socket, message.contentId);
        return;
      }

      const currentState = socketStates.get(socket);
      if (!currentState?.userId) {
        return;
      }

      if (currentState.contentId !== message.contentId) {
        joinRoom(socket, message.contentId);
      }

      const participant = getSocketParticipant(currentState);
      if (!participant || !currentState.contentId) {
        return;
      }

      broadcastToRoom(
        currentState.contentId,
        {
          type: "typing",
          contentId: currentState.contentId,
          isTyping: message.isTyping,
          participant
        },
        socket
      );
    });

    socket.on("close", () => {
      leaveRoom(socket);
      socketStates.delete(socket);
    });

    safeSend(socket, { type: "connected" });
  });

  const heartbeat = setInterval(() => {
    for (const socket of wss.clients) {
      const state = socketStates.get(socket);
      if (!state) {
        continue;
      }

      if (!state.isAlive) {
        socket.terminate();
        continue;
      }

      state.isAlive = false;
      socket.ping();
    }
  }, PING_INTERVAL_MS);

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  return {
    server: wss,
    handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer) {
      const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

      if (url.pathname !== "/ws/discussions/typing") {
        return false;
      }

      const token = url.searchParams.get("token");

      if (token) {
        try {
          const payload = verifyAccessToken(token);
          (request as TypingRequest).discussionTypingIdentity = {
            userId: payload.sub,
            role: payload.role
          };
        } catch {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return true;
        }
      } else {
        (request as TypingRequest).discussionTypingIdentity = {
          userId: null,
          role: null
        };
      }

      wss.handleUpgrade(request, socket, head, (websocket: WebSocket) => {
        wss.emit("connection", websocket, request);
      });

      return true;
    }
  };
}
