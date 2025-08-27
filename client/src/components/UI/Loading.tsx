import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  center?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  center = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const containerClass = center 
    ? 'flex flex-col items-center justify-center min-h-64' 
    : 'flex items-center gap-3';

  return (
    <div className={containerClass}>
      <div className={`spinner ${sizeClasses[size]}`} />
      {text && (
        <span className="text-secondary text-sm">{text}</span>
      )}
    </div>
  );
};

export default Loading;
