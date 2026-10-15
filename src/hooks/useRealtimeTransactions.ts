'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { demoStore } from '@/lib/mock/store';
import { Transaction, Wallet, Budget } from '@/types/database';

export interface UseRealtimeTransactionsOptions {
  userId?: string;
  onTransactionChange?: (payload: any) => void;
  onWalletChange?: (payload: any) => void;
  onBudgetChange?: (payload: any) => void;
}

export function useRealtimeTransactions(options: UseRealtimeTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Sync state from current store
  const refresh = useCallback(() => {
    try {
      const currentTxs = demoStore.getTransactions();
      const currentWallets = demoStore.getWallets();
      const currentBudgets = demoStore.getBudgets();

      setTransactions([...currentTxs]);
      setWallets([...currentWallets]);
      setBudgets([...currentBudgets]);
      setLastUpdate(new Date());
    } catch (err) {
      console.warn('Failed to refresh data from store:', err);
    }
  }, []);

  // Dispatch local custom event for cross-component realtime sync
  const notifyMutation = useCallback((eventType: string, detail?: any) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tatadana:realtime', {
          detail: { type: eventType, timestamp: new Date().toISOString(), ...detail },
        })
      );
    }
  }, []);

  // Mutation helpers that keep both demoStore and React states updated
  const addTransaction = useCallback(
    (txData: Parameters<typeof demoStore.addTransaction>[0]) => {
      const newTx = demoStore.addTransaction(txData);
      refresh();
      notifyMutation('transaction_inserted', { transaction: newTx });
      return newTx;
    },
    [refresh, notifyMutation]
  );

  const updateTransaction = useCallback(
    (id: string, updates: Parameters<typeof demoStore.updateTransaction>[1]) => {
      const updated = demoStore.updateTransaction(id, updates);
      refresh();
      notifyMutation('transaction_updated', { id, updates });
      return updated;
    },
    [refresh, notifyMutation]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      const ok = demoStore.deleteTransaction(id);
      refresh();
      notifyMutation('transaction_deleted', { id });
      return ok;
    },
    [refresh, notifyMutation]
  );

  const saveBudget = useCallback(
    (categoryId: string, monthlyLimit: number) => {
      const budget = demoStore.saveBudget(categoryId, monthlyLimit);
      refresh();
      notifyMutation('budget_updated', { categoryId, monthlyLimit });
      return budget;
    },
    [refresh, notifyMutation]
  );

  const addWallet = useCallback(
    (walletData: Parameters<typeof demoStore.addWallet>[0]) => {
      const wallet = demoStore.addWallet(walletData);
      refresh();
      notifyMutation('wallet_added', { wallet });
      return wallet;
    },
    [refresh, notifyMutation]
  );

  const updateWallet = useCallback(
    (id: string, updates: Parameters<typeof demoStore.updateWallet>[1]) => {
      const wallet = demoStore.updateWallet(id, updates);
      refresh();
      notifyMutation('wallet_updated', { id, updates });
      return wallet;
    },
    [refresh, notifyMutation]
  );

  const deleteWallet = useCallback(
    (id: string) => {
      const ok = demoStore.deleteWallet(id);
      refresh();
      notifyMutation('wallet_deleted', { id });
      return ok;
    },
    [refresh, notifyMutation]
  );

  useEffect(() => {
    // Initial fetch
    refresh();

    // Listen to local client event bus
    const handleLocalEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      refresh();
      if (options.onTransactionChange && customEvent.detail?.type?.includes('transaction')) {
        options.onTransactionChange(customEvent.detail);
      }
      if (options.onWalletChange && customEvent.detail?.type?.includes('wallet')) {
        options.onWalletChange(customEvent.detail);
      }
      if (options.onBudgetChange && customEvent.detail?.type?.includes('budget')) {
        options.onBudgetChange(customEvent.detail);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tatadana:realtime', handleLocalEvent);
      // Connected locally
      setIsConnected(true);
    }

    // Set up Supabase Realtime channel subscription if Supabase client is configured
    let channel: any = null;
    try {
      const supabase = createBrowserClient();
      if (supabase) {
        channel = supabase
          .channel('tatadana_realtime_sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'transactions' },
            (payload) => {
              refresh();
              if (options.onTransactionChange) options.onTransactionChange(payload);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'wallets' },
            (payload) => {
              refresh();
              if (options.onWalletChange) options.onWalletChange(payload);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'budgets' },
            (payload) => {
              refresh();
              if (options.onBudgetChange) options.onBudgetChange(payload);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
            }
          });
      }
    } catch (err) {
      console.warn('Supabase Realtime subscription initialized in offline mode:', err);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tatadana:realtime', handleLocalEvent);
      }
      if (channel) {
        try {
          const supabase = createBrowserClient();
          if (supabase) supabase.removeChannel(channel);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [refresh, options.onTransactionChange, options.onWalletChange, options.onBudgetChange]);

  return {
    transactions,
    wallets,
    budgets,
    isConnected,
    lastUpdate,
    refresh,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    saveBudget,
    addWallet,
    updateWallet,
    deleteWallet,
  };
}
