export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type VideoProvider = "youtube" | "facebook";

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string; visitor_id: string; session_id: string; event_name: string; path: string;
          referrer_host: string | null; device_type: string; metadata: Json; created_at: string;
        };
        Insert: {
          id?: string; visitor_id: string; session_id: string; event_name: string; path: string;
          referrer_host?: string | null; device_type: string; metadata?: Json; created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
        Relationships: [];
      };
      community_profiles: {
        Row: { user_id: string; display_name: string; avatar_url: string | null; is_blocked: boolean; created_at: string; updated_at: string };
        Insert: { user_id: string; display_name: string; avatar_url?: string | null; is_blocked?: boolean; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["community_profiles"]["Insert"]>;
        Relationships: [];
      };
      episode_comments: {
        Row: {
          id: string; episode_id: string; user_id: string; parent_id: string | null; body: string;
          like_count: number; is_hidden: boolean; deleted_at: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; episode_id: string; user_id: string; parent_id?: string | null; body: string;
          like_count?: number; is_hidden?: boolean; deleted_at?: string | null; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["episode_comments"]["Insert"]>;
        Relationships: [];
      };
      comment_likes: {
        Row: { comment_id: string; user_id: string; created_at: string };
        Insert: { comment_id: string; user_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["comment_likes"]["Insert"]>;
        Relationships: [];
      };
      comment_reports: {
        Row: { id: string; comment_id: string; user_id: string; reason: string; created_at: string };
        Insert: { id?: string; comment_id: string; user_id: string; reason?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["comment_reports"]["Insert"]>;
        Relationships: [];
      };
      episode_reactions: {
        Row: { episode_id: string; user_id: string; reaction: string; created_at: string; updated_at: string };
        Insert: { episode_id: string; user_id: string; reaction: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["episode_reactions"]["Insert"]>;
        Relationships: [];
      };
      episode_polls: {
        Row: { id: string; episode_id: string; question: string; is_active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; episode_id: string; question: string; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["episode_polls"]["Insert"]>;
        Relationships: [];
      };
      episode_poll_options: {
        Row: { id: string; poll_id: string; label: string; sort_order: number; vote_count: number };
        Insert: { id?: string; poll_id: string; label: string; sort_order: number; vote_count?: number };
        Update: Partial<Database["public"]["Tables"]["episode_poll_options"]["Insert"]>;
        Relationships: [];
      };
      episode_poll_votes: {
        Row: { poll_id: string; option_id: string; user_id: string; created_at: string };
        Insert: { poll_id: string; option_id: string; user_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["episode_poll_votes"]["Insert"]>;
        Relationships: [];
      };
      series: {
        Row: {
          id: string; slug: string; title: string; short_synopsis: string | null; synopsis: string | null;
          genres: string[]; cover_url: string | null; hero_url: string | null; is_featured: boolean;
          is_published: boolean; published_at: string | null; seo_title: string | null; seo_description: string | null;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; slug: string; title: string; short_synopsis?: string | null; synopsis?: string | null;
          genres?: string[]; cover_url?: string | null; hero_url?: string | null; is_featured?: boolean;
          is_published?: boolean; published_at?: string | null; seo_title?: string | null; seo_description?: string | null;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["series"]["Insert"]>;
        Relationships: [];
      };
      episodes: {
        Row: {
          id: string; series_id: string; episode_number: number; slug: string; title: string;
          short_synopsis: string | null; recap: string | null; highlights: string[]; video_provider: VideoProvider;
          video_url: string; thumbnail_url: string | null; duration_seconds: number | null; is_published: boolean;
          published_at: string | null; seo_title: string | null; seo_description: string | null;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; series_id: string; episode_number: number; slug: string; title: string;
          short_synopsis?: string | null; recap?: string | null; highlights?: string[]; video_provider?: VideoProvider;
          video_url: string; thumbnail_url?: string | null; duration_seconds?: number | null; is_published?: boolean;
          published_at?: string | null; seo_title?: string | null; seo_description?: string | null;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["episodes"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_episode_poll: { Args: { p_episode_id: string; p_question: string; p_options: string[] }; Returns: string };
      delete_own_comment: { Args: { p_comment_id: string }; Returns: undefined };
      get_episode_reaction_counts: { Args: { p_episode_id: string }; Returns: { reaction: string; count: number }[] };
      get_analytics_dashboard: { Args: { p_days?: number; p_timezone?: string }; Returns: Json };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      soft_delete_series: { Args: { target_id: string }; Returns: undefined };
      track_analytics_event: {
        Args: {
          p_visitor_id: string; p_session_id: string; p_event_name: string; p_path: string;
          p_referrer: string; p_device_type: string; p_metadata: Json;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type SeriesRow = Database["public"]["Tables"]["series"]["Row"];
export type EpisodeRow = Database["public"]["Tables"]["episodes"]["Row"];
export type CommunityProfileRow = Database["public"]["Tables"]["community_profiles"]["Row"];
export type EpisodeCommentRow = Database["public"]["Tables"]["episode_comments"]["Row"];
