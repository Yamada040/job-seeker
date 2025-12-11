export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

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
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          university?: string | null;
          faculty?: string | null;
          avatar_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      es_entries: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          content_md: string | null;
          questions: Json | null;
          status: string | null;
          tags: string[] | null;
          score: number | null;
          ai_summary: string | null;
          company_name: string | null;
          company_url: string | null;
          selection_status: string | null;
          memo: string | null;
          deadline: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          content_md?: string | null;
          questions?: Json | null;
          status?: string | null;
          tags?: string[] | null;
          score?: number | null;
          ai_summary?: string | null;
          company_name?: string | null;
          company_url?: string | null;
          selection_status?: string | null;
          memo?: string | null;
          deadline?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["es_entries"]["Insert"]>;
      };
      companies: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          url: string | null;
          mypage_id: string | null;
          mypage_url: string | null;
          memo: string | null;
          stage: string | null;
          preference: number | null;
          favorite: boolean | null;
          ai_summary: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          url?: string | null;
          mypage_id?: string | null;
          mypage_url?: string | null;
          memo?: string | null;
          stage?: string | null;
          preference?: number | null;
          favorite?: boolean | null;
          ai_summary?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          company: string | null;
          type: string | null;
          date: string | null;
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
      };
      xp_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          xp: number;
          meta: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          xp: number;
          meta?: Json | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["xp_logs"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

