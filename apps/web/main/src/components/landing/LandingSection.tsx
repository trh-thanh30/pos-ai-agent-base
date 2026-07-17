// eslint-disable-next-line filenames/match-regex
import type { ReactNode } from 'react';

export const LANDING_CONTAINER_CLASS =
  'mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 2xl:px-10';

type LandingContainerProps = {
  children: ReactNode;
  className?: string;
};

export function LandingContainer({ children, className = '' }: LandingContainerProps) {
  return <div className={`${LANDING_CONTAINER_CLASS} ${className}`}>{children}</div>;
}

type LandingSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: 'white' | 'soft' | 'dark';
};

export function LandingSection({
  id,
  children,
  className = '',
  tone = 'white',
}: LandingSectionProps) {
  const tones = {
    white: 'bg-white py-16 sm:py-24',
    soft: 'bg-[#f6f8fb] py-16 sm:py-24',
    dark: 'bg-[#06172f] text-white py-16 sm:py-24',
  };

  return (
    <section id={id} className={`${tones[tone]} scroll-mt-24 ${className}`}>
      <LandingContainer>{children}</LandingContainer>
    </section>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  dark?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className={`mx-auto max-w-3xl ${align === 'center' ? 'text-center' : 'text-left'}`}>
      {eyebrow && (
        <p
          className={`mb-3 text-sm font-semibold uppercase tracking-[0.16em] ${
            dark ? 'text-cyan-200' : 'text-pos-blue-500'
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-3xl font-bold sm:text-4xl lg:text-5xl ${
          dark ? 'text-white' : 'text-slate-950'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base leading-7 sm:text-lg ${
            dark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
