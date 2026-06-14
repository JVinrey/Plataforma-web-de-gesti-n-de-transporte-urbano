import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getClientId } from '../utils/client-id'
import type { Tables } from '../types/database'

// =====================================================================
// Billetera (página Wallet). Datos reales en Supabase, aislados por
// client_id (modo invitado). La cuenta demo se siembra de forma
// idempotente con la función `seed_demo_account` en el primer acceso.
// =====================================================================

export type WalletRow = Tables<'wallets'>
export type TransactionRow = Tables<'wallet_transactions'>
export type PaymentMethodRow = Tables<'payment_methods'>

let seeded = false
/** Garantiza que el dispositivo tenga su cuenta demo creada (una vez por sesión). */
async function ensureSeeded() {
  if (seeded) return
  await supabase.rpc('seed_demo_account', { p_client_id: getClientId() })
  seeded = true
}

/** Saldo y tarjeta vinculada del dispositivo actual. */
export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async (): Promise<WalletRow | null> => {
      await ensureSeeded()
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('client_id', getClientId())
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

/** Historial de transacciones, de la más reciente a la más antigua. */
export function useTransactions(limit = 10) {
  return useQuery({
    queryKey: ['wallet-transactions', limit],
    queryFn: async (): Promise<TransactionRow[]> => {
      await ensureSeeded()
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('client_id', getClientId())
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data
    },
  })
}

/** Métodos de pago registrados (el predeterminado primero). */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async (): Promise<PaymentMethodRow[]> => {
      await ensureSeeded()
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('client_id', getClientId())
        .order('is_default', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

/** Recarga el saldo: registra una transacción de crédito y actualiza el saldo. */
export function useTopUp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (amount: number) => {
      const clientId = getClientId()
      const { data: wallet, error: wErr } = await supabase
        .from('wallets')
        .select('balance')
        .eq('client_id', clientId)
        .single()
      if (wErr) throw wErr

      const newBalance = Number(wallet.balance) + amount
      const { error: updErr } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('client_id', clientId)
      if (updErr) throw updErr

      const { error: txErr } = await supabase.from('wallet_transactions').insert({
        client_id: clientId,
        concept: 'Recarga de saldo',
        subtitle: 'Recarga rápida',
        amount,
        kind: 'credit',
      })
      if (txErr) throw txErr
      return newBalance
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] })
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] })
    },
  })
}
