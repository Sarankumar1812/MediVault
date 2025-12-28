"use client"

import { useState, useEffect, useRef } from "react"
import PhoneInput from "react-phone-number-input"
import type { Value } from "react-phone-number-input"
import { ChevronDown } from "lucide-react"
import "react-phone-number-input/style.css"

interface CustomPhoneInputProps {
  value?: Value
  onChange: (value?: Value) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean // Added disabled prop
}

export default function CustomPhoneInput({ 
  value, 
  onChange, 
  placeholder = "Phone number", 
  required = false,
  disabled = false // Default to false
}: CustomPhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle disabled state - don't open when disabled
  const handleCountryFocus = () => {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  const handleCountryBlur = () => {
    if (!disabled) {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className={`phone-input-wrapper border border-border rounded-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all ${isOpen ? 'ring-2 ring-ring border-transparent' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <PhoneInput
          international
          defaultCountry="IN"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled} // Pass disabled to PhoneInput
          countrySelectProps={{
            className: "country-select",
            disabled: disabled, // Disable country select when component is disabled
            arrowComponent: () => (
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isOpen ? "rotate-180" : ""} ${disabled ? 'opacity-50' : ''}`} />
            ),
            onFocus: handleCountryFocus,
            onBlur: handleCountryBlur,
          }}
          inputProps={{
            className: "phone-input",
            required,
            disabled, // Pass disabled to input
          }}
        />
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .phone-input-wrapper {
          position: relative;
        }

        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .phone-input-wrapper .PhoneInputCountry {
          position: relative;
          align-self: stretch;
          display: flex;
          align-items: center;
          margin-right: 0;
          padding: 0 0.5rem;
          background: white;
          border-right: 1px solid hsl(var(--border));
          min-width: 120px;
          ${disabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}
        }

        .phone-input-wrapper .PhoneInputCountrySelect {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          z-index: 1;
          border: 0;
          opacity: 0;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
        }

        .phone-input-wrapper .PhoneInputCountrySelect:focus + .PhoneInputCountryIconArrow {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }

        .phone-input-wrapper .PhoneInputCountryIcon {
          width: 1.5em;
          height: 1.5em;
          border-radius: 0.25rem;
          overflow: hidden;
          margin-right: 0.5rem;
        }

        .phone-input-wrapper .PhoneInputCountryIconArrow {
          display: flex;
          align-items: center;
          margin-left: auto;
          color: hsl(var(--muted-foreground));
        }

        .phone-input-wrapper .PhoneInputInput {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 0;
          outline: none;
          font-size: 1rem;
          background: white;
          width: 100%;
          ${disabled ? 'cursor: not-allowed; background-color: hsl(var(--muted));' : ''}
        }

        .phone-input-wrapper .PhoneInputInput:focus {
          outline: none;
          box-shadow: none;
        }

        .phone-input-wrapper .PhoneInputInput::placeholder {
          color: hsl(var(--muted-foreground));
        }

        /* Country dropdown styles */
        .PhoneInputCountryDropdown {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 50;
          width: 320px;
          max-height: 300px;
          overflow-y: auto;
          background: white;
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          margin-top: 0.25rem;
        }

        .PhoneInputCountryDropdown option {
          padding: 0.5rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .PhoneInputCountryDropdown option:hover {
          background-color: hsl(var(--muted));
        }

        .PhoneInputCountryDropdown option:focus {
          outline: none;
          background-color: hsl(var(--muted));
        }

        /* Search input in dropdown */
        .PhoneInputCountryDropdownSearch {
          position: sticky;
          top: 0;
          padding: 0.75rem;
          background: white;
          border-bottom: 1px solid hsl(var(--border));
          z-index: 10;
        }

        .PhoneInputCountryDropdownSearchInput {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid hsl(var(--border));
          border-radius: 0.375rem;
          font-size: 0.875rem;
          outline: none;
        }

        .PhoneInputCountryDropdownSearchInput:focus {
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
        }

        /* Country list item */
        .PhoneInputCountryDropdownRow {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .PhoneInputCountryDropdownRow:hover {
          background-color: hsl(var(--muted));
        }

        .PhoneInputCountryDropdownRow[aria-selected="true"] {
          background-color: hsl(var(--primary) / 0.1);
        }

        .PhoneInputCountryDropdownFlag {
          width: 1.5em;
          height: 1.5em;
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .PhoneInputCountryDropdownName {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(var(--foreground));
        }

        .PhoneInputCountryDropdownDialCode {
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
        }

        /* Loading state */
        .PhoneInputCountryDropdownSpinner {
          display: flex;
          justify-content: center;
          padding: 1rem;
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  )
}