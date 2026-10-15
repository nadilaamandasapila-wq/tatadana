export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WalletType = 'cash' | 'bank' | 'ewallet';
export type CategoryType = 'income' | 'expense';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionSource = 'manual' | 'telegram_text' | 'telegram_ocr' | 'telegram_voice';
export type SubscriptionTier = 'starter' | 'pro';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type ExportFileType = 'pdf' | 'xlsx';
export type ExportStatus = 'pending' | 'completed' | 'failed';
export type AIProviderType = 'gemini' | 'openai' | 'deepseek';
export type AIPurpose = 'nlp_parse' | 'ocr_receipt' | 'voice_stt' | 'advisor';
export type AIStatus = 'success' | 'failed';

export type UserApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

// 1. PROFILES
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  telegram_chat_id?: number | null;
  telegram_username?: string | null;
  avatar_url?: string | null;
  subscription_tier: SubscriptionTier;
  is_admin: boolean;
  approval_status?: UserApprovalStatus;
  rejection_reason?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

// 2. WALLETS
export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: WalletType;
  balance: number;
  is_default: boolean;
  icon?: string | null;
  created_at: string;
  updated_at: string;
}

// 3. CATEGORIES
export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
  is_default: boolean;
  created_at: string;
}

// 4. TRANSACTIONS
export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  notes?: string | null;
  raw_input?: string | null;
  source: TransactionSource;
  destination_wallet_id?: string | null;
  receipt_url?: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  // joined relations
  wallet?: Wallet;
  category?: Category;
  destination_wallet?: Wallet;
  items?: TransactionItem[];
}

// 5. TRANSACTION_ITEMS
export interface TransactionItem {
  id: string;
  transaction_id: string;
  item_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  category_id?: string | null;
  created_at: string;
}

// 6. BUDGETS
export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  month_year: string; // YYYY-MM
  created_at: string;
  updated_at: string;
  category?: Category;
  spent?: number;
}

// 7. EXPORT_HISTORY
export interface ExportHistory {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: ExportFileType;
  period_range: string;
  status: ExportStatus;
  created_at: string;
}

// 8. AI_PROVIDERS
export interface AIProvider {
  id: string;
  name: string;
  provider_type: AIProviderType;
  api_key?: string | null;
  model_name: string;
  is_active: boolean;
  priority: number;
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// 9. AI_LOGS
export interface AILog {
  id: string;
  user_id?: string | null;
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  purpose: AIPurpose;
  status: AIStatus;
  error_message?: string | null;
  estimated_cost: number;
  created_at: string;
  user_email?: string;
}

// 10. SUBSCRIPTIONS
export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionTier;
  status: SubscriptionStatus;
  start_date: string;
  end_date?: string | null;
  midtrans_order_id?: string | null;
  payment_type?: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

// 11. ADMIN_AUDIT_LOGS
export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  target_user_id?: string | null;
  action: string;
  details?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
  admin_email?: string;
}

// 12. TELEGRAM_PROCESSED_UPDATES
export interface TelegramProcessedUpdate {
  update_id: number;
  chat_id?: number | null;
  created_at: string;
}

// STORAGE ENTITIES
export interface StorageBucket {
  id: string;
  name: string;
  owner?: string | null;
  public: boolean;
  file_size_limit?: number | null;
  allowed_mime_types?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface StorageFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, any>;
}

export interface StorageUploadResult {
  path: string;
  id?: string;
  fullPath?: string;
}

export interface StorageSignedUrlResult {
  signedUrl: string;
  error?: string | null;
}

