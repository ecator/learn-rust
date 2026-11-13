import React from 'react';

export type FerrisMood =
  | 'happy'
  | 'confused'
  | 'safety'
  | 'panic'
  | 'detective'
  | 'speed'
  | 'wizard';

export interface FerrisProps extends Omit<React.SVGProps<SVGSVGElement>, 'size'> {
  mood?: FerrisMood;
  size?: number | string;
  className?: string;
}

export const Ferris: React.FC<FerrisProps> = ({
  mood = 'happy',
  size = 64,
  className = '',
  ...props
}) => {
  const safeMood: FerrisMood =
    ['happy', 'confused', 'safety', 'panic', 'detective', 'speed', 'wizard'].includes(mood)
      ? mood
      : 'happy';

  const safeSize =
    typeof size === 'number' && Number.isFinite(size)
      ? Math.max(0, size)
      : size === 'xs'
      ? 24
      : size === 'sm'
      ? 36
      : size === 'md'
      ? 48
      : size === 'lg'
      ? 64
      : size === 'xl'
      ? 80
      : typeof size === 'string' && !isNaN(Number(size))
      ? Math.max(0, Number(size))
      : 64;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={safeSize}
      height={safeSize}
      fill="none"
      role="img"
      aria-label={`Ferris the Crab (${safeMood})`}
      data-testid={`ferris-mascot-${safeMood}`}
      className={className}
      {...props}
    >
      {/* Background accessories */}
      {safeMood === 'wizard' && (
        <g data-testid="wizard-accessories">
          {/* Wizard Hat */}
          <path d="M22 22 L32 4 L42 22 Z" fill="#7E22CE" stroke="#581C87" strokeWidth="1" />
          <polygon points="32,7 34,11 38,11 35,13 36,17 32,15 28,17 29,13 26,11 30,11" fill="#FACC15" />
          <ellipse cx="32" cy="22" rx="14" ry="3" fill="#6B21A8" />
        </g>
      )}

      {safeMood === 'safety' && (
        <g data-testid="safety-accessories">
          {/* Construction Safety Helmet */}
          <path d="M20 22 C20 12, 44 12, 44 22 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          <ellipse cx="32" cy="22" rx="15" ry="3.5" fill="#EAB308" />
          <path d="M30 12 L34 12 L34 22 L30 22 Z" fill="#CA8A04" />
          {/* Security Shield Emblem */}
          <path d="M28 35 L36 35 C36 41, 32 45, 32 45 C32 45, 28 41, 28 35 Z" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
          <path d="M30 38 L31.5 40 L34.5 37" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      )}

      {safeMood === 'detective' && (
        <g data-testid="detective-accessories">
          {/* Deerstalker Inspector Hat */}
          <ellipse cx="32" cy="22" rx="15" ry="4" fill="#92400E" />
          <path d="M20 22 C20 12, 44 12, 44 22 Z" fill="#B45309" stroke="#78350F" strokeWidth="1" />
          <path d="M29 12 C32 10, 32 10, 35 12" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Magnifying Glass */}
          <circle cx="50" cy="27" r="6" stroke="#D97706" strokeWidth="2" fill="#E0F2FE" fillOpacity="0.7" />
          <line x1="54" y1="31" x2="60" y2="37" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {safeMood === 'speed' && (
        <g data-testid="speed-accessories" stroke="#F97316" strokeWidth="2" strokeLinecap="round">
          <line x1="2" y1="28" x2="10" y2="28" />
          <line x1="0" y1="36" x2="8" y2="36" />
          <line x1="4" y1="44" x2="12" y2="44" />
        </g>
      )}

      {/* Main Body Shell */}
      <ellipse cx="32" cy="36" rx="20" ry="16" fill="#CE412B" />
      <ellipse cx="32" cy="39" rx="16" ry="12" fill="#B33621" opacity="0.4" />

      {/* Claws */}
      {safeMood === 'panic' ? (
        // Raised panic claws
        <g data-testid="panic-claws">
          <path d="M12 24 C6 18, 2 10, 8 6 C14 2, 18 10, 16 16 C20 12, 26 14, 22 22 Z" fill="#CE412B" />
          <path d="M52 24 C58 18, 62 10, 56 6 C50 2, 46 10, 48 16 C44 12, 38 14, 42 22 Z" fill="#CE412B" />
        </g>
      ) : safeMood === 'confused' ? (
        // Tilted confused claws
        <g data-testid="confused-claws">
          <path d="M14 34 C8 30, 2 24, 6 18 C10 12, 16 16, 18 20 C20 14, 26 18, 22 24 Z" fill="#CE412B" />
          <path d="M50 28 C56 22, 60 14, 54 10 C48 6, 44 12, 46 16 C42 12, 36 14, 40 20 Z" fill="#CE412B" />
        </g>
      ) : (
        // Standard claws (happy, safety, detective, speed, wizard)
        <g data-testid="standard-claws">
          <path d="M16 32 C10 28, 4 22, 6 16 C8 10, 16 12, 18 18 C20 12, 26 14, 24 20 C22 25, 18 28, 16 32 Z" fill="#CE412B" />
          <path d="M48 32 C54 28, 60 22, 58 16 C56 10, 48 12, 46 18 C44 12, 38 14, 40 20 C42 25, 46 28, 48 32 Z" fill="#CE412B" />
        </g>
      )}

      {/* Legs */}
      <path d="M18 46 C12 50, 10 54, 8 58" stroke="#B33621" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 49 C18 54, 16 58, 16 62" stroke="#B33621" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 46 C52 50, 54 54, 56 58" stroke="#B33621" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 49 C46 54, 48 58, 48 62" stroke="#B33621" strokeWidth="3" strokeLinecap="round" />

      {/* Eyes */}
      {safeMood === 'panic' ? (
        // Wide open panic eyes
        <g data-testid="panic-eyes">
          <circle cx="26" cy="25" r="7" fill="#FFFFFF" stroke="#B33621" strokeWidth="1" />
          <circle cx="38" cy="25" r="7" fill="#FFFFFF" stroke="#B33621" strokeWidth="1" />
          <circle cx="26" cy="25" r="2" fill="#1E293B" />
          <circle cx="38" cy="25" r="2" fill="#1E293B" />
        </g>
      ) : safeMood === 'confused' ? (
        // Asymmetric confused eyes
        <g data-testid="confused-eyes">
          <circle cx="26" cy="26" r="6" fill="#FFFFFF" />
          <circle cx="38" cy="24" r="7" fill="#FFFFFF" />
          <circle cx="27" cy="26" r="3" fill="#1E293B" />
          <circle cx="38" cy="23" r="3.5" fill="#1E293B" />
          {/* Question mark above head */}
          <path d="M46 12 Q48 8 51 9 Q53 11 50 14 L50 16 M50 18 L50 19" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        // Standard happy/confident eyes
        <g data-testid="happy-eyes">
          <circle cx="26" cy="26" r="6" fill="#FFFFFF" />
          <circle cx="38" cy="26" r="6" fill="#FFFFFF" />
          <circle cx="27" cy="26" r="3" fill="#1E293B" />
          <circle cx="39" cy="26" r="3" fill="#1E293B" />
          <circle cx="25.5" cy="24.5" r="1.2" fill="#FFFFFF" />
          <circle cx="37.5" cy="24.5" r="1.2" fill="#FFFFFF" />
        </g>
      )}

      {/* Mouth Expression */}
      {safeMood === 'panic' ? (
        <ellipse cx="32" cy="38" rx="4" ry="5" fill="#7C2012" />
      ) : safeMood === 'confused' ? (
        <path d="M28 39 Q32 37 36 39" stroke="#7C2012" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M28 38 Q32 42 36 38" stroke="#7C2012" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
};

export default Ferris;
