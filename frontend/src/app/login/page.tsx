'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    // Suspense is required here because LoginForm uses useSearchParams()
    // which only works client-side - without this Next.js throws a build error
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}