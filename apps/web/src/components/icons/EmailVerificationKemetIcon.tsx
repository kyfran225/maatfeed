export const EmailVerificationKemetIcon = ({ className = "w-16 h-16" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Enveloppe */}
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 8l9 6 9-6" />

    {/* Œil (centre) */}
    <path d="M8 12s2-3 4-3 4 3 4 3-2 3-4 3-4-3-4-3z" />
    <circle cx="12" cy="12" r="1" />

    {/* Check */}
    <path d="M16.5 17l2 2 3-3" />
  </svg>
);
