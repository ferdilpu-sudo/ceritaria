export interface CommunityComment {
  id: string;
  episode_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  like_count: number;
  created_at: string;
}

export interface CommunityProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}
