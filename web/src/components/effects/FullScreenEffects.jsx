import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function FullScreenEffects({ 
  watermarkEnabled, 
  currentUser,
  activeSeasonalEffect, // 'none', 'snow', 'fireworks', 'cosmic-dust', 'matrix'
  activeEmojiEffect,
  onClearEmojiEffect,
  reducedMotion = false
}) {

  // Trigger Full Screen Emoji FX (Item 94)
  useEffect(() => {
    if (!activeEmojiEffect) return;

    if (!reducedMotion && (activeEmojiEffect === '🎉' || activeEmojiEffect === '🔥' || activeEmojiEffect === '🚀')) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: activeEmojiEffect === '🔥' ? ['#ff4500', '#ffa500', '#ff0000'] : ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b']
      });
    }

    const timer = setTimeout(() => {
      if (onClearEmojiEffect) onClearEmojiEffect();
    }, 2500);

    return () => clearTimeout(timer);
  }, [activeEmojiEffect, onClearEmojiEffect]);

  // Seasonal Fireworks periodic burst (Item 95)
  useEffect(() => {
    if (activeSeasonalEffect !== 'fireworks' || reducedMotion) return;

    const interval = setInterval(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSeasonalEffect]);

  return (
    <>
      {/* Item 23: Anti-Camera Watermark Shield Overlay (اختياري من العميل) */}
      {watermarkEnabled && currentUser && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none opacity-20">
          <div className="w-[150%] h-[150%] -rotate-12 flex flex-wrap gap-16 p-8 font-mono text-cyan-300 text-xs font-bold">
            {Array.from({ length: 48 }).map((_, i) => (
              <span key={i} className="tracking-widest">
                DARDASHA SECURE • @{currentUser.email.split('@')[0]} • ID:{currentUser.id.substring(0, 8)} • {new Date().toLocaleDateString('ar-EG')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Item 94: Full-Screen Animated Emoji Explosions */}
      {activeEmojiEffect && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center animate-out fade-out duration-1000">
          <div className="text-8xl sm:text-9xl animate-bounce transform scale-125 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">
            {activeEmojiEffect}
          </div>
        </div>
      )}

      {/* Item 95: Seasonal Weather & Ambient Canvas Overlays */}
      {activeSeasonalEffect === 'snow' && (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-white opacity-70 animate-bounce"
              style={{
                left: `${(i * 3.3) % 100}%`,
                top: `${(i * 7) % 100}%`,
                fontSize: `${10 + (i % 15)}px`,
                animationDuration: `${2 + (i % 4)}s`
              }}
            >
              ❄️
            </div>
          ))}
        </div>
      )}

      {activeSeasonalEffect === 'cosmic-dust' && (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-cyan-300 opacity-60 animate-pulse"
              style={{
                left: `${(i * 4) % 100}%`,
                top: `${(i * 5) % 100}%`,
                fontSize: `${8 + (i % 12)}px`,
                animationDuration: `${1.5 + (i % 3)}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}
    </>
  );
}
