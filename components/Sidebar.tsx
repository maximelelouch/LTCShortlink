'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Link as LinkIcon, BarChart3, Users, Settings, KeyRound, LogOut, Zap, Crown, Star, Award } from 'lucide-react';
import { WorkspaceSelector } from './WorkspaceSelector';

// Fonction pour obtenir le libellé du rôle
const getRoleLabel = (role: string) => {
  switch(role) {
    case 'FREE': return 'Gratuit';
    case 'STANDARD': return 'Standard';
    case 'PRO': return 'Pro';
    case 'ENTERPRISE': return 'Entreprise';
    default: return role;
  }
};

export function Sidebar() {
  const { data: session, update } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.role;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['FREE', 'STANDARD', 'PRO', 'ENTERPRISE'] },
    { href: '/dashboard/links', label: 'Liens', icon: LinkIcon, roles: ['FREE', 'STANDARD', 'PRO', 'ENTERPRISE'] },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, roles: ['STANDARD', 'PRO', 'ENTERPRISE'] },
    { href: '/dashboard/settings/api-keys', label: 'Clés API', icon: KeyRound, roles: ['PRO', 'ENTERPRISE'] },
    { href: '/dashboard/team', label: 'Gestion des membres', icon: Users, roles: ['ENTERPRISE'] },
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings, roles: ['FREE', 'STANDARD', 'PRO', 'ENTERPRISE'] },
  ];

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-indigo-600">ShortLink</h1>
        {session?.user?.role && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {getRoleLabel(session.user.role)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 border-b">
        <WorkspaceSelector />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isAllowed = userRole && item.roles.includes(userRole);
          const isActive = pathname === item.href;

          if (isAllowed) {
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium
                  ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          }
          return null; // ou une version grisée
        })}
      </nav>

      <div className="p-4 border-t mt-auto space-y-2">
        <Link 
          href="/dashboard/upgrade"
          className="flex items-center justify-center space-x-2 w-full px-3 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-colors shadow-sm"
        >
          <Zap className="w-4 h-4" />
          <span>Upgrade</span>
        </Link>
        
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}