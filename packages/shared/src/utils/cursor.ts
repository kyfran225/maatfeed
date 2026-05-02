type BufferLike = {
  from(input: string, encoding: "utf-8"): {
    toString(encoding: "base64url"): string;
  };
  from(input: string, encoding: "base64url"): {
    toString(encoding: "utf-8"): string;
  };
};

function getBuffer(): BufferLike {
  const maybeBuffer = (globalThis as { Buffer?: BufferLike }).Buffer;

  if (!maybeBuffer) {
    throw new Error("Cursor encoding requires Buffer support in the current runtime.");
  }

  return maybeBuffer;
}

export function encodeCursor(payload: Record<string, string | number>): string {
  return getBuffer().from(JSON.stringify(payload), "utf-8").toString("base64url");
}

export function decodeCursor<T>(cursor: string): T {
  return JSON.parse(getBuffer().from(cursor, "base64url").toString("utf-8")) as T;
}
