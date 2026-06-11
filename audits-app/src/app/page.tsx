'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  return (
    <div className="min-h-dvh bg-[#0a0e17] text-white flex flex-col relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(#f5a623 1px, transparent 1px), linear-gradient(90deg, #f5a623 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Diagonal accent bar */}
      <div className="absolute top-0 right-0 w-[40%] h-[2px] bg-[#f5a623] opacity-60" style={{ transform: 'skewY(-8deg) translateY(120px)' }} />
      <div className="absolute top-0 right-0 w-[30%] h-[1px] bg-[#f5a623]/30 opacity-40" style={{ transform: 'skewY(-8deg) translateY(140px)' }} />

      {/* Corner bracket decoration */}
      <div className="absolute top-8 left-8">
        <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-20">
          <path d="M0 0 L40 0 L40 4 L4 4 L4 40 L0 40 Z" fill="#f5a623"/>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#f5a623] rounded-sm flex items-center justify-center">
              <span className="text-[#f5a623] text-xs font-bold">N</span>
            </div>
            <span className="text-sm font-light tracking-[0.2em] uppercase text-white/60">NCR System</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition px-4 py-2">Sign In</Link>
            <Link href="/register" className="text-sm bg-[#f5a623] text-[#0a0e17] px-4 py-2 font-medium hover:bg-[#e09510] transition">Get Access</Link>
          </nav>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col justify-center px-8 pb-20">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: text */}
              <div className="space-y-6">
                <div className="inline-block border border-[#f5a623]/30 px-3 py-1 text-xs tracking-[0.15em] uppercase text-[#f5a623] font-medium animate-fade-in">
                  Transnet Freight Rail
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                  <span className="text-white">Non-Conformance</span>
                  <br />
                  <span className="text-[#f5a623]">Reporting</span>
                </h1>
                <p className="text-white/40 text-base sm:text-lg leading-relaxed max-w-md">
                  Digital NCR management — replace paper forms with a streamlined audit and findings system built for the yard.
                </p>
                <div className="flex gap-4 pt-2">
                  <Link href="/register" className="bg-[#f5a623] text-[#0a0e17] px-6 py-3 font-medium text-sm hover:bg-[#e09510] transition inline-flex items-center gap-2">
                    Get Started
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <Link href="/login" className="border border-white/20 text-white/70 px-6 py-3 text-sm hover:border-white/40 hover:text-white transition">
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Right: visual */}
              <div className="hidden lg:flex justify-center items-center relative">
                <div className="relative w-72 h-72">
                  {/* Concentric rings */}
                  <div className="absolute inset-0 border border-[#f5a623]/10 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
                  <div className="absolute inset-4 border border-[#f5a623]/15 rounded-full" />
                  <div className="absolute inset-8 border border-[#f5a623]/20 rounded-full" />
                  <div className="absolute inset-12 border border-[#f5a623]/25 rounded-full" />
                  {/* Center block */}
                  <div className="absolute inset-[76px] bg-[#f5a623]/5 border border-[#f5a623]/30 rounded-sm flex items-center justify-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom bar */}
        <footer className="px-8 py-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex justify-between items-center text-xs text-white/20">
            <span>&copy; 2026 Transnet NCR System</span>
            <div className="flex gap-6">
              <span className="tracking-[0.1em] uppercase">Version 1.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
