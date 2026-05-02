import { LoadingSpinner } from "./LoadingSpinner";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({ 
  message = "Loading...", 
  size = "md", 
  className = "" 
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <LoadingSpinner size={size} />
      {message && (
        <p className="mt-4 text-sand/60 text-sm font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
