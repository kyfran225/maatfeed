import { getJson } from "./httpClient";

export type UpdatePreferencesInput = {
  interests?: Record<string, number>;
  preferences?: {
    contentMix?: {
      viral: number;
      educational: number;
      deep: number;
    };
  };
  avatar?: string;
  profileImageUrl?: string;
};

export type UpdateAvatarInput = {
  avatar?: string;
  profileImageUrl?: string;
};

export type Profile = {
  id: string;
  userId: string;
  displayName: string;
  avatar?: string | null;
  profileImageUrl?: string | null;
  interests: Record<string, number>;
  preferences: {
    contentMix?: {
      viral: number;
      educational: number;
      deep: number;
    };
  };
  savedContentIds: string[];
  createdAt: string;
  updatedAt: string;
};

export async function updatePreferences(input: UpdatePreferencesInput): Promise<void> {
  await getJson("/api/profile/preferences", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export async function completeOnboarding(): Promise<void> {
  await getJson("/api/profile/complete-onboarding", {
    method: "POST"
  });
}

export async function getProfile(): Promise<Profile> {
  const result = await getJson<{ data: Profile }>("/api/profile");
  return result.data;
}

export async function getSavedContent(): Promise<unknown[]> {
  const result = await getJson<{ data: unknown[] }>("/api/profile/saved");
  return result.data;
}

export async function updateAvatar(input: UpdateAvatarInput): Promise<Profile> {
  const result = await getJson<{ data: Profile }>("/api/profile/avatar", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
  return result.data;
}
