import React from 'react';

interface SoccerBallLogoProps {
  className?: string;
  size?: number;
}

export const SoccerBallLogo: React.FC<SoccerBallLogoProps> = ({ className = '', size = 36 }) => {
  return (
    <div
      className={`rounded-full bg-white border border-slate-900 shadow flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.75}
        height={size * 0.75}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        <polygon points="12,7 9,9 9.5,13 14.5,13 15,9" fill="#000000" />
        <line x1="12" y1="7" x2="12" y2="2" stroke="#000000" strokeWidth="1.5" />
        <line x1="9" y1="9" x2="4.5" y2="7.5" stroke="#000000" strokeWidth="1.5" />
        <line x1="15" y1="9" x2="19.5" y2="7.5" stroke="#000000" strokeWidth="1.5" />
        <line x1="9.5" y1="13" x2="6.5" y2="17" stroke="#000000" strokeWidth="1.5" />
        <line x1="14.5" y1="13" x2="17.5" y2="17" stroke="#000000" strokeWidth="1.5" />
        <polygon points="12,22 8.5,19 15.5,19" fill="#000000" />
        <polygon points="2,12 5,16 6,10" fill="#000000" />
        <polygon points="22,12 18,10 19,16" fill="#000000" />
      </svg>
    </div>
  );
};
