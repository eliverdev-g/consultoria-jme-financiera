import React from 'react';

interface AvatarProps {
  initials?: string;
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm font-semibold',
  lg: 'w-12 h-12 text-base font-bold',
};

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  name,
  src,
  size = 'md',
  className = '',
}) => {
  const getInitials = () => {
    if (initials) return initials;
    if (!name) return 'JM';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return words[0].slice(0, 2).toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-slate-800 text-white flex items-center justify-center font-medium shrink-0 border border-slate-700/50 shadow-2xs ${className}`}
    >
      {getInitials()}
    </div>
  );
};