// SUPABASE DATABASE TYPE DEFINITION
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          telegram_chat_id?: number | null;
          telegram_username?: string | null;
          avatar_url?: string | null;
          subscription_tier?: SubscriptionTier;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          telegram_chat_id?: number | null;
          telegram_username?: string | null;
          avatar_url?: string | null;
          subscription_tier?: SubscriptionTier;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallets: {
        Row: Wallet;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: WalletType;
          balance?: number;
          is_default?: boolean;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: WalletType;
          balance?: number;
          is_default?: boolean;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          type: CategoryType;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          type?: CategoryType;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
      };
      transactions: {
        Row: Transaction;
        Insert: {
          id?: string;
          user_id: string;
          wallet_id: string;
          category_id?: string | null;
          type: TransactionType;
          amount: number;
          notes?: string | null;
          raw_input?: string | null;
          source?: TransactionSource;
          destination_wallet_id?: string | null;
          receipt_url?: string | null;
          transaction_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_id?: string;
          category_id?: string | null;
          type?: TransactionType;
          amount?: number;
          notes?: string | null;
          raw_input?: string | null;
          source?: TransactionSource;
          destination_wallet_id?: string | null;
          receipt_url?: string | null;
          transaction_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      transaction_items: {
        Row: TransactionItem;
        Insert: {
          id?: string;
          transaction_id: string;
          item_name: string;
          quantity?: number;
          price?: number;
          total_amount?: number;
          category_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          item_name?: string;
          quantity?: number;
          price?: number;
          total_amount?: number;
          category_id?: string | null;
          created_at?: string;
        };
      };
      budgets: {
        Row: Budget;
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          monthly_limit: number;
          month_year: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          monthly_limit?: number;
          month_year?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      export_history: {
        Row: ExportHistory;
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_url: string;
          file_type: ExportFileType;
          period_range: string;
          status?: ExportStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: ExportFileType;
          period_range?: string;
          status?: ExportStatus;
          created_at?: string;
        };
      };
      ai_providers: {
        Row: AIProvider;
        Insert: {
          id?: string;
          name: string;
          provider_type: AIProviderType;
          api_key?: string | null;
          model_name: string;
          is_active?: boolean;
          priority?: number;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          provider_type?: AIProviderType;
          api_key?: string | null;
          model_name?: string;
          is_active?: boolean;
          priority?: number;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_logs: {
        Row: AILog;
        Insert: {
          id?: string;
          user_id?: string | null;
          provider: string;
          model: string;
          prompt_tokens?: number;
          completion_tokens?: number;
          latency_ms?: number;
          purpose: AIPurpose;
          status: AIStatus;
          error_message?: string | null;
          estimated_cost?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          provider?: string;
          model?: string;
          prompt_tokens?: number;
          completion_tokens?: number;
          latency_ms?: number;
          purpose?: AIPurpose;
          status?: AIStatus;
          error_message?: string | null;
          estimated_cost?: number;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: Subscription;
        Insert: {
          id?: string;
          user_id: string;
          plan: SubscriptionTier;
          status?: SubscriptionStatus;
          start_date?: string;
          end_date?: string | null;
          midtrans_order_id?: string | null;
          payment_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: SubscriptionTier;
          status?: SubscriptionStatus;
          start_date?: string;
          end_date?: string | null;
          midtrans_order_id?: string | null;
          payment_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_audit_logs: {
        Row: AdminAuditLog;
        Insert: {
          id?: string;
          admin_user_id: string;
          target_user_id?: string | null;
          action: string;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string;
          target_user_id?: string | null;
          action?: string;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      telegram_processed_updates: {
        Row: TelegramProcessedUpdate;
        Insert: {
          update_id: number;
          chat_id?: number | null;
          created_at?: string;
        };
        Update: {
          update_id?: number;
          chat_id?: number | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      wallet_type: WalletType;
      category_type: CategoryType;
      transaction_type: TransactionType;
      transaction_source: TransactionSource;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
      export_file_type: ExportFileType;
      export_status: ExportStatus;
      ai_provider_type: AIProviderType;
      ai_purpose: AIPurpose;
      ai_status: AIStatus;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: StorageBucket;
        Insert: {
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean;
          file_size_limit?: number | null;
          allowed_mime_types?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean;
          file_size_limit?: number | null;
          allowed_mime_types?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      objects: {
        Row: StorageFile;
        Insert: {
          name: string;
          bucket_id: string;
          owner?: string | null;
          metadata?: Json;
        };
        Update: {
          name?: string;
          bucket_id?: string;
          owner?: string | null;
          metadata?: Json;
        };
      };
    };
  };
}
