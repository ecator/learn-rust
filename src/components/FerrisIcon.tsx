import React from 'react';

interface FerrisIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const FerrisIcon: React.FC<FerrisIconProps> = ({
  size = 32,
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-label="Ferris the Rust Crab"
      className={className}
      {...props}
    >
      {/* Body shell */}
      <ellipse cx="32" cy="36" rx="20" ry="16" fill="#CE412B" />
      {/* Shell accent / shadow */}
      <ellipse cx="32" cy="39" rx="16" ry="12" fill="#B33621" opacity="0.4" />

      {/* Left Claws */}
      <path
        d="M16 32 C10 28, 4 22, 6 16 C8 10, 16 12, 18 18 C20 12, 26 14, 24 20 C22 25, 18 28, 16 32 Z"
        fill="#CE412B"
      />
      {/* Right Claws */}
      <path
        d="M48 32 C54 28, 60 22, 58 16 C56 10, 48 12, 46 18 C44 12, 38 14, 40 20 C42 25, 46 28, 48 32 Z"
        fill="#CE412B"
      />

      {/* Legs */}
      <path d="M18 46 C12 50, 10 54, 8 58" stroke="#B33621" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 49 C18 54, 16 58, 16 62" stroke="#B33621" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 46 C52 50, 54 54, 56 58" stroke="#B33621" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 49 C46 54, 48 58, 48 62" stroke="#B33621" strokeWidth="3" strokeLinecap="round" />

      {/* Eyes */}
      <circle cx="26" cy="26" r="6" fill="#FFFFFF" />
      <circle cx="38" cy="26" r="6" fill="#FFFFFF" />
      <circle cx="27" cy="26" r="3" fill="#1E293B" />
      <circle cx="39" cy="26" r="3" fill="#1E293B" />
      <circle cx="25.5" cy="24.5" r="1.2" fill="#FFFFFF" />
      <circle cx="37.5" cy="24.5" r="1.2" fill="#FFFFFF" />

      {/* Smile */}
      <path d="M28 38 Q32 42 36 38" stroke="#7C2012" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
};
