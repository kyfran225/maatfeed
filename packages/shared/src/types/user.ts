export type UserInterestVector = Record<string, number>;

export type ContentMixConfig = {
  viral: number;
  educational: number;
  deep: number;
};

export type TrustLevel = "visitor" | "verified" | "contributor" | "trusted";
export type UserRole = "user" | "admin";

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  role?: UserRole;
  avatar?: string | null;
  profileImageUrl?: string | null;
  interests: UserInterestVector;
  savedContentIds: string[];
  onboardingCompleted: boolean;
  isEmailVerified?: boolean;
  trustLevel?: TrustLevel;
  preferences?: {
    contentMix?: ContentMixConfig;
  };
};
