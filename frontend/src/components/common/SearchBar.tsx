import { Input } from '@heroui/react'
import { FRENCH_LABELS } from '@/utils/constants'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <Input
      type="search"
      placeholder={placeholder || FRENCH_LABELS.searchPlaceholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      classNames={{
        base: 'w-full',
        mainWrapper: 'h-full',
        input: 'text-small',
        inputWrapper:
          'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
      }}
      size="lg"
      startContent={
        <svg
          className="w-5 h-5 text-default-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
    />
  )
}
