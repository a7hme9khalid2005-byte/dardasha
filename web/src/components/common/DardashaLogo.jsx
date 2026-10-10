import React from 'react';

/**
 * Dardasha Official Brand Logo Component
 * 
 * Supports:
 * - variant="icon"       : The official Dark Squircle App Icon (Dark Indigo + White Bubble + Orange D-curve)
 * - variant="mark"       : Transparent D-Symbol Mark with Deep Navy bubble and Orange curve
 * - variant="full"       : Full Brand Mark + "Dardasha" Wordmark
 * - variant="badge"      : Circular / Squircle navbar badge
 */
export default function DardashaLogo({ 
  variant = 'icon', 
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | custom px
  className = '',
  showText = false,
  textColor = 'text-white'
}) {
  const sizeMap = {
    xs: { px: 24, class: 'w-6 h-6' },
    sm: { px: 32, class: 'w-8 h-8' },
    md: { px: 40, class: 'w-10 h-10' },
    lg: { px: 56, class: 'w-14 h-14' },
    xl: { px: 80, class: 'w-20 h-20' },
    '2xl': { px: 112, class: 'w-28 h-28' },
  };

  const currentSize = sizeMap[size] || { px: 40, class: size };

  // Variant: Full Logo with Wordmark
  if (variant === 'full' || showText) {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        {/* Logo App Icon Mark */}
        <div className={`relative ${currentSize.class} shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-orange-500/10 ring-1 ring-white/15 group-hover:scale-105 transition-all duration-300`}>
          <img 
            src="/app-icon.png" 
            alt="Dardasha Icon" 
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {/* Wordmark */}
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-lg sm:text-xl font-sans ${textColor}`}>
              Dardasha
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
              دردشة
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            تواصل حديث فائق الذكاء
          </span>
        </div>
      </div>
    );
  }

  // Variant: Pure Icon (App Icon / Squircle)
  if (variant === 'icon' || variant === 'badge') {
    return (
      <div 
        className={`relative ${currentSize.class} rounded-2xl overflow-hidden shadow-md shadow-indigo-950/50 ring-1 ring-white/10 shrink-0 select-none ${className}`}
      >
        <img 
          src="/app-icon.png" 
          alt="Dardasha App Icon" 
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
    );
  }

  // Variant: Vector SVG Mark (Scalable at any custom resolution)
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${currentSize.class} shrink-0 select-none ${className}`}
    >
      {/* Background squircle in dark indigo */}
      <rect width="100" height="100" rx="28" fill="#252878" />
      
      {/* Outer Orange 'D' Curve */}
      <path 
        d="M26 23H62C78 23 88 34 88 50C88 66 78 77 62 77H46C43 77 41 74.8 41 72C41 69.2 43 67 46 67H62C72 67 78 59 78 50C78 41 72 33 62 33H26C23.2 33 21 30.8 21 28C21 25.2 23.2 23 26 23Z" 
        fill="#FF5E14" 
      />

      {/* Inner White Speech Bubble */}
      <path 
        d="M24 33H53C61 33 67 39 67 47C67 55 61 61 53 61H35L22 74V41C22 36.6 24 33 24 33Z" 
        fill="#FFFFFF" 
      />

      {/* 3 Orange Dots inside the speech bubble */}
      <circle cx="34" cy="47" r="3.2" fill="#FF5E14" />
      <circle cx="44" cy="47" r="3.2" fill="#FF5E14" />
      <circle cx="54" cy="47" r="3.2" fill="#FF5E14" />
    </svg>
  );
}
