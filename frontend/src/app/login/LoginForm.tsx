'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAdmin } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { toast } from 'sonner';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastShown = useRef(false);

  // Can log in immediately without typing
  const [email, setEmail] = useState('admin@feedpulse.com');
  const [password, setPassword] = useState('admin123');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'auth_required' && !toastShown.current) {
      toastShown.current = true;
      toast.error('Please log in to access the dashboard');
      
    }
  }, [searchParams]);


  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await loginAdmin(email, password);

    if (result.success) {
      const { token } = result.data as { token: string };

      localStorage.setItem('feedpulse_token', token);

      toast.success('Login successful!');
      router.push('/dashboard');

    } else {
      setError(result.message || 'Invalid email or password');
      toast.error(`${result.message}` || 'Login failed. Please check your credentials.');
    }

    setIsLoading(false);
  };


  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* BACK LINK */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feedback Form
        </Link>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">

          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Feed<span style={{ color: '#0ba5ec' }}>Pulse</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in to the admin dashboard
            </p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@feedpulse.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gradient rounded-full font-semibold py-6 shadow-blue-glow cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* HINT */}
          <div className="mt-6 p-3 bg-neutral-300 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">
              Demo credentials are pre-filled above
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}