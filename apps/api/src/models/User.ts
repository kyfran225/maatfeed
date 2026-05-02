import mongoose, { model, Schema } from "mongoose";

export type TrustLevel = "visitor" | "verified" | "contributor" | "trusted";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  authProviders: string[];
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  trustLevel: TrustLevel;
  verificationToken?: string;
  verificationExpiresAt?: Date;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    authProviders: {
      type: [String],
      default: []
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerifiedAt: {
      type: Date,
      default: null
    },
    trustLevel: {
      type: String,
      enum: ["visitor", "verified", "contributor", "trusted"],
      default: "visitor"
    },
    verificationToken: {
      type: String,
      default: null
    },
    verificationExpiresAt: {
      type: Date,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ verificationToken: 1 });
userSchema.index({ trustLevel: 1, isEmailVerified: 1 });

export const UserModel = mongoose.models.User || model<IUser>("User", userSchema);
