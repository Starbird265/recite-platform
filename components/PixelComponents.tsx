import React from 'react'
import { LucideIcon } from 'lucide-react'

// 🎮 Pixel Button Component
interface PixelButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  icon?: LucideIcon
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
  icon: Icon
}) => {
  const baseClass = 'pixel-btn'
  const variantClass = `pixel-btn-${variant}`
  const sizeClass = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  }[size]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {children}
    </button>
  )
}

// 🎯 Pixel Card Component
interface PixelCardProps {
  variant?: 'default' | 'dark' | 'gaming'
  children: React.ReactNode
  className?: string
  glow?: boolean
  onClick?: () => void
}

export const PixelCard: React.FC<PixelCardProps> = ({
  variant = 'default',
  children,
  className = '',
  glow = false,
  onClick
}) => {
  const baseClass = variant === 'gaming' ? 'pixel-card-gaming' : variant === 'dark' ? 'pixel-card-dark' : 'pixel-card'
  const interactiveClass = onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''
  const glowClass = glow ? 'pixel-glow' : ''

  return (
    <div
      onClick={onClick}
      className={`${baseClass} ${interactiveClass} ${glowClass} ${className}`}
    >
      {children}
    </div>
  )
}

// 🎮 Pixel Badge Component
interface PixelBadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  children: React.ReactNode
  className?: string
  icon?: LucideIcon
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({
  variant = 'primary',
  children,
  className = '',
  icon: Icon
}) => {
  const baseClass = `pixel-badge-${variant}`

  return (
    <div className={`${baseClass} ${className}`}>
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {children}
    </div>
  )
}

// 🎯 Pixel Progress Bar Component
interface PixelProgressProps {
  value: number
  max?: number
  className?: string
  label?: string
}

export const PixelProgress: React.FC<PixelProgressProps> = ({
  value,
  max = 100,
  className = '',
  label
}) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={`pixel-progress ${className}`}>
      <div className="pixel-progress-bar" style={{ width: `${percentage}%` }} />
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="pixel-font-small text-white font-bold">{label}</span>
        </div>
      )}
    </div>
  )
}

// 🎮 Pixel Input Component
interface PixelInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url'
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  dark?: boolean
  required?: boolean
  name?: string
}

export const PixelInput: React.FC<PixelInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  dark = false,
  required = false,
  name
}) => {
  const baseClass = dark ? 'pixel-input-dark' : 'pixel-input'

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${baseClass} ${className}`}
      required={required}
      name={name}
    />
  )
}

// 🎯 Pixel Select Component
interface PixelSelectProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
  className?: string
  dark?: boolean
  name?: string
}

export const PixelSelect: React.FC<PixelSelectProps> = ({
  value,
  onChange,
  children,
  className = '',
  dark = false,
  name
}) => {
  const baseClass = dark ? 'pixel-input-dark' : 'pixel-input'

  return (
    <select
      value={value}
      onChange={onChange}
      className={`${baseClass} ${className}`}
      name={name}
    >
      {children}
    </select>
  )
}

// 🎮 Pixel Textarea Component
interface PixelTextareaProps {
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
  dark?: boolean
  rows?: number
  name?: string
}

export const PixelTextarea: React.FC<PixelTextareaProps> = ({
  placeholder,
  value,
  onChange,
  className = '',
  dark = false,
  rows = 3,
  name
}) => {
  const baseClass = dark ? 'pixel-input-dark' : 'pixel-input'

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${baseClass} ${className}`}
      rows={rows}
      name={name}
    />
  )
}

// 🎯 Pixel Stats Card Component
interface PixelStatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export const PixelStatsCard: React.FC<PixelStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-cyan-400',
  trend,
  className = ''
}) => {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  }

  return (
    <PixelCard variant="gaming" className={`p-6 text-center ${className}`}>
      <div className={`mb-2 flex justify-center ${iconColor}`}>
        <Icon className="h-8 w-8" />
      </div>
      <div className="pixel-font-header text-2xl text-white mb-1">
        {value}
      </div>
      <div className="pixel-font-small text-gray-400">
        {title}
      </div>
      {subtitle && (
        <div className={`pixel-font-small mt-2 ${trend ? trendColors[trend] : 'text-gray-400'}`}>
          {subtitle}
        </div>
      )}
    </PixelCard>
  )
}

// 🎮 Pixel Navigation Component
interface PixelNavProps {
  children: React.ReactNode
  className?: string
}

export const PixelNav: React.FC<PixelNavProps> = ({ children, className = '' }) => {
  return (
    <nav className={`pixel-nav ${className}`}>
      {children}
    </nav>
  )
}

// 🎯 Pixel Nav Item Component
interface PixelNavItemProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}

