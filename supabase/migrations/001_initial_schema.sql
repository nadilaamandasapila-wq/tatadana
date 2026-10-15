-- TataDana Initial Schema Migration
-- 12 Tables, RLS, Triggers, Storage & Realtime

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    telegram_chat_id BIGINT UNIQUE,
    telegram_username TEXT,
    avatar_url TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro')),
    approval_status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (approval_status IN ('pending_approval', 'approved', 'rejected')),
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet')),
    balance NUMERIC NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT,
    color TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    notes TEXT,
    raw_input TEXT,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'telegram_text', 'telegram_ocr', 'telegram_voice')),
    destination_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    receipt_url TEXT,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TRANSACTION_ITEMS TABLE (Receipt breakdown)
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    monthly_limit NUMERIC NOT NULL CHECK (monthly_limit > 0),
    month_year TEXT NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, category_id, month_year)
);

-- 7. EXPORT_HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'xlsx')),
    period_range TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. AI_PROVIDERS TABLE
CREATE TABLE IF NOT EXISTS public.ai_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('gemini', 'openai', 'deepseek')),
    api_key TEXT,
    model_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INT NOT NULL DEFAULT 1,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. AI_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    purpose TEXT NOT NULL CHECK (purpose IN ('nlp_parse', 'ocr_receipt', 'voice_stt', 'advisor')),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
    error_message TEXT,
    estimated_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    midtrans_order_id TEXT,
    payment_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ADMIN_AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TELEGRAM_PROCESSED_UPDATES TABLE
