import { afterEach, describe, expect, it, vi } from "vitest";
import { requestAICommentReply } from "./commentService";

describe("requestAICommentReply", () => {
  const originalFetch = global.fetch;
  const originalLocalStorage = globalThis.localStorage;

  afterEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: originalFetch
    });

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage
    });
  });

  it("sends the AI interaction context to the backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            responseGenerated: true,
            commentId: "ai-comment-1"
          }
        }),
        { status: 200 }
      )
    );

    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock
    });

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      }
    });

    await requestAICommentReply("comment-1", {
      recentCommentCount: 7,
      discussionActive: true,
      lastAIResponses: [
        {
          personalityId: "maat_sage",
          timestamp: 1714200000000
        }
      ]
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/ai/v2/comments/comment-1/respond");
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({
        recentCommentCount: 7,
        discussionActive: true,
        lastAIResponses: [
          {
            personalityId: "maat_sage",
            timestamp: 1714200000000
          }
        ]
      })
    );
  });
});
