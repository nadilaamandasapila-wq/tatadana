-- TataDana Migration 002: Storage Buckets, RLS, and Updated At Triggers
-- Incremental migration adding handle_updated_at and storage provisioning

-- 1. Trigger: Handle updated_at auto-timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers safely if not already existing
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_wallets_updated_at ON public.wallets;
CREATE TRIGGER tr_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_transactions_updated_at ON public.transactions;
CREATE TRIGGER tr_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_budgets_updated_at ON public.budgets;
CREATE TRIGGER tr_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_ai_providers_updated_at ON public.ai_providers;
CREATE TRIGGER tr_ai_providers_updated_at
BEFORE UPDATE ON public.ai_providers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER tr_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Storage Buckets Provisioning
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('tatadana-exports', 'tatadana-exports', FALSE, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']),
    ('receipt-images', 'receipt-images', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Storage RLS Policies
DROP POLICY IF EXISTS "Users can view own exports in tatadana-exports" ON storage.objects;
CREATE POLICY "Users can view own exports in tatadana-exports"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'tatadana-exports' AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.is_admin()
        OR auth.role() = 'service_role'
    )
);

DROP POLICY IF EXISTS "Users can upload own exports to tatadana-exports" ON storage.objects;
CREATE POLICY "Users can upload own exports to tatadana-exports"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'tatadana-exports' AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.is_admin()
        OR auth.role() = 'service_role'
    )
);

DROP POLICY IF EXISTS "Users can delete own exports in tatadana-exports" ON storage.objects;
CREATE POLICY "Users can delete own exports in tatadana-exports"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'tatadana-exports' AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.is_admin()
        OR auth.role() = 'service_role'
    )
);

DROP POLICY IF EXISTS "Users can view own receipt images" ON storage.objects;
CREATE POLICY "Users can view own receipt images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'receipt-images' AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.is_admin()
        OR auth.role() = 'service_role'
    )
);

DROP POLICY IF EXISTS "Users can upload own receipt images" ON storage.objects;
CREATE POLICY "Users can upload own receipt images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'receipt-images' AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.is_admin()
        OR auth.role() = 'service_role'
    )
);

DROP POLICY IF EXISTS "Users can delete own receipt images" ON storage.objects;
CREATE POLICY "Users can delete own receipt images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'receipt-images' AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR public.is_admin()
        OR auth.role() = 'service_role'
    )
);

DROP POLICY IF EXISTS "Service role full access to tatadana storage" ON storage.objects;
CREATE POLICY "Service role full access to tatadana storage"
ON storage.objects FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
