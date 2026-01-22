import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-[var(--color-surface)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-accent)] text-[var(--color-surface)] hover:opacity-90',
        destructive: 'bg-[var(--color-error)] text-white hover:opacity-90',
        outline: 'border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]',
        secondary: 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]',
        ghost: 'hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]',
        link: 'text-[#0071e3] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
