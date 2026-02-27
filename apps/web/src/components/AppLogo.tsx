import { cn } from '@/lib/utils';

type AppLogoProps = {
  className?: string;
  imgClassName?: string;
  alt?: string;
};

export function AppLogo({ className, imgClassName, alt = 'rlist logo' }: AppLogoProps) {
  return (
    <span className={cn('inline-flex items-center justify-center', className)}>
      <img
        src="/logo-center-light.svg"
        alt={alt}
        className={cn('dark:hidden object-contain', imgClassName)}
        loading="lazy"
      />
      <img
        src="/logo-center-dark.svg"
        alt={alt}
        className={cn('hidden dark:block object-contain', imgClassName)}
        loading="lazy"
      />
    </span>
  );
}
