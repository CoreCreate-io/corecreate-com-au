"use client";

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function HeaderWrapper() {
  const pathname = usePathname();
  const isStudioRoute = pathname?.startsWith('/studio') || pathname?.startsWith('/admin');
  
  // Only render the Header if we're not on a studio route
  if (isStudioRoute) {
    return null;
  }
  
  return <Header />;
}