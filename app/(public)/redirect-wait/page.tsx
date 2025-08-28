'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUrl = searchParams.get('target');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!targetUrl) {
      router.push('/'); // Redirige si l'URL cible est manquante
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirectTimeout = setTimeout(() => {
      window.location.href = targetUrl;
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, [targetUrl, router]);

  if (!targetUrl) {
    router.push('/');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800">Redirection en cours...</h1>
        <p className="mt-4 text-gray-600">
          Vous allez être redirigé vers :
        </p>
        <p className="mt-2 text-sm font-mono bg-gray-100 p-3 rounded break-all text-indigo-700">
          {targetUrl}
        </p>
        <div className="mt-6">
          <div className="relative w-20 h-20 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
              <circle 
                className="text-indigo-600" 
                strokeWidth="10" 
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="transparent" 
                r="45" cx="50" cy="50"
                style={{
                  strokeDasharray: 283,
                  strokeDashoffset: 283 - (countdown / 5) * 283,
                  transition: 'stroke-dashoffset 1s linear'
                }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-indigo-600">
              {countdown}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RedirectWaitPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-pulse">Chargement de la redirection...</div>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}