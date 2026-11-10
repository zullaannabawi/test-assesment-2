'use client'

import { Search, X } from 'lucide-react'
import { Input } from '../atoms/input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search members...',
}: SearchBarProps) {
  return (
    <div className="search-bar">
      <Search className="search-bar__icon" size={16} aria-hidden="true" />
      <Input
        className="search-bar__input"
        aria-label="Search members"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="search-bar__clear"
          aria-label="Clear search input"
          onClick={onClear}
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
