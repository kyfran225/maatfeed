import mongoose, { model, Schema } from "mongoose";

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

export type NotificationChannel = "in_app" | "email" | "push";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export interface INotification {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  status: NotificationStatus;
  data?: {
    contentId?: string;
    commentId?: string;
    userId?: string;
    url?: string;
    actionText?: string;
    [key: string]: unknown;
  };
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        "email_verified",
        "welcome",
        "content_published",
        "comment_reply",
        "mention_received",
        "like_received",
        "save_received",
        "trending_content",
        "weekly_digest",
        "security_alert",
        "password_changed",
        "trust_level_upgraded",
        "system_announcement"
      ],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    channels: {
      type: [String],
      enum: ["in_app", "email", "push"],
      default: ["in_app"]
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal"
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "failed"],
      default: "pending",
      index: true
    },
    data: {
      type: Schema.Types.Mixed,
      default: {}
    },
    sentAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    readAt: {
      type: Date,
      default: null
    },
    failedAt: {
      type: Date,
      default: null
    },
    failureReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient querying
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 }); // User notifications with status
notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 }); // Unread notifications
notificationSchema.index({ type: 1, status: 1, createdAt: -1 }); // Notifications by type
notificationSchema.index({ status: 1, priority: 1, createdAt: -1 }); // Pending notifications by priority
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

export const NotificationModel =
  mongoose.models.Notification ||
  model<INotification>("Notification", notificationSchema);

// Notification templates
export const NotificationTemplates: Record<
  NotificationType,
  { title: string; message: string; defaultChannels: NotificationChannel[]; priority: NotificationPriority }
> = {
  email_verified: {
    title: "✅ Email vérifié",
    message: "Votre adresse email a été vérifiée avec succès. Vous avez maintenant accès à toutes les fonctionnalités.",
    defaultChannels: ["in_app", "email"],
    priority: "normal"
  },
  welcome: {
    title: "🎉 Bienvenue sur MAAT FEED",
    message: "Merci de rejoindre notre communauté dédiée à la sagesse Kemet et à la philosophie africaine.",
    defaultChannels: ["in_app", "email"],
    priority: "normal"
  },
  content_published: {
    title: "📝 Nouveau contenu disponible",
    message: "Du nouveau contenu correspondant à vos intérêts vient d'être publié.",
    defaultChannels: ["in_app"],
    priority: "low"
  },
  comment_reply: {
    title: "💬 Nouvelle réponse",
    message: "Quelqu'un a répondu à votre commentaire.",
    defaultChannels: ["in_app", "email"],
    priority: "normal"
  },
  mention_received: {
    title: "🔔 Nouvelle mention",
    message: "Quelqu'un vous a mentionné dans un débat.",
    defaultChannels: ["in_app", "push"],
    priority: "normal"
  },
  like_received: {
    title: "❤️ Nouveau like",
    message: "Quelqu'un a aimé votre contribution.",
    defaultChannels: ["in_app"],
    priority: "low"
  },
  save_received: {
    title: "🔖 Contenu sauvegardé",
    message: "Quelqu'un a sauvegardé votre contenu.",
    defaultChannels: ["in_app"],
    priority: "low"
  },
  trending_content: {
    title: "🔥 Contenu tendance",
    message: "Un contenu que vous pourriez aimer est en tendance actuellement.",
    defaultChannels: ["in_app"],
    priority: "low"
  },
  weekly_digest: {
    title: "📊 Résumé de la semaine",
    message: "Voici votre résumé hebdomadaire des activités et contenus populaires.",
    defaultChannels: ["email"],
    priority: "low"
  },
  security_alert: {
    title: "🛡️ Alerte de sécurité",
    message: "Une activité suspecte a été détectée sur votre compte.",
    defaultChannels: ["in_app", "email", "push"],
    priority: "urgent"
  },
  password_changed: {
    title: "🔐 Mot de passe modifié",
    message: "Votre mot de passe a été changé avec succès.",
    defaultChannels: ["in_app", "email"],
    priority: "high"
  },
  trust_level_upgraded: {
    title: "🏆 Niveau de confiance augmenté",
    message: "Félicitations ! Vous avez atteint un nouveau niveau de confiance sur la plateforme.",
    defaultChannels: ["in_app", "email"],
    priority: "normal"
  },
  system_announcement: {
    title: "📢 Annonce système",
    message: "Une mise à jour importante concernant la plateforme.",
    defaultChannels: ["in_app", "email"],
    priority: "high"
  }
};
