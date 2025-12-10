'use client';

import React, { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  opacity: number;
  size: number;
  delay: number;
  char: string;
}

const SNOW_CHARS = ['❄', '❅', '❆'];

// Distribución deseada:
// ~45% izquierda (0–20%)
// ~45% derecha (80–100%)
// ~10% centro (20–80%)
function randomSidePosition() {
  const r = Math.random();

  if (r < 0.4) {
    // Zona IZQUIERDA muy pegada al borde
    return Math.random() * 20; // 0–20%
  }
  if (r < 0.8) {
    // Zona DERECHA muy pegada al borde
    return 80 + Math.random() * 20; // 80–100%
  }
  // Solo 10% en el CENTRO (20–80%)
  return 20 + Math.random() * 60;
}

const FLAKE_COUNT = 20; // menos cantidad de copos

const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes: Snowflake[] = Array.from({ length: FLAKE_COUNT }, (_, i) => ({
      id: i,
      left: randomSidePosition(),
      animationDuration: 12 + Math.random() * 18, // 12–30s (algo más suaves)
      opacity: 0.5 + Math.random() * 0.5,        // 0.5–1
      size: 0.9 + Math.random() * 1.5,           // 0.9–2.4 rem
      delay: Math.random() * 6,                  // 0–6s
      char: SNOW_CHARS[Math.floor(Math.random() * SNOW_CHARS.length)],
    }));

    setSnowflakes(flakes);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    >
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            fontSize: `${flake.size}rem`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.animationDuration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
          }}
        >
          {flake.char}
        </div>
      ))}
    </div>
  );
};

export default Snowfall;
