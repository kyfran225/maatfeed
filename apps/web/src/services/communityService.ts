import { getJson, postJson } from "./httpClient";

export interface DebateThread {
  id: string;
  contentId: string;
  title: string;
  description: string;
  isActive: boolean;
  debateScore: number;
  participantCount: number;
  topComments: Array<{
    commentId: string;
    score: number;
    position: number;
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TopDebate {
  id: string;
  contentId: string;
  title: string;
  description: string;
  debateScore: number;
  participantCount: number;
  topComments: Array<{
    commentId: string;
    score: number;
    position: number;
  }>;
  tags: string[];
  createdAt: string;
  lastActivity: string;
}

export async function getTopDebates(limit: number = 20): Promise<TopDebate[]> {
  const timestamp = Date.now();
  const response = await getJson<{ success: boolean; data: DebateThread[] }>(`/api/community/debates?limit=${limit}&_t=${timestamp}`);
  
  if (!response.success || !response.data) {
    return [];
  }

  return response.data.map((debate: DebateThread): TopDebate => ({
    id: debate.id,
    contentId: debate.contentId,
    title: debate.title,
    description: debate.description,
    debateScore: debate.debateScore,
    participantCount: debate.participantCount,
    topComments: debate.topComments,
    tags: debate.tags,
    createdAt: debate.createdAt,
    lastActivity: formatLastActivity(debate.updatedAt)
  }));
}

export async function getDebateThread(contentId: string): Promise<DebateThread | null> {
  try {
    const response = await getJson<{ success: boolean; data: DebateThread }>(`/api/community/debates/${contentId}`);
    
    if (!response.success || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching debate thread:", error);
    return null;
  }
}

export async function createDebateThread(data: {
  contentId?: string;
  title?: string;
  description?: string;
  tags?: string[];
}): Promise<DebateThread | null> {
  try {
    const result = await postJson<{ success: boolean; data: DebateThread }>('/api/community/debates', data);
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error creating debate thread:', error);
    return null;
  }
}

function formatLastActivity(updatedAt: string): string {
  const now = new Date();
  const updated = new Date(updatedAt);
  const diffMs = now.getTime() - updated.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}
