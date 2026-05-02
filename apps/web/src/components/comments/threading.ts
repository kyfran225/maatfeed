import type { Comment } from "../../services/commentService";

export type ThreadSortOption = "relevant" | "newest" | "popular" | "debated";

const ROOT_RECENCY_WINDOW_MS = 1000 * 60 * 60 * 24 * 7;

export interface ThreadedComment {
  comment: Comment;
  flatReplies: ThreadedComment[];
  visibleReplyCount: number;
  totalReplyCount: number;
  lastActivityAt: number;
  totalLikes: number;
  relevanceScore: number;
}

function getCommentId(comment: Comment): string {
  return comment._id || comment.id;
}

function toTimestamp(value: string): number {
  return new Date(value).getTime();
}

function compareNumbers(a: number, b: number): number {
  if (a !== b) {
    return b - a;
  }

  return 0;
}

function compareDatesDesc(a: string, b: string): number {
  return toTimestamp(b) - toTimestamp(a);
}

function getRecencyBoost(lastActivityAt: number): number {
  const ageMs = Math.max(0, Date.now() - lastActivityAt);
  return Math.max(0, 1 - ageMs / ROOT_RECENCY_WINDOW_MS) * 2;
}

function getGroupRelevanceScore(
  root: Comment,
  totalLikes: number,
  totalReplyCount: number,
  lastActivityAt: number
): number {
  // Product intent:
  // - relevance is led by the value of the root contribution
  // - likes matter more than reply volume
  // - recent activity helps, but should not overpower a weak root
  // - debate intensity adds a small boost only
  const rootAgeMs = Math.max(0, Date.now() - toTimestamp(root.createdAt));
  const rootFreshnessPenalty = Math.min(rootAgeMs / ROOT_RECENCY_WINDOW_MS, 1) * 0.75;

  return (
    (root.debateScore || 0) * 2.2 +
    totalLikes * 1.35 +
    totalReplyCount * 0.35 +
    getRecencyBoost(lastActivityAt) -
    rootFreshnessPenalty
  );
}

function sortFlatReplies(replies: ThreadedComment[]): ThreadedComment[] {
  return [...replies].sort((a, b) => toTimestamp(a.comment.createdAt) - toTimestamp(b.comment.createdAt));
}

function countFlatReplyDescendants(replies: ThreadedComment[]): number {
  return replies.reduce((sum, reply) => sum + 1 + countFlatReplyDescendants(reply.flatReplies), 0);
}

function createThreadNode(root: Comment, flatReplies: ThreadedComment[]): ThreadedComment {
  const nestedReplies = root.replies || [];
  const totalFlatReplyCount = countFlatReplyDescendants(flatReplies);
  const lastActivityAt = Math.max(
    toTimestamp(root.updatedAt || root.createdAt),
    ...flatReplies.map((reply) => reply.lastActivityAt),
    ...nestedReplies.map((reply) => toTimestamp(reply.updatedAt || reply.createdAt))
  );
  const totalLikes =
    (root.likeCount || 0) +
    flatReplies.reduce((sum, reply) => sum + reply.totalLikes, 0) +
    nestedReplies.reduce((sum, reply) => sum + (reply.likeCount || 0), 0);
  const visibleNestedReplyCount = nestedReplies.length;
  const visibleReplyCount = Math.max(root.replyCount || 0, flatReplies.length + visibleNestedReplyCount);
  const totalReplyCount = Math.max(root.replyCount || 0, totalFlatReplyCount + visibleNestedReplyCount);

  return {
    comment: root,
    flatReplies,
    visibleReplyCount,
    totalReplyCount,
    lastActivityAt,
    totalLikes,
    relevanceScore: getGroupRelevanceScore(root, totalLikes, totalReplyCount, lastActivityAt),
  };
}

function compareThreadGroups(a: ThreadedComment, b: ThreadedComment, sortBy: ThreadSortOption): number {
  switch (sortBy) {
    case "newest":
      return (
        compareNumbers(a.lastActivityAt, b.lastActivityAt) ||
        compareDatesDesc(a.comment.createdAt, b.comment.createdAt)
      );
    case "popular":
      return (
        compareNumbers(a.totalLikes, b.totalLikes) ||
        compareNumbers(a.comment.debateScore || 0, b.comment.debateScore || 0) ||
        compareNumbers(a.totalReplyCount, b.totalReplyCount) ||
        compareNumbers(a.lastActivityAt, b.lastActivityAt)
      );
    case "debated":
      return (
        compareNumbers(a.totalReplyCount, b.totalReplyCount) ||
        compareNumbers(a.lastActivityAt, b.lastActivityAt) ||
        compareNumbers(a.comment.debateScore || 0, b.comment.debateScore || 0)
      );
    case "relevant":
    default:
      return (
        compareNumbers(a.relevanceScore, b.relevanceScore) ||
        compareNumbers(a.comment.debateScore || 0, b.comment.debateScore || 0) ||
        compareNumbers(a.totalLikes, b.totalLikes) ||
        compareNumbers(a.lastActivityAt, b.lastActivityAt)
      );
  }
}

function isFlatReply(comment: Comment): boolean {
  return comment.replyMode === "flat" && Boolean(comment.inReplyToCommentId);
}

export function buildCommentThreads(
  comments: Comment[],
  sortBy: ThreadSortOption
): ThreadedComment[] {
  const byId = new Map<string, Comment>();
  for (const comment of comments) {
    byId.set(getCommentId(comment), comment);
  }

  const flatRepliesByParent = new Map<string, Comment[]>();
  const rootComments: Comment[] = [];

  for (const comment of comments) {
    if (!isFlatReply(comment)) {
      rootComments.push(comment);
      continue;
    }

    const parentId = comment.inReplyToCommentId;
    if (!parentId || !byId.has(parentId)) {
      rootComments.push(comment);
      continue;
    }

    const siblings = flatRepliesByParent.get(parentId) || [];
    siblings.push(comment);
    flatRepliesByParent.set(parentId, siblings);
  }

  const buildNode = (comment: Comment): ThreadedComment => {
    const childReplies = sortFlatReplies(
      (flatRepliesByParent.get(getCommentId(comment)) || []).map(buildNode)
    );
    return createThreadNode(comment, childReplies);
  };

  return rootComments
    .map(buildNode)
    .sort((a, b) => compareThreadGroups(a, b, sortBy));
}

export function orderCommentsForDisplay(
  comments: Comment[],
  sortBy: ThreadSortOption
): Comment[] {
  return buildCommentThreads(comments, sortBy).map((thread) => thread.comment);
}

export function countThreadReplies(thread: ThreadedComment): number {
  return thread.totalReplyCount;
}

export function countVisibleReplies(thread: ThreadedComment): number {
  return thread.visibleReplyCount;
}

export function countAllThreadReplies(threads: ThreadedComment[]): number {
  return threads.reduce((sum, thread) => sum + thread.totalReplyCount, 0);
}

export function countRootThreads(threads: ThreadedComment[]): number {
  return threads.length;
}

export function flattenThreadIds(threads: ThreadedComment[]): string[] {
  const ids: string[] = [];

  for (const thread of threads) {
    ids.push(thread.comment.id);
  }

  return ids;
}
