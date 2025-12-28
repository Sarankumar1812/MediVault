"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Check, Search } from "lucide-react"

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  searchable?: boolean
}

export default function Dropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  searchable = false 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>(options)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
  }, [searchTerm, options])

  const selectedOption = options.find(option => option.value === value)

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm("")
  }

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setSearchTerm("")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-white text-left flex items-center justify-between"
      >
        <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear selection"
            >
              ×
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  className={`
                    w-full px-4 py-2 text-left flex items-center justify-between hover:bg-muted transition-colors
                    ${value === option.value ? "bg-muted" : ""}
                  `}
                >
                  <span className="text-sm">{option.label}</span>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}