import { redirect } from 'next/navigation';

export default function DashboardTransactionsRedirect() {
  redirect('/transactions');
}
