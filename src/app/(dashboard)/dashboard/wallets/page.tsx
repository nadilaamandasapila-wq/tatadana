import { redirect } from 'next/navigation';

export default function DashboardWalletsRedirect() {
  redirect('/wallets');
}