export const PixelNavItem: React.FC<PixelNavItemProps> = ({
  children,
  active = false,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`pixel-nav-item ${active ? 'active' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// 🎮 Pixel Alert Component
interface PixelAlertProps {
  type: 'success' | 'warning' | 'error' | 'info'
  title?: string
  children: React.ReactNode
  className?: string
  icon?: LucideIcon
}

export const PixelAlert: React.FC<PixelAlertProps> = ({
  type,
  title,
  children,
  className = '',
  icon: Icon
}) => {
  const colors = {
    success: 'bg-green-900 border-green-400 text-green-400',
    warning: 'bg-yellow-900 border-yellow-400 text-yellow-400',
    error: 'bg-red-900 border-red-400 text-red-400',
    info: 'bg-blue-900 border-blue-400 text-blue-400'
  }

  return (
    <div className={`p-4 rounded border-2 ${colors[type]} ${className}`}>
      <div className="flex items-start">
        {Icon && <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />}
        <div>
          {title && (
            <h4 className="pixel-font-body font-bold mb-1">{title}</h4>
          )}
          <div className="pixel-font-small">{children}</div>
        </div>
      </div>
    </div>
  )
}

// 🎯 Pixel Loading Component
interface PixelLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export const PixelLoading: React.FC<PixelLoadingProps> = ({
  size = 'md',
  text,
  className = ''
}) => {
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  }[size]

  return (
    <div className={`text-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-4 border-cyan-400 mx-auto ${sizeClass}`}></div>
      {text && (
        <p className="pixel-font-body text-white mt-4">{text}</p>
      )}
    </div>
  )
}

// 🎮 Pixel Grid Component
interface PixelGridProps {
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export const PixelGrid: React.FC<PixelGridProps> = ({
  cols = 3,
  gap = 'md',
  children,
  className = ''
}) => {
  const gridClass = `pixel-grid-${cols}`
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-8'
  }[gap]

  return (
    <div className={`${gridClass} ${gapClass} ${className}`}>
      {children}
    </div>
  )
}

// 🎯 Pixel Container Component
interface PixelContainerProps {
  children: React.ReactNode
  className?: string
}

export const PixelContainer: React.FC<PixelContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`pixel-container ${className}`}>
      {children}
    </div>
  )
}

// 🎮 Pixel Typography Components
interface PixelTypographyProps {
  children: React.ReactNode
  className?: string
}

export const PixelTitle: React.FC<PixelTypographyProps> = ({ children, className = '' }) => (
  <h1 className={`pixel-font-title ${className}`}>{children}</h1>
)

export const PixelHeader: React.FC<PixelTypographyProps> = ({ children, className = '' }) => (
  <h2 className={`pixel-font-header ${className}`}>{children}</h2>
)

export const PixelBody: React.FC<PixelTypographyProps> = ({ children, className = '' }) => (
  <p className={`pixel-font-body ${className}`}>{children}</p>
)

export const PixelSmall: React.FC<PixelTypographyProps> = ({ children, className = '' }) => (
  <span className={`pixel-font-small ${className}`}>{children}</span>
)

// 🎯 Pixel Animation Components
interface PixelAnimationProps {
  children: React.ReactNode
  type: 'bounce' | 'shake' | 'glow'
  className?: string
}

export const PixelAnimation: React.FC<PixelAnimationProps> = ({
  children,
  type,
  className = ''
}) => {
  const animationClass = `pixel-${type}`
  
  return (
    <div className={`${animationClass} ${className}`}>
      {children}
    </div>
  )
}

// 🎮 Pixel Background Component
interface PixelBackgroundProps {
  children: React.ReactNode
  pattern?: 'circuit' | 'dots' | 'grid'
  className?: string
}

export const PixelBackground: React.FC<PixelBackgroundProps> = ({
  children,
  pattern = 'circuit',
  className = ''
}) => {
  const patternClass = `pixel-bg-${pattern}`
  
  return (
    <div className={`${patternClass} ${className}`}>
      {children}
    </div>
  )
}

// 🎯 Pixel Icon Component
interface PixelIconProps {
  icon?: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
  children?: React.ReactNode
}

export const PixelIcon: React.FC<PixelIconProps> = ({
  icon: Icon,
  size = 'md',
  color = 'text-cyan-400',
  className = '',
  children
}) => {
  const sizeClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }[size]

  // If children (emoji/text) is provided, render that
  if (children) {
    return (
      <span className={`${sizeClass} ${color} ${className}`}>
        {children}
      </span>
    )
  }

  // Otherwise render the Lucide icon
  if (Icon) {
    const iconSizeClass = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    }[size]

    return (
      <Icon className={`${iconSizeClass} ${color} ${className}`} />
    )
  }

  return null
}

// 🎯 Pixel Section Component
interface PixelSectionProps {
  children: React.ReactNode
  className?: string
  dark?: boolean
}

export const PixelSection: React.FC<PixelSectionProps> = ({
  children,
  className = '',
  dark = false
}) => {
  const baseClass = dark ? 'pixel-section-dark' : 'pixel-section'
  
  return (
    <section className={`${baseClass} ${className}`}>
      {children}
    </section>
  )
}

// 🎯 Pixel Stats Component (alias for PixelStatsCard)
export const PixelStats = PixelStatsCard