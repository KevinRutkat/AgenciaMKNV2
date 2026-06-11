'use client'

import Image from 'next/image';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'medium', showText = true, className = '' }: LogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return { container: 'w-8 h-8', text: 'text-sm' };
      case 'large':
        return { container: 'w-16 h-16', text: 'text-2xl' };
      default:
        return { container: 'w-12 h-12', text: 'text-xl' };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo de la imagen */}
      <div className={`${sizeClasses.container} relative`}>
        <Image
          src="/LogoPNG.png"
          alt="Agencia MKN Logo"
          width={64}
          height={64}
          sizes="64px"
          quality={85}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      
      {/* Texto del logo */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-semibold text-neutral-dark ${sizeClasses.text} relative`}>
            Agencia MKN
            <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-primary-blue rounded-full transition-all duration-300 group-hover:w-full" />
          </span>
        </div>
      )}
    </div>
  );
}
