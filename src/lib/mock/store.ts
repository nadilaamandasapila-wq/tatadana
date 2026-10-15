import {
  Profile,
  Wallet,
  Category,
  Transaction,
  Budget,
  AIProvider,
  AILog,
  Subscription,
  AdminAuditLog,
  ExportHistory,
} from '@/types/database';

export const MOCK_USER: Profile = {
  id: 'usr_demo_fauzi_001',
  full_name: 'Ahmad Fauzi',
  email: 'fauzi@tatadana.id',
  phone: '081234567890',
  telegram_chat_id: 987654321,
  telegram_username: 'fauzi_tatadana',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  subscription_tier: 'pro',
  is_admin: false,
  approval_status: 'approved',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_ADMIN: Profile = {
  id: 'usr_demo_admin_001',
  full_name: 'Admin TataDana',
  email: 'admin@tatadana.id',
  phone: '081198765432',
  telegram_chat_id: 123456789,
  telegram_username: 'admin_tatadana',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  subscription_tier: 'pro',
  is_admin: true,
  approval_status: 'approved',
  created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_WALLETS: Wallet[] = [
  {
    id: 'wal_01',
    user_id: 'usr_demo_fauzi_001',
    name: 'Tunai Dompet',
    type: 'cash',
    balance: 1850000,
    is_default: true,
    icon: 'Banknote',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wal_02',
    user_id: 'usr_demo_fauzi_001',
    name: 'BCA Utama',
    type: 'bank',
    balance: 14500000,
    is_default: false,
    icon: 'CreditCard',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wal_03',
    user_id: 'usr_demo_fauzi_001',
    name: 'GoPay / OVO',
    type: 'ewallet',
    balance: 420000,
    is_default: false,
    icon: 'Smartphone',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat_01', user_id: 'usr_demo_fauzi_001', name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#f97316', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat_02', user_id: 'usr_demo_fauzi_001', name: 'Transportasi', type: 'expense', icon: 'Car', color: '#3b82f6', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat_03', user_id: 'usr_demo_fauzi_001', name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat_04', user_id: 'usr_demo_fauzi_001', name: 'Tagihan & Utilitas', type: 'expense', icon: 'Receipt', color: '#eab308', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat_05', user_id: 'usr_demo_fauzi_001', name: 'Hiburan', type: 'expense', icon: 'Film', color: '#8b5cf6', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat_06', user_id: 'usr_demo_fauzi_001', name: 'Kesehatan', type: 'expense', icon: 'HeartPulse', color: '#ef4444', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat_07', user_id: 'usr_demo_fauzi_001', name: 'Gaji Pokok', type: 'income', icon: 'Wallet', color: '#10b981', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat_08', user_id: 'usr_demo_fauzi_001', name: 'Bonus & Freelance', type: 'income', icon: 'Gift', color: '#06b6d4', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat_09', user_id: 'usr_demo_fauzi_001', name: 'Investasi', type: 'income', icon: 'TrendingUp', color: '#14b8a6', is_default: true, created_at: new Date().toISOString() },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_01',
    user_id: 'usr_demo_fauzi_001',
    wallet_id: 'wal_02',
    category_id: 'cat_07',
    type: 'income',
    amount: 15000000,
    notes: 'Gaji Bulanan PT Teknologi Indonesia',
    raw_input: 'Gaji masuk 15jt',
    source: 'telegram_text',
    transaction_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'tx_02',
    user_id: 'usr_demo_fauzi_001',
    wallet_id: 'wal_01',
    category_id: 'cat_01',
    type: 'expense',
    amount: 35000,
    notes: 'Nasi Padang Rendang + Es Teh',
    raw_input: 'Makan siang padang 35rb',
    source: 'telegram_text',
    transaction_date: new Date(Date.now() - 4 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'tx_03',
    user_id: 'usr_demo_fauzi_001',
    wallet_id: 'wal_03',
    category_id: 'cat_01',
    type: 'expense',
    amount: 28000,
    notes: 'Kopi Kenangan Mantan Large',
    raw_input: 'Beli kopi 28k',
    source: 'telegram_text',
    transaction_date: new Date(Date.now() - 12 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'tx_04',
    user_id: 'usr_demo_fauzi_001',
    wallet_id: 'wal_02',
    category_id: 'cat_03',
    type: 'expense',
    amount: 320000,
    notes: 'Struk Belanja Superindo Bulanan',
    raw_input: '[OCR Receipt Superindo]',
    source: 'telegram_ocr',
    transaction_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    items: [
      { id: 'item_01', transaction_id: 'tx_04', item_name: 'Beras Rojolele 5kg', quantity: 1, price: 74000, total_amount: 74000, category_id: 'cat_03', created_at: new Date().toISOString() },
      { id: 'item_02', transaction_id: 'tx_04', item_name: 'Minyak Goreng Sania 2L', quantity: 2, price: 38000, total_amount: 76000, category_id: 'cat_03', created_at: new Date().toISOString() },
      { id: 'item_03', transaction_id: 'tx_04', item_name: 'Daging Sapi Segar 500g', quantity: 1, price: 90000, total_amount: 90000, category_id: 'cat_03', created_at: new Date().toISOString() },
      { id: 'item_04', transaction_id: 'tx_04', item_name: 'Susu UHT Full Cream 1L', quantity: 4, price: 20000, total_amount: 80000, category_id: 'cat_03', created_at: new Date().toISOString() },
    ],
  },
  {
    id: 'tx_05',
    user_id: 'usr_demo_fauzi_001',
    wallet_id: 'wal_01',
    category_id: 'cat_02',
    type: 'expense',
    amount: 50000,
    notes: 'Bensin Motor Pertamax SPBU Shell',
    raw_input: 'Beli bensin 50rb',
    source: 'telegram_voice',
    transaction_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'tx_06',
    user_id: 'usr_demo_fauzi_001',
    wallet_id: 'wal_02',
    category_id: 'cat_04',
    type: 'expense',
    amount: 450000,
    notes: 'Tagihan Listrik PLN Pasca Bayar',
    raw_input: 'Bayar listrik 450k',
    source: 'manual',
    transaction_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'tx_07',
    user_id: 'usr_demo_fauzi_001',
    wallet_id: 'wal_03',
    category_id: 'cat_05',
    type: 'expense',
    amount: 120000,
    notes: 'Tiket Bioskop XXI Cinema 2 Orang',
    raw_input: 'Nonton bioskop 120rb',
    source: 'telegram_text',
    transaction_date: new Date(Date.now() - 8 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'tx_08',
    user_id: 'usr_demo_fauzi_001',
    wallet_id: 'wal_02',
    category_id: 'cat_08',
    type: 'income',
    amount: 3500000,
    notes: 'Project Freelance UI/UX Dashboard',
    raw_input: 'Freelance transfer masuk 3.5jt',
    source: 'telegram_text',
    transaction_date: new Date(Date.now() - 10 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export const MOCK_BUDGETS: Budget[] = [
  {
    id: 'bud_01',
    user_id: 'usr_demo_fauzi_001',
    category_id: 'cat_01',
    monthly_limit: 2500000,
    month_year: '2026-10',
    spent: 1950000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bud_02',
    user_id: 'usr_demo_fauzi_001',
    category_id: 'cat_03',
    monthly_limit: 2000000,
    month_year: '2026-10',
    spent: 1720000, // 86% -> Trigger > 80% warning
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bud_03',
    user_id: 'usr_demo_fauzi_001',
    category_id: 'cat_02',
    monthly_limit: 1000000,
    month_year: '2026-10',
    spent: 450000, // 45% -> Safe
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bud_04',
    user_id: 'usr_demo_fauzi_001',
    category_id: 'cat_05',
    monthly_limit: 800000,
    month_year: '2026-10',
    spent: 600000, // 75%
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_AI_PROVIDERS: AIProvider[] = [
  {
    id: 'prov_01',
    name: 'Google Gemini Flash (Default)',
    provider_type: 'gemini',
    api_key: 'AIzaSyD...demo',
    model_name: 'gemini-1.5-flash',
    is_active: true,
    priority: 1,
    config: { temperature: 0.1, maxOutputTokens: 1024 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prov_02',
    name: 'OpenAI GPT-4o-mini (Failover 1)',
    provider_type: 'openai',
    api_key: 'sk-proj-...demo',
    model_name: 'gpt-4o-mini',
    is_active: true,
    priority: 2,
    config: { temperature: 0.2 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prov_03',
    name: 'DeepSeek V3 (Failover 2)',
    provider_type: 'deepseek',
    api_key: 'sk-deepseek-...demo',
    model_name: 'deepseek-chat',
    is_active: true,
    priority: 3,
    config: { temperature: 0.1 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_AI_LOGS: AILog[] = [
  {
    id: 'log_01',
    user_id: 'usr_demo_fauzi_001',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    prompt_tokens: 142,
    completion_tokens: 38,
    latency_ms: 412,
    purpose: 'nlp_parse',
    status: 'success',
    estimated_cost: 0.000045,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    user_email: 'fauzi@tatadana.id',
  },
  {
    id: 'log_02',
    user_id: 'usr_demo_fauzi_001',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    prompt_tokens: 450,
    completion_tokens: 95,
    latency_ms: 1120,
    purpose: 'ocr_receipt',
    status: 'success',
    estimated_cost: 0.000150,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    user_email: 'fauzi@tatadana.id',
  },
  {
    id: 'log_03',
    user_id: 'usr_demo_fauzi_001',
    provider: 'openai',
    model: 'whisper-1',
    prompt_tokens: 0,
    completion_tokens: 0,
    latency_ms: 890,
    purpose: 'voice_stt',
    status: 'success',
    estimated_cost: 0.000600,
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    user_email: 'fauzi@tatadana.id',
  },
  {
    id: 'log_04',
    user_id: 'usr_demo_fauzi_001',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    prompt_tokens: 580,
    completion_tokens: 160,
    latency_ms: 680,
    purpose: 'advisor',
    status: 'success',
    estimated_cost: 0.000095,
    created_at: new Date(Date.now() - 240 * 60000).toISOString(),
    user_email: 'fauzi@tatadana.id',
  },
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_01',
    user_id: 'usr_demo_fauzi_001',
    plan: 'pro',
    status: 'active',
    start_date: new Date(Date.now() - 15 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 15 * 86400000).toISOString(),
    midtrans_order_id: 'MID-SUB-202610-0912',
    payment_type: 'gopay',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    user: MOCK_USER,
  },
  {
    id: 'sub_02',
    user_id: 'usr_demo_002',
    plan: 'starter',
    status: 'active',
    start_date: new Date(Date.now() - 50 * 86400000).toISOString(),
    end_date: null,
    midtrans_order_id: null,
    payment_type: 'free',
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      id: 'usr_demo_002',
      full_name: 'Budi Santoso',
      email: 'budi.santoso@gmail.com',
      phone: '085711223344',
      subscription_tier: 'starter',
      is_admin: false,
      approval_status: 'approved',
      created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'sub_03',
    user_id: 'usr_demo_003',
    plan: 'pro',
    status: 'active',
    start_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 28 * 86400000).toISOString(),
    midtrans_order_id: 'MID-SUB-202610-1849',
    payment_type: 'bca_va',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      id: 'usr_demo_003',
      full_name: 'Siti Rahmawati',
      email: 'siti.rahma@yahoo.co.id',
      phone: '081399887766',
      subscription_tier: 'pro',
      is_admin: false,
      approval_status: 'approved',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'sub_04',
    user_id: 'usr_demo_004',
    plan: 'starter',
    status: 'pending',
    start_date: new Date(Date.now() - 2 * 3600000).toISOString(),
    end_date: null,
    midtrans_order_id: null,
    payment_type: 'free',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      id: 'usr_demo_004',
      full_name: 'Dewi Lestari',
      email: 'dewi.lestari@gmail.com',
      phone: '081298765432',
      subscription_tier: 'starter',
      is_admin: false,
      approval_status: 'pending_approval',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export const MOCK_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'aud_01',
    admin_user_id: 'usr_demo_admin_001',
    target_user_id: 'usr_demo_fauzi_001',
    action: 'INSPECT_TRANSACTIONS',
    details: { reason: 'User requested assistance with receipt OCR tag mismatch' },
    ip_address: '114.122.35.18',
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    admin_email: 'admin@tatadana.id',
  },
  {
    id: 'aud_02',
    admin_user_id: 'usr_demo_admin_001',
    target_user_id: 'usr_demo_003',
    action: 'APPROVE_PAYMENT',
    details: { plan: 'pro', amount: 49000, method: 'bca_va' },
    ip_address: '114.122.35.18',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    admin_email: 'admin@tatadana.id',
  },
];

export const MOCK_EXPORTS: ExportHistory[] = [
  {
    id: 'exp_01',
    user_id: 'usr_demo_fauzi_001',
    file_name: 'Laporan_Keuangan_TataDana_Oktober_2026.pdf',
    file_url: '/api/reports/export?format=pdf',
    file_type: 'pdf',
    period_range: '1 Okt 2026 - 31 Okt 2026',
    status: 'completed',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'exp_02',
    user_id: 'usr_demo_fauzi_001',
    file_name: 'Laporan_Keuangan_TataDana_September_2026.xlsx',
    file_url: '/api/reports/export?format=xlsx',
    file_type: 'xlsx',
    period_range: '1 Sep 2026 - 30 Sep 2026',
    status: 'completed',
    created_at: new Date(Date.now() - 32 * 86400000).toISOString(),
  },
];

// Persistent LocalStorage and In-Memory state management
const STORAGE_KEY = 'tatadana_store_state_v2';

class DemoStore {
  private user: Profile = { ...MOCK_USER, approval_status: 'approved' };
  private users: Profile[] = [
    { ...MOCK_USER, approval_status: 'approved' },
    { ...MOCK_SUBSCRIPTIONS[1].user!, approval_status: 'approved' },
    { ...MOCK_SUBSCRIPTIONS[2].user!, approval_status: 'approved' },
    { ...MOCK_SUBSCRIPTIONS[3].user!, approval_status: 'pending_approval' },
  ];
  private wallets: Wallet[] = [...MOCK_WALLETS];
  private categories: Category[] = [...MOCK_CATEGORIES];
  private transactions: Transaction[] = [...MOCK_TRANSACTIONS];
  private budgets: Budget[] = [...MOCK_BUDGETS];
  private aiProviders: AIProvider[] = [...MOCK_AI_PROVIDERS];
  private aiLogs: AILog[] = [...MOCK_AI_LOGS];
  private subscriptions: Subscription[] = [...MOCK_SUBSCRIPTIONS];
  private auditLogs: AdminAuditLog[] = [...MOCK_AUDIT_LOGS];
  private exports: ExportHistory[] = [...MOCK_EXPORTS];
  private impersonatedUser: Profile | null = null;
  private failoverMode: boolean = true;
  private isInitialized: boolean = false;
  private processedTelegramUpdates: Set<number> = new Set<number>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.ensureInitialized();
    }
  }

  ensureInitialized(): void {
    if (this.isInitialized) return;
    if (typeof window !== 'undefined') {
      this.isInitialized = true;
      this.loadFromStorage();
    }
  }

  loadFromStorage(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.user) this.user = data.user;
      if (Array.isArray(data.users)) this.users = data.users;
      else if (data.user) this.users = [data.user, ...MOCK_SUBSCRIPTIONS.map((s) => s.user!).filter(Boolean)];
      if (Array.isArray(data.wallets)) this.wallets = data.wallets;
      if (Array.isArray(data.categories)) this.categories = data.categories;
      if (Array.isArray(data.transactions)) this.transactions = data.transactions;
      if (Array.isArray(data.budgets)) this.budgets = data.budgets;
      if (Array.isArray(data.aiProviders)) this.aiProviders = data.aiProviders;
      if (Array.isArray(data.aiLogs)) this.aiLogs = data.aiLogs;
      if (Array.isArray(data.subscriptions)) this.subscriptions = data.subscriptions;
      if (Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;
      if (Array.isArray(data.exports)) this.exports = data.exports;
      if (data.failoverMode !== undefined) this.failoverMode = data.failoverMode;
      return true;
    } catch (e) {
      console.warn('Failed to load TataDana store from localStorage:', e);
      return false;
    }
  }

  saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        user: this.user,
        users: this.users,
        wallets: this.wallets,
        categories: this.categories,
        transactions: this.transactions,
        budgets: this.budgets,
        aiProviders: this.aiProviders,
        aiLogs: this.aiLogs,
        subscriptions: this.subscriptions,
        auditLogs: this.auditLogs,
        exports: this.exports,
        failoverMode: this.failoverMode,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save TataDana store to localStorage:', e);
    }
  }

  notifyChange(type: string = 'store_updated'): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tatadana:realtime', {
          detail: { type, timestamp: new Date().toISOString() },
        })
      );
    }
  }

  resetToCleanAccount(name?: string, email?: string, phone?: string): void {
    const newUserId = `usr_${Date.now()}`;
    this.user = {
      id: newUserId,
      full_name: name || 'Pengguna Baru',
      email: email || 'user@tatadana.id',
      phone: phone || '081234567890',
      telegram_chat_id: undefined,
      telegram_username: undefined,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      subscription_tier: 'starter',
      is_admin: false,
      approval_status: 'pending_approval', // Wajib persetujuan Admin sebelum akses dashboard
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update users directory
    const existingIdx = this.users.findIndex((u) => u.email === this.user.email);
    if (existingIdx >= 0) {
      this.users[existingIdx] = { ...this.user };
    } else {
      this.users.unshift({ ...this.user });
    }

    // Add subscription entry for Admin review
    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      user_id: newUserId,
      plan: 'starter',
      status: 'pending',
      start_date: new Date().toISOString(),
      end_date: null,
      midtrans_order_id: null,
      payment_type: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: { ...this.user },
    };
    const subIdx = this.subscriptions.findIndex((s) => s.user?.email === this.user.email);
    if (subIdx >= 0) {
      this.subscriptions[subIdx] = newSub;
    } else {
      this.subscriptions.unshift(newSub);
    }

    const defaultWalletId = `wal_${Date.now()}_tunai`;
    this.wallets = [
      {
        id: defaultWalletId,
        user_id: newUserId,
        name: 'Tunai Dompet',
        type: 'cash',
        balance: 0,
        is_default: true,
        icon: 'Banknote',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    this.categories = MOCK_CATEGORIES.map((c) => ({
      ...c,
      user_id: newUserId,
    }));

    // Zero transactions
    this.transactions = [];

    // Budgets reset with 0 spent
    this.budgets = [
      {
        id: `bud_${Date.now()}_1`,
        user_id: newUserId,
        category_id: 'cat_01',
        monthly_limit: 1500000,
        month_year: new Date().toISOString().slice(0, 7),
        spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `bud_${Date.now()}_2`,
        user_id: newUserId,
        category_id: 'cat_02',
        monthly_limit: 500000,
        month_year: new Date().toISOString().slice(0, 7),
        spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `bud_${Date.now()}_3`,
        user_id: newUserId,
        category_id: 'cat_03',
        monthly_limit: 1000000,
        month_year: new Date().toISOString().slice(0, 7),
        spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    this.exports = [];
    this.impersonatedUser = null;
    this.saveToStorage();
    this.notifyChange('clean_account_initialized');
  }

  loadSampleData(): void {
    this.user = { ...MOCK_USER, approval_status: 'approved' };
    this.users = [
      { ...MOCK_USER, approval_status: 'approved' },
      { ...MOCK_SUBSCRIPTIONS[1].user!, approval_status: 'approved' },
      { ...MOCK_SUBSCRIPTIONS[2].user!, approval_status: 'approved' },
      { ...MOCK_SUBSCRIPTIONS[3].user!, approval_status: 'pending_approval' },
    ];
    this.wallets = JSON.parse(JSON.stringify(MOCK_WALLETS));
    this.categories = JSON.parse(JSON.stringify(MOCK_CATEGORIES));
    this.transactions = JSON.parse(JSON.stringify(MOCK_TRANSACTIONS));
    this.budgets = JSON.parse(JSON.stringify(MOCK_BUDGETS));
    this.subscriptions = JSON.parse(JSON.stringify(MOCK_SUBSCRIPTIONS));
    this.exports = JSON.parse(JSON.stringify(MOCK_EXPORTS));
    this.impersonatedUser = null;
    this.saveToStorage();
    this.notifyChange('sample_data_loaded');
  }

  getUsers(): Profile[] {
    this.ensureInitialized();
    return this.users;
  }

  getPendingUsers(): Profile[] {
    this.ensureInitialized();
    return this.users.filter((u) => u.approval_status === 'pending_approval');
  }

  approveUser(userId: string): boolean {
    this.ensureInitialized();
    const approvedAt = new Date().toISOString();

    const u = this.users.find((user) => user.id === userId);
    if (u) {
      u.approval_status = 'approved';
      u.approved_at = approvedAt;
      u.rejection_reason = null;
    }

    const sub = this.subscriptions.find((s) => s.user_id === userId || s.user?.id === userId);
    if (sub) {
      sub.status = 'active';
      if (sub.user) {
        sub.user.approval_status = 'approved';
        sub.user.approved_at = approvedAt;
        sub.user.rejection_reason = null;
      }
    }

    if (this.user.id === userId) {
      this.user.approval_status = 'approved';
      this.user.approved_at = approvedAt;
      this.user.rejection_reason = null;
    }

    if (this.impersonatedUser && this.impersonatedUser.id === userId) {
      this.impersonatedUser.approval_status = 'approved';
      this.impersonatedUser.approved_at = approvedAt;
      this.impersonatedUser.rejection_reason = null;
    }

    this.addAuditLog('APPROVE_USER', userId, {
      approved_at: approvedAt,
      action: 'ADMIN_ACC_USER',
      target_user: u?.full_name || userId,
    });

    this.saveToStorage();
    this.notifyChange('user_approved');
    return true;
  }

  rejectUser(userId: string, reason?: string): boolean {
    this.ensureInitialized();
    const rejectReason = reason || 'Data pendaftaran belum memenuhi syarat verifikasi keamanan.';

    const u = this.users.find((user) => user.id === userId);
    if (u) {
      u.approval_status = 'rejected';
      u.rejection_reason = rejectReason;
    }

    const sub = this.subscriptions.find((s) => s.user_id === userId || s.user?.id === userId);
    if (sub) {
      sub.status = 'cancelled';
      if (sub.user) {
        sub.user.approval_status = 'rejected';
        sub.user.rejection_reason = rejectReason;
      }
    }

    if (this.user.id === userId) {
      this.user.approval_status = 'rejected';
      this.user.rejection_reason = rejectReason;
    }

    if (this.impersonatedUser && this.impersonatedUser.id === userId) {
      this.impersonatedUser.approval_status = 'rejected';
      this.impersonatedUser.rejection_reason = rejectReason;
    }

    this.addAuditLog('REJECT_USER', userId, {
      rejected_at: new Date().toISOString(),
      reason: rejectReason,
      target_user: u?.full_name || userId,
    });

    this.saveToStorage();
    this.notifyChange('user_rejected');
    return true;
  }

  isCleanAccount(): boolean {
    this.ensureInitialized();
    return this.transactions.length === 0;
  }

  isDemoData(): boolean {
    this.ensureInitialized();
    return this.user.id === 'usr_demo_fauzi_001' && this.transactions.some((t) => t.id === 'tx_01');
  }

  getUser(): Profile {
    this.ensureInitialized();
    return this.impersonatedUser || this.user;
  }

  getAdminUser(): Profile {
    return MOCK_ADMIN;
  }

  updateUser(updates: Partial<Profile>): Profile {
    this.ensureInitialized();
    if (this.impersonatedUser) {
      this.impersonatedUser = { ...this.impersonatedUser, ...updates, updated_at: new Date().toISOString() };
      this.saveToStorage();
      this.notifyChange('user_updated');
      return this.impersonatedUser;
    }
    this.user = { ...this.user, ...updates, updated_at: new Date().toISOString() };
    this.saveToStorage();
    this.notifyChange('user_updated');
    return this.user;
  }

  isImpersonating(): boolean {
    return this.impersonatedUser !== null;
  }

  impersonate(targetUserId: string | null): void {
    this.ensureInitialized();
    if (!targetUserId) {
      this.impersonatedUser = null;
      return;
    }
    const foundSub = this.subscriptions.find((s) => s.user_id === targetUserId);
    if (foundSub?.user) {
      this.impersonatedUser = foundSub.user;
    } else {
      this.impersonatedUser = {
        ...MOCK_USER,
        id: targetUserId,
        full_name: `User (${targetUserId})`,
      };
    }
    this.addAuditLog('IMPERSONATE_START', targetUserId, { targetUserId });
  }

  getWallets(): Wallet[] {
    this.ensureInitialized();
    return this.wallets;
  }

  addWallet(wallet: Omit<Wallet, 'id' | 'created_at' | 'updated_at'>): Wallet {
    this.ensureInitialized();
    const newW: Wallet = {
      ...wallet,
      id: `wal_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (newW.is_default) {
      this.wallets.forEach((w) => (w.is_default = false));
    }
    this.wallets.push(newW);
    this.saveToStorage();
    this.notifyChange('wallet_added');
    return newW;
  }

  updateWallet(id: string, updates: Partial<Wallet>): Wallet | undefined {
    this.ensureInitialized();
    const idx = this.wallets.findIndex((w) => w.id === id);
    if (idx === -1) return undefined;
    if (updates.is_default) {
      this.wallets.forEach((w) => (w.is_default = false));
    }
    this.wallets[idx] = { ...this.wallets[idx], ...updates, updated_at: new Date().toISOString() };
    this.saveToStorage();
    this.notifyChange('wallet_updated');
    return this.wallets[idx];
  }

  deleteWallet(id: string): boolean {
    this.ensureInitialized();
    const idx = this.wallets.findIndex((w) => w.id === id);
    if (idx === -1) return false;
    this.wallets.splice(idx, 1);
    this.saveToStorage();
    this.notifyChange('wallet_deleted');
    return true;
  }

  getCategories(): Category[] {
    this.ensureInitialized();
    return this.categories;
  }

  addCategory(category: Omit<Category, 'id' | 'created_at'>): Category {
    this.ensureInitialized();
    const newCat: Category = {
      ...category,
      id: `cat_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.categories.push(newCat);
    this.saveToStorage();
    this.notifyChange('category_added');
    return newCat;
  }

  getTransactions(): Transaction[] {
    this.ensureInitialized();
    return this.transactions
      .map((t) => ({
        ...t,
        wallet: this.wallets.find((w) => w.id === t.wallet_id),
        category: this.categories.find((c) => c.id === t.category_id),
        destination_wallet: t.destination_wallet_id
          ? this.wallets.find((w) => w.id === t.destination_wallet_id)
          : undefined,
      }))
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }

  addTransaction(tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Transaction {
    this.ensureInitialized();
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update wallet balance automatically
    const wallet = this.wallets.find((w) => w.id === tx.wallet_id);
    if (wallet) {
      if (tx.type === 'income') {
        wallet.balance += tx.amount;
      } else if (tx.type === 'expense') {
        wallet.balance -= tx.amount;
      } else if (tx.type === 'transfer' && tx.destination_wallet_id) {
        wallet.balance -= tx.amount;
        const dest = this.wallets.find((w) => w.id === tx.destination_wallet_id);
        if (dest) dest.balance += tx.amount;
      }
    }

    // Update budget spent if expense
    if (tx.type === 'expense' && tx.category_id) {
      const budget = this.budgets.find((b) => b.category_id === tx.category_id);
      if (budget) {
        budget.spent = (budget.spent || 0) + tx.amount;
      }
    }

    this.transactions.unshift(newTx);
    this.saveToStorage();
    this.notifyChange('transaction_added');
    return newTx;
  }

  deleteTransaction(id: string): boolean {
    this.ensureInitialized();
    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    const tx = this.transactions[idx];
    const wallet = this.wallets.find((w) => w.id === tx.wallet_id);
    if (wallet) {
      if (tx.type === 'income') wallet.balance -= tx.amount;
      else if (tx.type === 'expense') wallet.balance += tx.amount;
      else if (tx.type === 'transfer' && tx.destination_wallet_id) {
        wallet.balance += tx.amount;
        const dest = this.wallets.find((w) => w.id === tx.destination_wallet_id);
        if (dest) dest.balance -= tx.amount;
      }
    }
    this.transactions.splice(idx, 1);
    this.saveToStorage();
    this.notifyChange('transaction_deleted');
    return true;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    this.ensureInitialized();
    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;

    const oldTx = this.transactions[idx];

    // Revert old transaction wallet balance effect
    const oldWallet = this.wallets.find((w) => w.id === oldTx.wallet_id);
    if (oldWallet) {
      if (oldTx.type === 'income') oldWallet.balance -= oldTx.amount;
      else if (oldTx.type === 'expense') oldWallet.balance += oldTx.amount;
      else if (oldTx.type === 'transfer' && oldTx.destination_wallet_id) {
        oldWallet.balance += oldTx.amount;
        const oldDest = this.wallets.find((w) => w.id === oldTx.destination_wallet_id);
        if (oldDest) oldDest.balance -= oldTx.amount;
      }
    }

    // Merge updates
    const updatedTx: Transaction = {
      ...oldTx,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Apply new transaction wallet balance effect
    const newWallet = this.wallets.find((w) => w.id === updatedTx.wallet_id);
    if (newWallet) {
      if (updatedTx.type === 'income') newWallet.balance += updatedTx.amount;
      else if (updatedTx.type === 'expense') newWallet.balance -= updatedTx.amount;
      else if (updatedTx.type === 'transfer' && updatedTx.destination_wallet_id) {
        newWallet.balance -= updatedTx.amount;
        const newDest = this.wallets.find((w) => w.id === updatedTx.destination_wallet_id);
        if (newDest) newDest.balance += updatedTx.amount;
      }
    }

    this.transactions[idx] = updatedTx;
    this.saveToStorage();
    this.notifyChange('transaction_updated');
    return updatedTx;
  }

  getBudgets(): Budget[] {
    this.ensureInitialized();
    return this.budgets.map((b) => ({
      ...b,
      category: this.categories.find((c) => c.id === b.category_id),
    }));
  }

  saveBudget(categoryId: string, monthlyLimit: number): Budget {
    this.ensureInitialized();
    const existing = this.budgets.find((b) => b.category_id === categoryId);
    if (existing) {
      existing.monthly_limit = monthlyLimit;
      existing.updated_at = new Date().toISOString();
      this.saveToStorage();
      this.notifyChange('budget_updated');
      return existing;
    }
    const newB: Budget = {
      id: `bud_${Date.now()}`,
      user_id: this.getUser().id,
      category_id: categoryId,
      monthly_limit: monthlyLimit,
      month_year: new Date().toISOString().slice(0, 7),
      spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.budgets.push(newB);
    this.saveToStorage();
    this.notifyChange('budget_saved');
    return newB;
  }

  getAIProviders(): AIProvider[] {
    this.ensureInitialized();
    return this.aiProviders;
  }

  toggleAIProvider(id: string): void {
    this.ensureInitialized();
    const p = this.aiProviders.find((prov) => prov.id === id);
    if (p) {
      p.is_active = !p.is_active;
      this.saveToStorage();
      this.notifyChange('ai_providers_updated');
    }
  }

  setFailoverMode(enabled: boolean): void {
    this.ensureInitialized();
    this.failoverMode = enabled;
    this.saveToStorage();
    this.notifyChange('failover_mode_updated');
  }

  getFailoverMode(): boolean {
    this.ensureInitialized();
    return this.failoverMode;
  }

  getAILogs(): AILog[] {
    this.ensureInitialized();
    return this.aiLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addAILog(log: Omit<AILog, 'id' | 'created_at'>): AILog {
    this.ensureInitialized();
    const newLog: AILog = {
      ...log,
      id: `log_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.aiLogs.unshift(newLog);
    this.saveToStorage();
    return newLog;
  }

  getSubscriptions(): Subscription[] {
    this.ensureInitialized();
    return this.subscriptions;
  }

  updateSubscription(id: string, status: Subscription['status']): void {
    this.ensureInitialized();
    const s = this.subscriptions.find((sub) => sub.id === id);
    if (s) {
      s.status = status;
      s.updated_at = new Date().toISOString();
      this.saveToStorage();
      this.notifyChange('subscription_updated');
    }
  }

  getAuditLogs(): AdminAuditLog[] {
    this.ensureInitialized();
    return this.auditLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addAuditLog(action: string, targetUserId?: string | null, details?: Record<string, any>): void {
    this.ensureInitialized();
    this.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      admin_user_id: MOCK_ADMIN.id,
      target_user_id: targetUserId,
      action,
      details,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
      admin_email: MOCK_ADMIN.email,
    });
    this.saveToStorage();
  }

  getExports(): ExportHistory[] {
    this.ensureInitialized();
    return this.exports;
  }

  addExport(exportItem: Omit<ExportHistory, 'id' | 'created_at'>): ExportHistory {
    this.ensureInitialized();
    const item: ExportHistory = {
      ...exportItem,
      id: `exp_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.exports.unshift(item);
    this.saveToStorage();
    this.notifyChange('export_added');
    return item;
  }

  isTelegramUpdateProcessed(updateId: number): boolean {
    return this.processedTelegramUpdates.has(updateId);
  }

  markTelegramUpdateProcessed(updateId: number): void {
    this.processedTelegramUpdates.add(updateId);
  }
}

// Singleton global mock store
export const demoStore = new DemoStore();

