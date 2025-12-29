'use client'

import { useEffect, useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

export default function ChristmasBanner() {
  const [showText, setShowText] = useState(false);

    useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
        document.fonts.ready.then(() => {
        setShowText(true);
        });
    } else {
        setShowText(true);
    }
    }, []);


  return (
    <section className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-600 py-1 sm:py-2 border-b border-red-700 overflow-hidden">
      {/* Estrellas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const size = 2 + Math.random() * 3;
          return (
            <div
              key={i}
              className="star absolute rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          );
        })}
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 flex items-center justify-center gap-1 z-10">
        <SparklesIcon className="h-7 w-7 text-white animate-swing icon-fade" />

        {/* Texto en SVG con animación de escritura */}
        {showText && (
          <svg
            width="240"
            height="55"
            viewBox="0 0 240 55"
            className="mt-[8px]"
          >
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="handwriting"
              fill="none"
              stroke="white"
            >
              Feliz Navidad
            </text>
          </svg>
        )}

        <SparklesIcon className="h-7 w-7 text-white animate-bounce-slow icon-fade" />
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');

        svg text {
          font-family: 'Great Vibes', cursive;
          font-size: 38px;
          paint-order: stroke fill;
        }

        .handwriting {
          fill: white;
          fill-opacity: 0;          /* Empieza sin relleno visible */
          stroke: white;
          stroke-width: 1.4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          animation: drawText 4.2s ease forwards;
        }

        @keyframes drawText {
          0% {
            stroke-dashoffset: 1200;
            fill-opacity: 0;
          }
          75% {
            stroke-dashoffset: 0;   /* Termina de escribir el trazo */
            fill-opacity: 0;        /* Aún sin relleno */
          }
          100% {
            stroke-dashoffset: 0;
            fill-opacity: 1;        /* Rellena completamente en blanco */
          }
        }

        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .animate-swing {
          animation: swing 3s ease-in-out infinite;
          display: inline-block;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
          display: inline-block;
        }

        .icon-fade {
          opacity: 0;
          animation-fill-mode: forwards;
          visibility: hidden;
        }

        .icon-fade:first-child {
          animation: fadeIn 0.4s ease-out 0.2s forwards, swing 3s ease-in-out 0.6s infinite;
        }

        .icon-fade:last-child {
          animation: fadeIn 0.4s ease-out 0.2s forwards, bounce-slow 2s ease-in-out 0.6s infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.5);
            visibility: visible;
          }
          to {
            opacity: 1;
            transform: scale(1);
            visibility: visible;
          }
        }

        .star {
          animation: twinkle 3s ease-in-out infinite;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          aspect-ratio: 1 / 1;
        }

        @keyframes twinkle {
          0%, 100% { 
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% { 
            opacity: 1;
            transform: scale(1.3);
          }
        }
      `}</style>
    </section>
  );
}