"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ size = "md", text, className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={`loading-container ${className}`}>
      <div className={`spinner ${sizeClasses[size]}`}>
        <div className="spinner-inner"></div>
      </div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
}