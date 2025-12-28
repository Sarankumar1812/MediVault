"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, addDays, isBefore, endOfDay, setMonth, setYear, getYear, getMonth } from "date-fns"

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  disabled?: boolean // Added disabled prop
}

export default function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  disabled = false // Default to false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const currentYear = getYear(today)

  // Generate years (from current year to 100 years back)
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowMonthDropdown(false)
        setShowYearDropdown(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Initialize selected date from value
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setSelectedDate(date)
        setCurrentMonth(date)
      }
    }
  }, [value])

  const isToday = (day: Date) => isSameDay(day, today)
  const isFuture = (day: Date) => isBefore(today, day) && !isToday(day)
  const isDisabled = (day: Date) => isFuture(day)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const handlePrevMonth = () => {
    if (!disabled) {
      setCurrentMonth(subMonths(currentMonth, 1))
    }
  }

  const handleNextMonth = () => {
    if (!disabled) {
      const nextMonth = addMonths(currentMonth, 1)
      if (isBefore(nextMonth, addMonths(today, 1))) {
        setCurrentMonth(nextMonth)
      }
    }
  }

  const handleMonthSelect = (monthIndex: number) => {
    if (!disabled) {
      setCurrentMonth(setMonth(currentMonth, monthIndex))
      setShowMonthDropdown(false)
    }
  }

  const handleYearSelect = (year: number) => {
    if (!disabled) {
      setCurrentMonth(setYear(currentMonth, year))
      setShowYearDropdown(false)
    }
  }

  const handleDateClick = (day: Date) => {
    if (isDisabled(day) || disabled) return
    
    setSelectedDate(day)
    onChange(format(day, "yyyy-MM-dd"))
    setIsOpen(false)
  }

  const handleToggleCalendar = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const renderDays = () => {
    const days = []
    let day = calendarStart

    while (day <= calendarEnd) {
      const cloneDay = new Date(day)
      const isCurrentMonth = isSameMonth(day, currentMonth)
      const isSelected = selectedDate && isSameDay(day, selectedDate)
      const dayDisabled = isDisabled(day)

      days.push(
        <button
          key={day.toString()}
          type="button"
          onClick={() => handleDateClick(cloneDay)}
          disabled={dayDisabled || disabled}
          className={`
            h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium
            transition-colors
            ${isSelected ? "bg-primary text-primary-foreground" : ""}
            ${isToday(day) && !isSelected ? "border border-primary text-primary" : ""}
            ${!isCurrentMonth ? "text-muted-foreground opacity-50" : "text-foreground"}
            ${!dayDisabled && !isSelected && !disabled ? "hover:bg-muted hover:text-foreground" : ""}
            ${dayDisabled || disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {format(day, "d")}
        </button>
      )

      day = addDays(day, 1)
    }

    return days
  }

  return (
    <div className="relative" ref={datePickerRef}>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
          placeholder={placeholder}
          onClick={handleToggleCalendar}
          disabled={disabled}
          className={`w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-white cursor-pointer pr-10 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <Calendar className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${disabled ? 'text-muted-foreground opacity-50' : 'text-muted-foreground'}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 w-72 p-4">
          {/* Calendar Header with Dropdowns */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={disabled}
              className="p-1 hover:bg-muted rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2">
              {/* Month Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!disabled) {
                      setShowMonthDropdown(!showMonthDropdown)
                      setShowYearDropdown(false)
                    }
                  }}
                  disabled={disabled}
                  className="px-3 py-1 text-sm font-600 text-foreground hover:bg-muted rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {monthNames[getMonth(currentMonth)]}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showMonthDropdown ? "rotate-180" : ""}`} />
                </button>
                
                {showMonthDropdown && !disabled && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 w-40 max-h-60 overflow-y-auto">
                    {monthNames.map((month, index) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => handleMonthSelect(index)}
                        disabled={disabled}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getMonth(currentMonth) === index ? "bg-muted" : ""}`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!disabled) {
                      setShowYearDropdown(!showYearDropdown)
                      setShowMonthDropdown(false)
                    }
                  }}
                  disabled={disabled}
                  className="px-3 py-1 text-sm font-600 text-foreground hover:bg-muted rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getYear(currentMonth)}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showYearDropdown ? "rotate-180" : ""}`} />
                </button>
                
                {showYearDropdown && !disabled && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 w-32 max-h-60 overflow-y-auto">
                    {years.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        disabled={disabled}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getYear(currentMonth) === year ? "bg-muted" : ""}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={disabled || !isBefore(addMonths(currentMonth, 1), addMonths(today, 1))}
              className="p-1 hover:bg-muted rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-600 text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderDays()}
          </div>

          {/* Today Button */}
          <div className="mt-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                if (!disabled) {
                  const todayDate = new Date()
                  setSelectedDate(todayDate)
                  onChange(format(todayDate, "yyyy-MM-dd"))
                  setIsOpen(false)
                }
              }}
              disabled={disabled}
              className="w-full text-sm text-secondary hover:underline font-500 text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}