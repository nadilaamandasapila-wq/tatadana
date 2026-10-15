export * from './database';

export interface ParsedTransaction {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category_name: string;
  notes?: string;
  destination_wallet_name?: string;
  raw_input: string;
}

export interface OCRReceiptResult {
  merchant_name: string;
  total_amount: number;
  date?: string;
  items: Array<{
    name: string;
    amount: number;
    category_name?: string;
  }>;
}

export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  remainingBudget: number;
  budgetTotal: number;
}
