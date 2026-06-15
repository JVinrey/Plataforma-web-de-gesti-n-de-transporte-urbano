import { useState } from 'react'
import { useDocumentTitle } from '../hooks/use-document-title'
import { Modal } from '../components/ui/Modal'
import {
  usePaymentMethods,
  useTopUp,
  useTransactions,
  useWallet,
} from '../hooks/use-wallet'
import type { TransactionRow } from '../hooks/use-wallet'

// =====================================================================
// WalletPage — Billetera digital del pasajero.
// Saldo, recarga rápida, historial de transacciones y métodos de pago,
// con datos reales de Supabase (wallets / wallet_transactions /
// payment_methods, aislados por dispositivo). WCAG 2.2 AA.
// =====================================================================

const QUICK_AMOUNTS = [5, 10, 20]

/** Formatea la fecha de una transacción como Hoy / Ayer / fecha corta. */
function formatTxDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const time = d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
  if (sameDay(d, now)) return `Hoy, ${time}`
  if (sameDay(d, yesterday)) return `Ayer, ${time}`
  return `${d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })}, ${time}`
}

function txIcon(tx: TransactionRow): { icon: string; tone: string } {
  if (tx.kind === 'credit') return { icon: 'payments', tone: 'bg-secondary-container text-secondary' }
  return { icon: 'directions_bus', tone: 'bg-primary-container text-on-primary-container' }
}

