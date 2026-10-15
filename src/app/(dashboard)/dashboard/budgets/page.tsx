import { redirect } from 'next/navigation';

export default function DashboardBudgetsRedirect() {
  redirect('/budgets');
}
