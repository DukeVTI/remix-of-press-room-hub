export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_admins: {
        Row: {
          admin_email: string
          admin_first_name: string
          admin_last_name: string
          admin_user_id: string | null
          assigned_at: string
          assigned_by: string
          blog_id: string
          id: string
          invitation_sent: boolean
          status: Database["public"]["Enums"]["admin_status"]
        }
        Insert: {
          admin_email: string
          admin_first_name: string
          admin_last_name: string
          admin_user_id?: string | null
          assigned_at?: string
          assigned_by: string
          blog_id: string
          id?: string
          invitation_sent?: boolean
          status?: Database["public"]["Enums"]["admin_status"]
        }
        Update: {
          admin_email?: string
          admin_first_name?: string
          admin_last_name?: string
          admin_user_id?: string | null
          assigned_at?: string
          assigned_by?: string
          blog_id?: string
          id?: string
          invitation_sent?: boolean
          status?: Database["public"]["Enums"]["admin_status"]
        }
        Relationships: [
          {
            foreignKeyName: "blog_admins_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_admins_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_admins_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_languages: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          blog_name: string
          category_id: string
          created_at: string
          custom_category: string | null
          custom_language: string | null
          description: string
          follower_count: number
          id: string
          is_verified: boolean
          languages: string[]
          owner_id: string
          profile_photo_alt: string
          profile_photo_url: string
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
        }
        Insert: {
          blog_name: string
          category_id: string
          created_at?: string
          custom_category?: string | null
          custom_language?: string | null
          description: string
          follower_count?: number
          id?: string
          is_verified?: boolean
          languages?: string[]
          owner_id: string
          profile_photo_alt?: string
          profile_photo_url: string
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
        }
        Update: {
          blog_name?: string
          category_id?: string
          created_at?: string
          custom_category?: string | null
          custom_language?: string | null
          description?: string
          follower_count?: number
          id?: string
          is_verified?: boolean
          languages?: string[]
          owner_id?: string
          profile_photo_alt?: string
          profile_photo_url?: string
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
        }
        Relationships: [
          {
            foreignKeyName: "blogs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blogs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      celebration_posts: {
        Row: {
          blog_id: string
          celebration_type: Database["public"]["Enums"]["celebration_type"]
          created_at: string
          expires_at: string
          id: string
          post_content: string
          status: Database["public"]["Enums"]["celebration_status"]
          user_id: string
        }
        Insert: {
          blog_id: string
          celebration_type: Database["public"]["Enums"]["celebration_type"]
          created_at?: string
          expires_at: string
          id?: string
          post_content: string
          status?: Database["public"]["Enums"]["celebration_status"]
          user_id: string
        }
        Update: {
          blog_id?: string
          celebration_type?: Database["public"]["Enums"]["celebration_type"]
          created_at?: string
          expires_at?: string
          id?: string
          post_content?: string
          status?: Database["public"]["Enums"]["celebration_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "celebration_posts_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celebration_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reaction_type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          approval_count: number
          content: string
          created_at: string
          disapproval_count: number
          id: string
          is_pinned: boolean
          parent_comment_id: string | null
          post_id: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_count?: number
          content: string
          created_at?: string
          disapproval_count?: number
          id?: string
          is_pinned?: boolean
          parent_comment_id?: string | null
          post_id: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_count?: number
          content?: string
          created_at?: string
          disapproval_count?: number
          id?: string
          is_pinned?: boolean
          parent_comment_id?: string | null
          post_id?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          blog_id: string
          created_at: string
          follower_id: string
          id: string
        }
        Insert: {
          blog_id: string
          created_at?: string
          follower_id: string
          id?: string
        }
        Update: {
          blog_id?: string
          created_at?: string
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string
          description: string
          file_size: number | null
          file_url: string
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          order_position: number
          post_id: string
        }
        Insert: {
          created_at?: string
          description: string
          file_size?: number | null
          file_url: string
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          order_position?: number
          post_id: string
        }
        Update: {
          created_at?: string
          description?: string
          file_size?: number | null
          file_url?: string
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          order_position?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          approval_count: number
          author_id: string
          blog_id: string
          byline: string
          comment_count: number
          comments_locked: boolean
          content: string
          created_at: string
          disapproval_count: number
          headline: string
          id: string
          is_pinned: boolean
          published_at: string | null
          status: Database["public"]["Enums"]["post_status"]
          subtitle: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          approval_count?: number
          author_id: string
          blog_id: string
          byline: string
          comment_count?: number
          comments_locked?: boolean
          content: string
          created_at?: string
          disapproval_count?: number
          headline: string
          id?: string
          is_pinned?: boolean
          published_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          subtitle?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          approval_count?: number
          author_id?: string
          blog_id?: string
          byline?: string
          comment_count?: number
          comments_locked?: boolean
          content?: string
          created_at?: string
          disapproval_count?: number
          headline?: string
          id?: string
          is_pinned?: boolean
          published_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          subtitle?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          bio: string | null
          created_at: string
          date_of_birth: string
          email: string
          email_verified: boolean
          first_name: string
          hobbies: string | null
          id: string
          is_verified: boolean
          last_name: string
          middle_name: string | null
          profile_photo_url: string | null
          screen_name: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          bio?: string | null
          created_at?: string
          date_of_birth: string
          email: string
          email_verified?: boolean
          first_name: string
          hobbies?: string | null
          id: string
          is_verified?: boolean
          last_name: string
          middle_name?: string | null
          profile_photo_url?: string | null
          screen_name?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          bio?: string | null
          created_at?: string
          date_of_birth?: string
          email?: string
          email_verified?: boolean
          first_name?: string
          hobbies?: string | null
          id?: string
          is_verified?: boolean
          last_name?: string
          middle_name?: string | null
          profile_photo_url?: string | null
          screen_name?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          custom_reason: string | null
          id: string
          reason_category: Database["public"]["Enums"]["report_reason"]
          reported_item_id: string
          reported_item_type: Database["public"]["Enums"]["reported_item_type"]
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          custom_reason?: string | null
          id?: string
          reason_category: Database["public"]["Enums"]["report_reason"]
          reported_item_id: string
          reported_item_type: Database["public"]["Enums"]["reported_item_type"]
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          custom_reason?: string | null
          id?: string
          reason_category?: Database["public"]["Enums"]["report_reason"]
          reported_item_id?: string
          reported_item_type?: Database["public"]["Enums"]["reported_item_type"]
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_blog: {
        Args: { _blog_id: string; _user_id: string }
        Returns: boolean
      }
      is_blog_admin: {
        Args: { _blog_id: string; _user_id: string }
        Returns: boolean
      }
      is_blog_owner: {
        Args: { _blog_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "suspended" | "deactivated"
      admin_status: "pending" | "active" | "removed"
      blog_status: "active" | "hidden" | "deleted"
      celebration_status: "active" | "expired"
      celebration_type: "account_anniversary" | "birthday"
      content_status: "active" | "hidden" | "deleted"
      media_type: "image" | "video" | "audio"
      post_status: "draft" | "published" | "hidden" | "deleted"
      reaction_type: "approve" | "disapprove"
      report_reason:
        | "misleading"
        | "falsehood"
        | "wrong_impression"
        | "cyber_bully"
        | "scam"
        | "cursing"
        | "abuse"
        | "discrimination"
        | "bad_profiling"
        | "propaganda"
        | "instigating"
        | "miseducation"
        | "disrespectful"
        | "intolerance"
        | "others"
      report_status: "pending" | "reviewed" | "resolved"
      reported_item_type: "post" | "comment" | "blog" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "suspended", "deactivated"],
      admin_status: ["pending", "active", "removed"],
      blog_status: ["active", "hidden", "deleted"],
      celebration_status: ["active", "expired"],
      celebration_type: ["account_anniversary", "birthday"],
      content_status: ["active", "hidden", "deleted"],
      media_type: ["image", "video", "audio"],
      post_status: ["draft", "published", "hidden", "deleted"],
      reaction_type: ["approve", "disapprove"],
      report_reason: [
        "misleading",
        "falsehood",
        "wrong_impression",
        "cyber_bully",
        "scam",
        "cursing",
        "abuse",
        "discrimination",
        "bad_profiling",
        "propaganda",
        "instigating",
        "miseducation",
        "disrespectful",
        "intolerance",
        "others",
      ],
      report_status: ["pending", "reviewed", "resolved"],
      reported_item_type: ["post", "comment", "blog", "user"],
    },
  },
} as const
