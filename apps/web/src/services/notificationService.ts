import { getJson, postJson } from "./httpClient";

export type NotificationType =
  | "email_verified"
  | "welcome"
  | "content_published"
  | "comment_reply"
  | "mention_received"
  | "like_received"
  | "save_received"
  | "trending_content"
  | "weekly_digest"
  | "security_alert"
  | "password_changed"
  | "trust_level_upgraded"
  | "system_announcement";

export interface NotificationItem {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  createdAt: string;
  readAt?: string | null;
  data?: {
    contentId?: string;
    commentId?: string;
    replyId?: string;
    parentReplyId?: string;
    userId?: string;
    url?: string;
    [key: string]: unknown;
  };
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export async function getNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<NotificationsResponse> {
  const params = new URLSearchParams();
  if (options?.unreadOnly) params.set("unread", "true");
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  return getJson<NotificationsResponse>(`/api/notifications${query ? `?${query}` : ""}`);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await getJson<{ count: number }>("/api/notifications/unread-count");
  return response.count || 0;
}

export async function markNotificationAsRead(notificationId: string) {
  return postJson<{ success: boolean; notification: NotificationItem }>(`/api/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead() {
  return postJson<{ success: boolean }>("/api/notifications/mark-all-read");
}

export function getNotificationUrl(notification: NotificationItem): string {
  if (typeof notification.data?.url === "string" && notification.data.url.trim()) {
    return notification.data.url;
  }

  const contentId = typeof notification.data?.contentId === "string" ? notification.data.contentId : "";
  const replyId = typeof notification.data?.replyId === "string" ? notification.data.replyId : "";
  const commentId = typeof notification.data?.commentId === "string" ? notification.data.commentId : "";

  if (contentId && replyId) {
    return `/debate/${contentId}#reply-${replyId}`;
  }

  if (contentId && commentId) {
    return `/debate/${contentId}#comment-${commentId}`;
  }

  return "/notifications";
}

export function isNotificationUnread(notification: NotificationItem): boolean {
  return notification.status !== "read";
}
