import { cn } from "@/lib/utils";

type LoaderVariant = 'spinner' | 'target' | 'hyperdrive' | 'bars' | 'dots' | 'lightsaber';

interface StarWarsLoaderProps {
  variant?: LoaderVariant;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const StarWarsLoader = ({ 
  variant = 'spinner', 
  size = 'md',
  text,
  className 
}: StarWarsLoaderProps) => {
  const sizeClasses = {
    sm: 'scale-50',
    md: 'scale-75',
    lg: 'scale-100',
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <div className={cn("sw-spinner", sizeClasses[size])} />;
      
      case 'target':
        return <div className={cn("sw-target-loader", sizeClasses[size])} />;
      
      case 'hyperdrive':
        return <div className="sw-hyperdrive" />;
      
      case 'bars':
        return (
          <div className="sw-download-bars">
            <div className="sw-download-bar" />
            <div className="sw-download-bar" />
            <div className="sw-download-bar" />
            <div className="sw-download-bar" />
            <div className="sw-download-bar" />
          </div>
        );
      
      case 'dots':
        return (
          <div className="sw-data-dots">
            <div className="sw-data-dot" />
            <div className="sw-data-dot" />
            <div className="sw-data-dot" />
          </div>
        );
      
      case 'lightsaber':
        return <div className="sw-lightsaber-loader" />;
      
      default:
        return <div className={cn("sw-spinner", sizeClasses[size])} />;
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      {renderLoader()}
      {text && (
        <p className="font-mono text-xs text-sw-blue/70 tracking-wider animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Skeleton components for content loading
interface SkeletonProps {
  className?: string;
}

export const StarWarsSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("sw-skeleton h-4 w-full", className)} />
);

export const StarWarsSkeletonCard = ({ className }: SkeletonProps) => (
  <div className={cn("sw-panel p-4 space-y-3", className)}>
    <StarWarsSkeleton className="h-6 w-3/4" />
    <StarWarsSkeleton className="h-4 w-full" />
    <StarWarsSkeleton className="h-4 w-5/6" />
    <div className="flex gap-2 pt-2">
      <StarWarsSkeleton className="h-8 w-20" />
      <StarWarsSkeleton className="h-8 w-20" />
    </div>
  </div>
);

export const StarWarsSkeletonBalance = ({ className }: SkeletonProps) => (
  <div className={cn("flex flex-col items-center gap-2", className)}>
    <StarWarsSkeleton className="h-10 w-48" />
    <StarWarsSkeleton className="h-5 w-32" />
  </div>
);

// Full page loader
interface PageLoaderProps {
  message?: string;
}

export const StarWarsPageLoader = ({ message = "LOADING..." }: PageLoaderProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-6 sw-materialize">
      <div className="sw-target-loader" />
      <div className="text-center">
        <p className="font-display text-lg tracking-[0.3em] text-sw-blue sw-flicker">
          {message}
        </p>
        <div className="mt-4 sw-hyperdrive" />
      </div>
    </div>
  </div>
);

// Inline button loader
export const StarWarsButtonLoader = () => (
  <div className="sw-data-dots">
    <div className="sw-data-dot" />
    <div className="sw-data-dot" />
    <div className="sw-data-dot" />
  </div>
);

// Transmission effect wrapper
interface TransmissionProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const StarWarsTransmission = ({ children, loading, className }: TransmissionProps) => (
  <div className={cn(loading && "sw-transmission", className)}>
    {children}
  </div>
);