CREATE TABLE IF NOT EXISTS public.telegram_processed_updates (
    update_id BIGINT PRIMARY KEY,
    chat_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_created ON public.ai_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram ON public.profiles(telegram_chat_id);

-- FUNCTION: IS ADMIN CHECK
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGERS & FUNCTIONS

-- Trigger: Handle single default wallet
CREATE OR REPLACE FUNCTION public.handle_single_default_wallet()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE public.wallets
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_default_wallet ON public.wallets;
CREATE TRIGGER trg_single_default_wallet
BEFORE INSERT OR UPDATE OF is_default ON public.wallets
FOR EACH ROW WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION public.handle_single_default_wallet();

-- Trigger: Handle wallet balance updates from transactions
CREATE OR REPLACE FUNCTION public.handle_wallet_balance_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle DELETE
    IF (TG_OP = 'DELETE') THEN
        IF OLD.type = 'income' THEN
            UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
        ELSIF OLD.type = 'transfer' AND OLD.destination_wallet_id IS NOT NULL THEN
            UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
            UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.destination_wallet_id;
        END IF;
        RETURN OLD;
    END IF;

    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
        IF NEW.type = 'income' THEN
            UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
        ELSIF NEW.type = 'transfer' AND NEW.destination_wallet_id IS NOT NULL THEN
            UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
            UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.destination_wallet_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle UPDATE
    IF (TG_OP = 'UPDATE') THEN
        -- Revert OLD
        IF OLD.type = 'income' THEN
            UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
        ELSIF OLD.type = 'transfer' AND OLD.destination_wallet_id IS NOT NULL THEN
            UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
            UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.destination_wallet_id;
        END IF;
        -- Apply NEW
        IF NEW.type = 'income' THEN
            UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
        ELSIF NEW.type = 'transfer' AND NEW.destination_wallet_id IS NOT NULL THEN
            UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
            UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.destination_wallet_id;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_on_transaction_balance_change ON public.transactions;
CREATE TRIGGER tr_on_transaction_balance_change
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_wallet_balance_change();

-- Trigger: Handle new user auto-provisioning
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_profile_id UUID;
    default_wallet_id UUID;
BEGIN
    new_profile_id := NEW.id;

    -- 1. Insert Profile
    INSERT INTO public.profiles (id, full_name, email, avatar_url, subscription_tier, approval_status)
    VALUES (
        new_profile_id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        'starter',
        'pending_approval'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Default 'Tunai' Wallet
    INSERT INTO public.wallets (user_id, name, type, balance, is_default, icon)
    VALUES (new_profile_id, 'Tunai', 'cash', 0, TRUE, 'Banknote')
    RETURNING id INTO default_wallet_id;

    -- 3. Insert Standard Indonesian Categories
    INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
    (new_profile_id, 'Makanan & Minuman', 'expense', 'Utensils', '#f97316', TRUE),
    (new_profile_id, 'Transportasi', 'expense', 'Car', '#3b82f6', TRUE),
    (new_profile_id, 'Belanja', 'expense', 'ShoppingBag', '#ec4899', TRUE),
    (new_profile_id, 'Tagihan & Utilitas', 'expense', 'Receipt', '#eab308', TRUE),
    (new_profile_id, 'Hiburan', 'expense', 'Film', '#8b5cf6', TRUE),
    (new_profile_id, 'Kesehatan', 'expense', 'HeartPulse', '#ef4444', TRUE),
    (new_profile_id, 'Gaji', 'income', 'Wallet', '#10b981', TRUE),
    (new_profile_id, 'Bonus & Hadiah', 'income', 'Gift', '#06b6d4', TRUE),
    (new_profile_id, 'Investasi', 'income', 'TrendingUp', '#14b8a6', TRUE);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;
CREATE TRIGGER tr_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Handle updated_at auto-timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_wallets_updated_at ON public.wallets;
CREATE TRIGGER tr_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_transactions_updated_at ON public.transactions;
CREATE TRIGGER tr_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_budgets_updated_at ON public.budgets;
CREATE TRIGGER tr_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_ai_providers_updated_at ON public.ai_providers;
CREATE TRIGGER tr_ai_providers_updated_at BEFORE UPDATE ON public.ai_providers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ROW-LEVEL SECURITY POLICIES (All 12 Tables)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_processed_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own wallets" ON public.wallets;
CREATE POLICY "Users can manage own wallets" ON public.wallets FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own categories" ON public.categories;
CREATE POLICY "Users can manage own categories" ON public.categories FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own transaction items" ON public.transaction_items;
CREATE POLICY "Users can manage own transaction items" ON public.transaction_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.transactions WHERE transactions.id = transaction_items.transaction_id AND (transactions.user_id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "Users can manage own budgets" ON public.budgets;
CREATE POLICY "Users can manage own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own exports" ON public.export_history;
CREATE POLICY "Users can manage own exports" ON public.export_history FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Only admins can view audit logs" ON public.admin_audit_logs FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users view active providers, admins manage" ON public.ai_providers;
CREATE POLICY "Users view active providers, admins manage" ON public.ai_providers FOR ALL USING (public.is_admin() OR is_active = TRUE);

DROP POLICY IF EXISTS "Users view own ai logs, admins view all" ON public.ai_logs;
CREATE POLICY "Users view own ai logs, admins view all" ON public.ai_logs FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins and service role manage telegram processed updates" ON public.telegram_processed_updates;
CREATE POLICY "Admins and service role manage telegram processed updates" ON public.telegram_processed_updates FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- Supabase Realtime Publication (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'wallets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'budgets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('tatadana-exports', 'tatadana-exports', FALSE, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']),
    ('receipt-images', 'receipt-images', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Users can view own exports in tatadana-exports" ON storage.objects;
CREATE POLICY "Users can view own exports in tatadana-exports" ON storage.objects FOR SELECT USING (bucket_id = 'tatadana-exports' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin() OR auth.role() = 'service_role'));

DROP POLICY IF EXISTS "Users can upload own exports to tatadana-exports" ON storage.objects;
CREATE POLICY "Users can upload own exports to tatadana-exports" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tatadana-exports' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin() OR auth.role() = 'service_role'));

DROP POLICY IF EXISTS "Users can delete own exports in tatadana-exports" ON storage.objects;
CREATE POLICY "Users can delete own exports in tatadana-exports" ON storage.objects FOR DELETE USING (bucket_id = 'tatadana-exports' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin() OR auth.role() = 'service_role'));

DROP POLICY IF EXISTS "Users can view own receipt images" ON storage.objects;
CREATE POLICY "Users can view own receipt images" ON storage.objects FOR SELECT USING (bucket_id = 'receipt-images' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin() OR auth.role() = 'service_role'));

DROP POLICY IF EXISTS "Users can upload own receipt images" ON storage.objects;
CREATE POLICY "Users can upload own receipt images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipt-images' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin() OR auth.role() = 'service_role'));

DROP POLICY IF EXISTS "Users can delete own receipt images" ON storage.objects;
CREATE POLICY "Users can delete own receipt images" ON storage.objects FOR DELETE USING (bucket_id = 'receipt-images' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin() OR auth.role() = 'service_role'));

DROP POLICY IF EXISTS "Service role full access to tatadana storage" ON storage.objects;
CREATE POLICY "Service role full access to tatadana storage" ON storage.objects FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
