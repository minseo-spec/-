import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section className={`rounded-lg border border-line/80 bg-white/85 p-5 shadow-soft backdrop-blur ${className}`}>
      {children}
    </section>
  );
}
