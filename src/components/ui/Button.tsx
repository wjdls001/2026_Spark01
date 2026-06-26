import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({ variant = 'primary', size = 'md', fullWidth, className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-full font-bold transition-all active:scale-95 disabled:opacity-50'
  const variants = {
    primary: 'bg-spark-lime text-spark-dark hover:brightness-95',
    secondary: 'bg-spark-purple text-white hover:brightness-95',
    outline: 'border border-[#333333] text-spark-dark bg-transparent hover:bg-gray-50',
    ghost: 'text-spark-text-secondary bg-transparent hover:bg-gray-100',
  }
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'w-full py-4 text-base',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
