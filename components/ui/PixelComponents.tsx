import React from 'react'
import { ReactNode } from 'react'

// 🎨 Pixel Art Color Palette
export const pixelColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
}

// 🎯 Pixel Card Component
interface PixelCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'
}

export const PixelCard: React.FC<PixelCardProps> = ({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  color = 'primary'
}) => {
  const colorMap = {
    primary: pixelColors.primary,
    secondary: pixelColors.secondary,
    accent: pixelColors.accent,
    success: pixelColors.success,
    warning: pixelColors.warning,
    danger: pixelColors.danger,
  }

  return (
    <div 
      className={`
        pixel-card 
        ${hover ? 'hover:transform hover:-translate-y-1' : ''} 
        ${className}
      `}
      style={{
        background: gradient 
          ? `linear-gradient(135deg, ${colorMap[color]}15, ${colorMap[color]}05)`
          : 'rgba(255, 255, 255, 0.95)',
        border: `3px solid ${pixelColors.gray[200]}`,
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top gradient line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: `linear-gradient(90deg, ${pixelColors.primary}, ${pixelColors.secondary}, ${pixelColors.accent}, ${pixelColors.warning})`,
          borderRadius: '12px 12px 0 0',
        }}
      />
      {children}
    </div>
  )
}

// 🎨 Pixel Button Component
interface PixelButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'
  className?: string
  disabled?: boolean
  href?: string
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  color = 'primary',
  className = '',
  disabled = false,
  href
}) => {
  const colorMap = {
    primary: pixelColors.primary,
    secondary: pixelColors.secondary,
    accent: pixelColors.accent,
    success: pixelColors.success,
    warning: pixelColors.warning,
    danger: pixelColors.danger,
  }

  const sizeMap = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '0.9rem' },
    lg: { padding: '1rem 2rem', fontSize: '1rem' },
  }

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative' as const,
    overflow: 'hidden',
    ...sizeMap[size],
  }

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${colorMap[color]}, ${colorMap[color]}dd)`,
      color: 'white',
      boxShadow: `0 4px 12px ${colorMap[color]}30`,
    },
    outline: {
      background: 'transparent',
      color: colorMap[color],
      border: `2px solid ${colorMap[color]}`,
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: colorMap[color],
      boxShadow: 'none',
    },
  }

  const Component = href ? 'a' : 'button'

  return (
    <Component
      href={href}
      onClick={onClick}
      disabled={disabled}
      className={`pixel-button ${className}`}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </Component>
  )
}

// 🎯 Pixel Icon Component
interface PixelIconProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'
  className?: string
}

export const PixelIcon: React.FC<PixelIconProps> = ({
  children,
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const colorMap = {
    primary: `linear-gradient(135deg, ${pixelColors.primary}, ${pixelColors.secondary})`,
    secondary: `linear-gradient(135deg, ${pixelColors.secondary}, ${pixelColors.accent})`,
    accent: `linear-gradient(135deg, ${pixelColors.accent}, ${pixelColors.danger})`,
    success: `linear-gradient(135deg, ${pixelColors.success}, ${pixelColors.primary})`,
    warning: `linear-gradient(135deg, ${pixelColors.warning}, ${pixelColors.accent})`,
    danger: `linear-gradient(135deg, ${pixelColors.danger}, ${pixelColors.accent})`,
  }

  const sizeMap = {
    sm: { width: '48px', height: '48px', fontSize: '1.5rem' },
    md: { width: '64px', height: '64px', fontSize: '2rem' },
    lg: { width: '80px', height: '80px', fontSize: '2.5rem' },
  }

  return (
    <div
      className={`pixel-icon ${className}`}
      style={{
        ...sizeMap[size],
        background: colorMap[color],
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        marginBottom: '1rem',
        boxShadow: `0 4px 12px ${pixelColors.primary}30`,
        position: 'relative',
      }}
    >
      {/* Inner highlight */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: `${sizeMap[size].width.replace('px', '') - 16}px`,
          height: `${sizeMap[size].height.replace('px', '') - 16}px`,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent)',
          borderRadius: '6px',
        }}
      />
      {children}
    </div>
  )
}

// 🎨 Pixel Title Component
interface PixelTitleProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  gradient?: boolean
  className?: string
}

export const PixelTitle: React.FC<PixelTitleProps> = ({
  children,
  size = 'lg',
  gradient = true,
  className = ''
}) => {
  const sizeMap = {
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3.5rem',
  }

  return (
    <h1
      className={`pixel-title ${className}`}
      style={{
        fontSize: sizeMap[size],
        fontWeight: 700,
        background: gradient 
          ? `linear-gradient(135deg, ${pixelColors.primary}, ${pixelColors.secondary}, ${pixelColors.accent})`
          : 'inherit',
        backgroundClip: gradient ? 'text' : 'unset',
        WebkitBackgroundClip: gradient ? 'text' : 'unset',
        WebkitTextFillColor: gradient ? 'transparent' : 'inherit',
        color: gradient ? 'transparent' : pixelColors.gray[800],
        textAlign: 'center',
        marginBottom: '1rem',
        lineHeight: 1.2,
      }}
    >
      {children}
    </h1>
  )
}

// 🎯 Pixel Stats Component
interface PixelStatsProps {
  stats: Array<{
    number: string | number
    label: string
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'
  }>
  className?: string
}

export const PixelStats: React.FC<PixelStatsProps> = ({ stats, className = '' }) => {
  const colorMap = {
    primary: pixelColors.primary,
    secondary: pixelColors.secondary,
    accent: pixelColors.accent,
    success: pixelColors.success,
    warning: pixelColors.warning,
    danger: pixelColors.danger,
  }

  return (
    <div className={`pixel-stats grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="pixel-stat-card"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: `2px solid ${pixelColors.gray[200]}`,
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top color line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: colorMap[stat.color || 'primary'],
              borderRadius: '12px 12px 0 0',
            }}
          />
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: pixelColors.gray[800],
              marginBottom: '0.5rem',
            }}
          >
            {stat.number}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: pixelColors.gray[500],
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// 🎨 Pixel Section Component
interface PixelSectionProps {
  children: ReactNode
  className?: string
  background?: 'white' | 'gray' | 'gradient'
}

export const PixelSection: React.FC<PixelSectionProps> = ({
  children,
  className = '',
  background = 'white'
}) => {
  const backgroundMap = {
    white: 'transparent',
    gray: pixelColors.gray[50],
    gradient: `linear-gradient(135deg, ${pixelColors.primary}05, ${pixelColors.secondary}05)`,
  }

  return (
    <section
      className={`pixel-section ${className}`}
      style={{
        padding: '4rem 0',
        background: backgroundMap[background],
      }}
    >
      {children}
    </section>
  )
}

// 🎯 Pixel Grid Component
interface PixelGridProps {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const PixelGrid: React.FC<PixelGridProps> = ({
  children,
  cols = 3,
  gap = 'md',
  className = ''
}) => {
  const gapMap = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem',
  }

  return (
    <div
      className={`pixel-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${280 / cols}px, 1fr))`,
        gap: gapMap[gap],
      }}
    >
      {children}
    </div>
  )
}