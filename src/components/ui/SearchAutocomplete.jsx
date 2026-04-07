import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MagnifyingGlass, X, User } from "@phosphor-icons/react";

const SearchAutocomplete = ({
  items = [],
  selectedId,
  onSelect,
  placeholder = "Search...",
  label = "Search",
  required = false,
  renderItem,
  searchFilter,
  noResultsAction = null,
  isLoading = false,
  selectedTheme = "emerald", // 'emerald' or 'neutral'
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const updateCoords = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCoords({
        left: rect.left,
        top: rect.bottom + window.scrollY,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      // Listen to scroll on any scrollable parent
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideWrapper = wrapperRef.current && wrapperRef.current.contains(event.target);
      const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      
      if (!clickedInsideWrapper && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayItems = debouncedTerm
    ? items.filter((item) => searchFilter(item, debouncedTerm)).slice(0, 8)
    : items.slice(0, 8);

  const selectedItem = items.find((item) => item.id === selectedId);

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedTerm("");
    onSelect("");
  };

  // Theme configurations
  const themes = {
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/50",
      text: "text-emerald-900 dark:text-emerald-100",
      icon: "text-emerald-600 dark:text-emerald-400",
      hover: "hover:text-emerald-800 dark:hover:text-emerald-300",
      focusRing: "focus:ring-emerald-500 focus:border-emerald-500",
    },
    neutral: {
      bg: "bg-gray-50 dark:bg-dark-bg/60",
      border: "border-gray-200 dark:border-dark-border",
      text: "text-gray-900 dark:text-gray-100",
      icon: "text-gray-500 dark:text-gray-400",
      hover: "hover:text-gray-700 dark:hover:text-gray-300",
      focusRing: "focus:ring-blue-500 focus:border-blue-500",
    },
  };

  const theme = themes[selectedTheme] || themes.neutral;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {selectedItem ? (
        <div className={`flex items-center justify-between w-full px-4 py-2.5 ${theme.bg} border ${theme.border} rounded-md shadow-sm transition-colors`}>
          <div className="flex items-center flex-1 min-w-0">
            <User className={`w-4 h-4 ${theme.icon} mr-2 flex-shrink-0`} />
            <div className={`text-sm font-medium ${theme.text} truncate`}>
              {renderItem(selectedItem, true)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className={`flex-shrink-0 ml-2 ${theme.icon} ${theme.hover} transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            className={`w-full pl-9 pr-4 py-2.5 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 ${theme.focusRing} transition-colors placeholder-gray-400 dark:placeholder-gray-600 shadow-sm disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500`}
            placeholder={placeholder}
            value={searchTerm}
            disabled={disabled}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => !disabled && setIsOpen(true)}
          />

          {isOpen && coords && createPortal(
            <div 
              ref={dropdownRef}
              className="absolute z-[9999] bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-md shadow-lg dark:shadow-2xl max-h-60 flex flex-col overflow-hidden"
              style={{
                left: coords.left,
                top: coords.top + 4, // 4px margin
                width: coords.width,
              }}
            >
              <ul className="overflow-y-auto flex-1">
                {isLoading ? (
                  <li className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white mr-2"></div>
                    Loading...
                  </li>
                ) : displayItems.length > 0 ? (
                  displayItems.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        onSelect(item.id);
                        setIsOpen(false);
                        setSearchTerm("");
                        setDebouncedTerm("");
                      }}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg/80 border-b border-gray-100 dark:border-dark-border/50 last:border-0 transition-colors"
                    >
                      {renderItem(item, false)}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
                      No results found for "{debouncedTerm || searchTerm}"
                    </div>
                    {noResultsAction && (
                      <div className="flex justify-center mt-2">
                        {noResultsAction(() => setIsOpen(false))}
                      </div>
                    )}
                  </li>
                )}
              </ul>
            </div>,
            document.body
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
