'use client'

import * as React from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, checked, onChange, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate || false
      }
    }, [indeterminate])

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={(node) => {
            (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />
        <div
          onClick={() => {
            if (innerRef.current) {
              innerRef.current.click()
            }
          }}
          className={cn(
            'h-5 w-5 rounded border-2 cursor-pointer transition-all duration-200',
            'border-[var(--glass-border)] bg-transparent',
            'peer-checked:bg-[var(--primary)] peer-checked:border-[var(--primary)]',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--background)]',
            'hover:border-[var(--primary)]/50',
            'flex items-center justify-center',
            indeterminate && 'bg-[var(--primary)] border-[var(--primary)]',
            className
          )}
        >
          {checked && !indeterminate && (
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          )}
          {indeterminate && (
            <Minus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          )}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
