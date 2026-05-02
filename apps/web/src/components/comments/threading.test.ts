import { describe, expect, it } from "vitest";
import type { Comment } from "../../services/commentService";
import { buildCommentThreads, orderCommentsForDisplay } from "./threading";

function makeComment(overrides: Partial<Comment> & Pick<Comment, "id" | "body" | "createdAt">): Comment {
  return {
    id: overrides.id,
    contentId: "content-1",
    userId: overrides.userId || "user-1",
    body: overrides.body,
    debateScore: overrides.debateScore || 0,
    likeCount: overrides.likeCount || 0,
    replyCount: overrides.replyCount || 0,
    aiGenerated: false,
    createdAt: overrides.createdAt,
    updatedAt: overrides.updatedAt || overrides.createdAt,
    authorName: overrides.authorName || overrides.id,
    authorAvatar: overrides.authorAvatar,
    replies: overrides.replies || [],
    inReplyToCommentId: overrides.inReplyToCommentId || null,
    replyMode: overrides.replyMode,
    parentAuthorName: overrides.parentAuthorName || null,
  };
}

describe("orderCommentsForDisplay", () => {
  it("keeps flat replies attached to their parent in relevant mode", () => {
    const parent = makeComment({
      id: "parent",
      body: "Parent",
      createdAt: "2026-04-20T10:00:00.000Z",
      debateScore: 50,
      likeCount: 6,
    });
    const flatReply = makeComment({
      id: "flat-reply",
      body: "Flat reply",
      createdAt: "2026-04-25T10:00:00.000Z",
      debateScore: 5,
      likeCount: 1,
      replyMode: "flat",
      inReplyToCommentId: "parent",
      parentAuthorName: "Parent Author",
    });
    const otherRoot = makeComment({
      id: "other-root",
      body: "Other",
      createdAt: "2026-04-24T10:00:00.000Z",
      debateScore: 30,
      likeCount: 2,
    });

    const ordered = orderCommentsForDisplay([flatReply, otherRoot, parent], "relevant");
    const threads = buildCommentThreads([flatReply, otherRoot, parent], "relevant");

    expect(ordered.map((comment) => comment.id)).toEqual(["parent", "other-root"]);
    expect(threads[0]?.flatReplies.map((reply) => reply.comment.id)).toEqual(["flat-reply"]);
  });

  it("moves a discussion up in newest mode when a flat reply is recent", () => {
    const olderRoot = makeComment({
      id: "older-root",
      body: "Older root",
      createdAt: "2026-04-20T10:00:00.000Z",
      updatedAt: "2026-04-20T10:00:00.000Z",
    });
    const recentFlatReply = makeComment({
      id: "recent-flat-reply",
      body: "Recent flat reply",
      createdAt: "2026-04-26T10:00:00.000Z",
      updatedAt: "2026-04-26T10:00:00.000Z",
      replyMode: "flat",
      inReplyToCommentId: "older-root",
    });
    const newerStandaloneRoot = makeComment({
      id: "newer-standalone-root",
      body: "Newer standalone root",
      createdAt: "2026-04-25T10:00:00.000Z",
      updatedAt: "2026-04-25T10:00:00.000Z",
    });

    const ordered = orderCommentsForDisplay(
      [olderRoot, recentFlatReply, newerStandaloneRoot],
      "newest"
    );

    expect(ordered.map((comment) => comment.id)).toEqual(["older-root", "newer-standalone-root"]);
  });

  it("uses group popularity for popular mode", () => {
    const rootA = makeComment({
      id: "root-a",
      body: "Root A",
      createdAt: "2026-04-20T10:00:00.000Z",
      likeCount: 4,
    });
    const flatReplyA = makeComment({
      id: "flat-a",
      body: "Flat A",
      createdAt: "2026-04-21T10:00:00.000Z",
      likeCount: 6,
      replyMode: "flat",
      inReplyToCommentId: "root-a",
    });
    const rootB = makeComment({
      id: "root-b",
      body: "Root B",
      createdAt: "2026-04-25T10:00:00.000Z",
      likeCount: 7,
    });

    const ordered = orderCommentsForDisplay([rootA, flatReplyA, rootB], "popular");

    expect(ordered.map((comment) => comment.id)).toEqual(["root-a", "root-b"]);
  });

  it("uses discussion intensity first in debated mode", () => {
    const heavilyDebated = makeComment({
      id: "heavily-debated",
      body: "Heavily debated",
      createdAt: "2026-04-20T10:00:00.000Z",
      replyCount: 5,
    });
    const lessDebated = makeComment({
      id: "less-debated",
      body: "Less debated",
      createdAt: "2026-04-25T10:00:00.000Z",
      replyCount: 2,
    });

    const ordered = orderCommentsForDisplay([lessDebated, heavilyDebated], "debated");

    expect(ordered.map((comment) => comment.id)).toEqual(["heavily-debated", "less-debated"]);
  });

  it("shows orphan flat replies as standalone entries", () => {
    const orphan = makeComment({
      id: "orphan",
      body: "Orphan flat reply",
      createdAt: "2026-04-25T10:00:00.000Z",
      replyMode: "flat",
      inReplyToCommentId: "missing-parent",
      parentAuthorName: "Missing",
    });
    const root = makeComment({
      id: "root",
      body: "Root",
      createdAt: "2026-04-24T10:00:00.000Z",
      debateScore: 20,
    });

    const ordered = orderCommentsForDisplay([orphan, root], "newest");

    expect(ordered.map((comment) => comment.id)).toEqual(["orphan", "root"]);
  });

  it("keeps flat replies to flat replies nested under the intermediate reply", () => {
    const parent = makeComment({
      id: "parent",
      body: "Parent",
      createdAt: "2026-04-20T10:00:00.000Z",
    });
    const child = makeComment({
      id: "child",
      body: "Child",
      createdAt: "2026-04-21T10:00:00.000Z",
      replyMode: "flat",
      inReplyToCommentId: "parent",
    });
    const grandchild = makeComment({
      id: "grandchild",
      body: "Grandchild",
      createdAt: "2026-04-22T10:00:00.000Z",
      replyMode: "flat",
      inReplyToCommentId: "child",
    });

    const threads = buildCommentThreads([parent, child, grandchild], "newest");

    expect(threads).toHaveLength(1);
    expect(threads[0]?.comment.id).toBe("parent");
    expect(threads[0]?.flatReplies[0]?.comment.id).toBe("child");
    expect(threads[0]?.flatReplies[0]?.flatReplies[0]?.comment.id).toBe("grandchild");
  });
});
