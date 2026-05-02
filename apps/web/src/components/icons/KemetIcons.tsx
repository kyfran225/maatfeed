import React from 'react';

interface IconProps {
  className?: string;
}

export const EyeHorusIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M8 16c1.5 1 4.5 1 6 0" />
    <path d="M10 17.5c0 1-1 2-2 2" />
  </svg>
);

export const CompassKemetIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.5L10 14l4.5-1.5 1.5-4.5z" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

export const CommunityTribeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="8" r="1.2" />
    <circle cx="16" cy="13" r="1.2" />
    <circle cx="8" cy="13" r="1.2" />
    <path d="M12 9.5v2" />
    <path d="M10 13l-2 1" />
    <path d="M14 13l2 1" />
  </svg>
);

export const AnkhAudioIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <ellipse cx="12" cy="6" rx="3" ry="4" />
    <path d="M12 10v8" />
    <path d="M9 13h6" />
    <path d="M17 10c1 1 1 3 0 4" />
    <path d="M19 9c1.5 2 1.5 4 0 6" />
  </svg>
);

export const MaskProfileIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 3h12l1 6c0 6-3 10-7 12-4-2-7-6-7-12l1-6z" />
    <circle cx="9" cy="11" r="1" />
    <circle cx="15" cy="11" r="1" />
    <path d="M12 12v2" />
    <path d="M10 16c1.5 1 2.5 1 4 0" />
  </svg>
);
