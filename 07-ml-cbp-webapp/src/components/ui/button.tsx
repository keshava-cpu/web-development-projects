import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007acc] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#007acc] text-white hover:bg-[#0098ff]',
        secondary: 'bg-[#171b1f] text-[#edf2f7] border border-[#2a2d31] hover:bg-[#1d2429]',
        ghost: 'text-[#858585] hover:bg-[#1d2125] hover:text-[#d4d4d4]',
        outline: 'border border-[#2a2d31] bg-[#171b1f] text-[#d4d4d4] hover:border-[#3a3f44]',
      },
      size: {
        default: 'h-8 px-2.5 py-1.5',
        sm: 'h-7 px-2 text-[11px]',
        lg: 'h-9 px-3 text-sm',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
))
Button.displayName = 'Button'

export { Button, buttonVariants }