export default function WalletPage() {
  useDocumentTitle('Billetera')
  const { data: wallet, isLoading } = useWallet()
  const { data: transactions = [] } = useTransactions()
  const { data: methods = [] } = usePaymentMethods()
  const topUp = useTopUp()
  const [status, setStatus] = useState<string | null>(null)
  // WCAG 3.3.4: el usuario revisa y confirma antes de ejecutar la recarga.
  const [pendingAmount, setPendingAmount] = useState<number | null>(null)

  // Pide confirmación en lugar de ejecutar la transacción directamente.
  const recharge = (amount: number) => {
    setStatus(null)
    setPendingAmount(amount)
  }

  // Ejecuta la recarga ya confirmada por el usuario.
  const confirmRecharge = () => {
    if (pendingAmount === null) return
    const amount = pendingAmount
    setPendingAmount(null)
    topUp.mutate(amount, {
      onSuccess: (newBalance) =>
        setStatus(`Recarga de $${amount.toFixed(2)} aplicada. Nuevo saldo: $${newBalance.toFixed(2)}.`),
      onError: () => setStatus('No se pudo procesar la recarga. Reintenta.'),
    })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="sr-only">Billetera</h1>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-[1.6fr_1fr]">
          {/* Saldo */}
          <section
            aria-label="Saldo actual"
            className="relative overflow-hidden rounded-2xl bg-primary p-lg text-on-primary shadow-sm"
          >
            <p className="font-label-lg font-semibold uppercase tracking-wide opacity-80">Saldo Actual</p>
            <p className="mt-xs text-[56px] font-bold leading-none">
              {isLoading ? '—' : `$${Number(wallet?.balance ?? 0).toFixed(2)}`}
            </p>
            <p className="mt-lg flex items-center gap-sm font-body-md opacity-90">
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
              {wallet?.linked_card ? `Vinculado a ${wallet.linked_card}` : 'Sin tarjeta vinculada'}
            </p>
            <span
              className="material-symbols-outlined absolute right-6 top-6 text-[64px] opacity-20"
              aria-hidden="true"
            >
              account_balance_wallet
            </span>
          </section>

          {/* Recarga rápida */}
          <section
            aria-labelledby="recharge-title"
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm"
          >
            <h2 id="recharge-title" className="text-title-lg font-bold text-on-surface">
              Recarga Rápida
            </h2>
            <div className="mt-md grid grid-cols-3 gap-sm">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => recharge(amount)}
                  disabled={topUp.isPending}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest py-3 font-body-md font-bold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-60 focus-visible:outline-3"
                >
                  ${amount}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => recharge(50)}
              disabled={topUp.isPending}
              className="mt-md w-full rounded-xl bg-primary px-lg py-3 font-body-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-3"
            >
              {topUp.isPending ? 'Procesando…' : 'Recargar Otro Valor'}
            </button>
            <p role="status" aria-live="polite" className="mt-sm min-h-5 font-label-lg text-secondary">
              {status}
            </p>
          </section>

          {/* Historial de transacciones */}
          <section
            aria-labelledby="tx-title"
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 id="tx-title" className="text-title-lg font-bold text-on-surface">
                Historial de Transacciones
              </h2>
              <span className="font-label-lg font-semibold text-primary">Ver Todo</span>
            </div>
            <table className="mt-md w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th scope="col" className="pb-sm font-label-md uppercase tracking-wide text-on-surface-variant">
                    Concepto
                  </th>
                  <th scope="col" className="pb-sm font-label-md uppercase tracking-wide text-on-surface-variant">
                    Fecha
                  </th>
                  <th scope="col" className="pb-sm text-right font-label-md uppercase tracking-wide text-on-surface-variant">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {transactions.map((tx) => {
                  const { icon, tone } = txIcon(tx)
                  const credit = Number(tx.amount) >= 0
                  return (
                    <tr key={tx.id}>
                      <td className="py-md">
                        <div className="flex items-center gap-sm">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tone}`}>
                            <span className="material-symbols-outlined text-[18px]">{icon}</span>
                          </span>
                          <span>
                            <span className="block font-body-md font-bold text-on-surface">{tx.concept}</span>
                            <span className="block font-label-md text-on-surface-variant">{tx.subtitle}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-md font-body-md text-on-surface-variant">{formatTxDate(tx.created_at)}</td>
                      <td
                        className={`py-md text-right font-body-md font-bold ${
                          credit ? 'text-secondary' : 'text-error'
                        }`}
                      >
                        {credit ? '+' : '-'}${Math.abs(Number(tx.amount)).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-lg text-center font-body-md text-on-surface-variant">
                      Sin transacciones todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Métodos de pago */}
          <section
            aria-labelledby="methods-title"
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm"
          >
            <h2 id="methods-title" className="text-title-lg font-bold text-on-surface">
              Métodos de Pago
            </h2>
            <ul className="mt-md space-y-sm" role="list">
              {methods.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-low p-md"
                >
                  <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-surface-bright text-primary">
                    <span className="material-symbols-outlined">credit_card</span>
                  </span>
                  <div className="flex-1">
                    <p className="font-body-md font-bold text-on-surface">{m.brand} Card</p>
                    <p className="font-label-lg text-on-surface-variant">**** {m.last4}</p>
                  </div>
                  {m.is_default && (
                    <span className="material-symbols-outlined text-secondary" aria-label="Método predeterminado">
                      check_circle
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-md flex w-full items-center justify-center gap-sm rounded-xl border-2 border-dashed border-outline-variant px-lg py-3 font-body-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-3"
            >
              <span className="material-symbols-outlined">add</span>
              Agregar Nuevo Método
            </button>
            <div className="mt-md flex items-center gap-sm rounded-xl bg-surface-container px-md py-3">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              <p className="font-label-lg text-on-surface-variant">
                Tus transacciones están encriptadas y protegidas.
              </p>
            </div>
          </section>
      </div>

      {pendingAmount !== null && (
        <Modal isOpen onClose={() => setPendingAmount(null)} title="Confirmar recarga">
          <p className="font-body-md text-on-surface">
            ¿Confirmar recarga de <strong>${pendingAmount.toFixed(2)}</strong> a tu billetera?
          </p>
          <div className="mt-lg flex justify-end gap-sm">
            <button
              type="button"
              onClick={() => setPendingAmount(null)}
              className="rounded-xl border border-outline-variant px-lg py-2.5 font-body-md font-semibold text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-3"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmRecharge}
              className="rounded-xl bg-primary px-lg py-2.5 font-body-md font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-3"
            >
              Confirmar recarga
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
