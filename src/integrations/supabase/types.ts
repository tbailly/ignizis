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
      companies: {
        Row: {
          accounting_software_url: string | null
          address: string | null
          company_number: string | null
          compliant_until: string | null
          country: string | null
          created_at: string
          deleted_at: string | null
          finance_software_url: string | null
          id: string
          name: string
          perm_accounting: boolean
          perm_finance: boolean
          perm_legal: boolean
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          accounting_software_url?: string | null
          address?: string | null
          company_number?: string | null
          compliant_until?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          finance_software_url?: string | null
          id?: string
          name: string
          perm_accounting?: boolean
          perm_finance?: boolean
          perm_legal?: boolean
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          accounting_software_url?: string | null
          address?: string | null
          company_number?: string | null
          compliant_until?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          finance_software_url?: string | null
          id?: string
          name?: string
          perm_accounting?: boolean
          perm_finance?: boolean
          perm_legal?: boolean
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_officers: {
        Row: {
          birth_city: string
          compliant_until: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          first_name: string
          id: string
          last_name: string
          passport_document_id: string | null
          position: string
          power_of_attorney_document_id: string | null
          secondary_id_document_id: string | null
        }
        Insert: {
          birth_city?: string
          compliant_until?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          first_name: string
          id?: string
          last_name: string
          passport_document_id?: string | null
          position: string
          power_of_attorney_document_id?: string | null
          secondary_id_document_id?: string | null
        }
        Update: {
          birth_city?: string
          compliant_until?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          passport_document_id?: string | null
          position?: string
          power_of_attorney_document_id?: string | null
          secondary_id_document_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_officers_passport_document_id_fkey"
            columns: ["passport_document_id"]
            isOneToOne: false
            referencedRelation: "active_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_officers_passport_document_id_fkey"
            columns: ["passport_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_officers_power_of_attorney_document_id_fkey"
            columns: ["power_of_attorney_document_id"]
            isOneToOne: false
            referencedRelation: "active_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_officers_power_of_attorney_document_id_fkey"
            columns: ["power_of_attorney_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_officers_secondary_id_document_id_fkey"
            columns: ["secondary_id_document_id"]
            isOneToOne: false
            referencedRelation: "active_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_officers_secondary_id_document_id_fkey"
            columns: ["secondary_id_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tag_assignments: {
        Row: {
          document_id: string
          id: string
          tag_id: string
        }
        Insert: {
          document_id: string
          id?: string
          tag_id: string
        }
        Update: {
          document_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_tag_assignments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "active_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_tag_assignments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "active_document_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "document_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tags: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          company_id: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          original_filename: string
          storage_path: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name: string
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          original_filename: string
          storage_path: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string
          storage_path?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_attempt_at: string | null
          request_id: string
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          request_id: string
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "active_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_company_assignments: {
        Row: {
          company_id: string
          created_at: string
          id: string
          officer_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          officer_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          officer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "officer_company_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_company_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_company_assignments_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "active_company_officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_company_assignments_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "company_officers"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          position: number
          request_number: number
          requester_email: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          position?: number
          request_number: number
          requester_email?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          position?: number
          request_number?: number
          requester_email?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_companies: {
        Row: {
          company_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          theme_preference: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          theme_preference?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          theme_preference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_companies: {
        Row: {
          accounting_software_url: string | null
          address: string | null
          company_number: string | null
          compliant_until: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          finance_software_url: string | null
          id: string | null
          name: string | null
          perm_accounting: boolean | null
          perm_finance: boolean | null
          perm_legal: boolean | null
          slug: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          accounting_software_url?: string | null
          address?: string | null
          company_number?: string | null
          compliant_until?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          finance_software_url?: string | null
          id?: string | null
          name?: string | null
          perm_accounting?: boolean | null
          perm_finance?: boolean | null
          perm_legal?: boolean | null
          slug?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          accounting_software_url?: string | null
          address?: string | null
          company_number?: string | null
          compliant_until?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          finance_software_url?: string | null
          id?: string | null
          name?: string | null
          perm_accounting?: boolean | null
          perm_finance?: boolean | null
          perm_legal?: boolean | null
          slug?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      active_company_officers: {
        Row: {
          birth_city: string | null
          compliant_until: string | null
          created_at: string | null
          date_of_birth: string | null
          deleted_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          passport_document_id: string | null
          position: string | null
          power_of_attorney_document_id: string | null
          secondary_id_document_id: string | null
        }
        Insert: {
          birth_city?: string | null
          compliant_until?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          passport_document_id?: string | null
          position?: string | null
          power_of_attorney_document_id?: string | null
          secondary_id_document_id?: string | null
        }
        Update: {
          birth_city?: string | null
          compliant_until?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          passport_document_id?: string | null
          position?: string | null
          power_of_attorney_document_id?: string | null
          secondary_id_document_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_officers_passport_document_id_fkey"
            columns: ["passport_document_id"]
            isOneToOne: false
            referencedRelation: "active_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_officers_passport_document_id_fkey"
            columns: ["passport_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_officers_power_of_attorney_document_id_fkey"
            columns: ["power_of_attorney_document_id"]
            isOneToOne: false
            referencedRelation: "active_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_officers_power_of_attorney_document_id_fkey"
            columns: ["power_of_attorney_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_officers_secondary_id_document_id_fkey"
            columns: ["secondary_id_document_id"]
            isOneToOne: false
            referencedRelation: "active_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_officers_secondary_id_document_id_fkey"
            columns: ["secondary_id_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      active_document_tags: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      active_documents: {
        Row: {
          company_id: string | null
          created_at: string | null
          deleted_at: string | null
          display_name: string | null
          document_type: Database["public"]["Enums"]["document_type"] | null
          expires_at: string | null
          file_size: number | null
          id: string | null
          mime_type: string | null
          original_filename: string | null
          storage_path: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          expires_at?: string | null
          file_size?: number | null
          id?: string | null
          mime_type?: string | null
          original_filename?: string | null
          storage_path?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          expires_at?: string | null
          file_size?: number | null
          id?: string | null
          mime_type?: string | null
          original_filename?: string | null
          storage_path?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      active_requests: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          position: number | null
          request_number: number | null
          requester_email: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          position?: number | null
          request_number?: number | null
          requester_email?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          position?: number | null
          request_number?: number | null
          requester_email?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_permission: {
        Args: { section_name: string; target_company_id: string }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_member_of_company: {
        Args: { target_company_id: string }
        Returns: boolean
      }
      recalculate_officer_compliant_until: {
        Args: { p_officer_id: string }
        Returns: undefined
      }
      soft_delete_company: {
        Args: { p_company_id: string }
        Returns: undefined
      }
    }
    Enums: {
      document_type:
        | "contract"
        | "invoice"
        | "other"
        | "passport"
        | "secondary_id"
        | "power_of_attorney"
        | "legal"
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
      document_type: [
        "contract",
        "invoice",
        "other",
        "passport",
        "secondary_id",
        "power_of_attorney",
        "legal",
      ],
    },
  },
} as const
