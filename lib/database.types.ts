export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          university: string | null;
          faculty: string | null;
          avatar_id: string | null;
          target_industry: string | null;
          career_axis: string | null;
          goal_state: string | null;
          xp: number;
          level: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          university?: string | null;
          faculty?: string | null;
          avatar_id?: string | null;
          target_industry?: string | null;
          career_axis?: string | null;
          goal_state?: string | null;
          xp?: number;
          level?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      es_entries: {
        Row: {
          id: string;
          user_id: string | null;
          company_name: string | null;
          selection_status: string | null;
          company_url: string | null;
          memo: string | null;
          status: string | null;
          content_md: string | null;
          questions: Json | null;
          tags: string[] | null;
          score: number | null;
          ai_summary: string | null;
          deadline: string | null;
          title: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          company_name?: string | null;
          selection_status?: string | null;
          company_url?: string | null;
          memo?: string | null;
          status?: string | null;
          content_md?: string | null;
          questions?: Json | null;
          tags?: string[] | null;
          score?: number | null;
          ai_summary?: string | null;
          deadline?: string | null;
          title?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["es_entries"]["Insert"]>;
        Relationships: [];
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          company: string | null;
          type: string | null;
          date: string;
          time: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          company?: string | null;
          type?: string | null;
          date: string;
          time?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_events"]["Insert"]>;
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          industry: string | null;
          url: string | null;
          mypage_id: string | null;
          mypage_url: string | null;
          memo: string | null;
          stage: string | null;
          preference: number | null;
          favorite: boolean | null;
          ai_summary: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          industry?: string | null;
          url?: string | null;
          mypage_id?: string | null;
          mypage_url?: string | null;
          memo?: string | null;
          stage?: string | null;
          preference?: number | null;
          favorite?: boolean | null;
          ai_summary?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
        Relationships: [];
      };
      xp_logs: {
        Row: {
          id: string;
          user_id: string | null;
          xp: number;
          action: string;
          ref_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          xp: number;
          action?: string;
          ref_id?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["xp_logs"]["Insert"]>;
        Relationships: [];
      };
      aptitude_results: {
        Row: {
          id: string;
          user_id: string | null;
          answers: Json;
          ai_summary: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          answers: Json;
          ai_summary?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["aptitude_results"]["Insert"]>;
        Relationships: [];
      };
      self_analysis_results: {
        Row: {
          id: string;
          user_id: string | null;
          answers: Json;
          ai_summary: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          answers: Json;
          ai_summary?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["self_analysis_results"]["Insert"]>;
        Relationships: [];
      };
      webtest_questions: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          body: string;
          test_type: string | null;
          choices: Json | null;
          answer: string;
          explanation: string | null;
          category: string | null;
          format: string | null;
          difficulty: string | null;
          time_limit: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          body: string;
          test_type?: string | null;
          choices?: Json | null;
          answer: string;
          explanation?: string | null;
          category?: string | null;
          format?: string | null;
          difficulty?: string | null;
          time_limit?: number | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["webtest_questions"]["Insert"]>;
        Relationships: [];
      };
      webtest_attempts: {
        Row: {
          id: string;
          user_id: string | null;
          question_id: string | null;
          is_correct: boolean | null;
          time_spent: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          question_id?: string | null;
          is_correct?: boolean | null;
          time_spent?: number | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["webtest_attempts"]["Insert"]>;
        Relationships: [];
      };
      interview_logs: {
        Row: {
          id: string;
          user_id: string | null;
          company_name: string;
          interview_title: string | null;
          interview_date: string | null;
          stage: string | null;
          questions: Json | null;
          self_review: string | null;
          ai_summary: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          company_name: string;
          interview_title?: string | null;
          interview_date?: string | null;
          stage?: string | null;
          questions?: Json | null;
          self_review?: string | null;
          ai_summary?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["interview_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export {};
