import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postJson } from "./httpClient";

type StorageMap = Record<string, string>;

function createLocalStorage(seed: StorageMap = {}) {
  const store = new Map(Object.entries(seed));

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    })
  };
}

describe("httpClient", () => {
  const originalFetch = global.fetch;
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    const localStorageMock = createLocalStorage({
      "maat.accessToken": "expired-access-token",
      "maat.refreshToken": "valid-refresh-token"
    });

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: localStorageMock
    });

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          pathname: "/debate/abc",
          search: "",
          hash: "",
          assign: vi.fn()
        }
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: originalFetch
    });

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow
    });

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage
    });
  });

  it("refreshes the session and retries the request before redirecting on 401", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "expired" }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        tokens: {
          accessToken: "fresh-access-token",
          refreshToken: "fresh-refresh-token"
        }
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { id: "reply-1" }
      }), { status: 200 }));

    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock
    });

    const result = await postJson<{ success: boolean; data: { id: string } }>(
      "/api/comments/comment-1/replies",
      { body: "Bonjour" }
    );

    expect(result.data.id).toBe("reply-1");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/auth/refresh");
    expect(fetchMock.mock.calls[2]?.[1]?.headers instanceof Headers).toBe(true);
    expect((fetchMock.mock.calls[2]?.[1]?.headers as Headers).get("Authorization")).toBe("Bearer fresh-access-token");
    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith("maat.accessToken", "fresh-access-token");
    expect(globalThis.window.location.assign).not.toHaveBeenCalled();
  });
});
