import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return <>{children}</>;
}

// middleware.ts
export const protectedRoutes = [
  '/nominate',
  '/nominees/rate',
  '/institutions/rate',
  '/submit'
];

export function isProtectedRoute(url: string): boolean {
  return protectedRoutes.some(route => url.startsWith(route));
}