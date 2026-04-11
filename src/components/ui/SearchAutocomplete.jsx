import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDebounce } from "use-debounce";
import { MagnifyingGlass, X, User } from "@phosphor-icons/react";

const SearchAutocomplete = ({
  items = [],
  selectedId,
  onSelect,
  onSearch,
  placeholder = "Search...",
  label = "Search",
  required = false,
  renderItem,
  searchFilter,
  noResultsAction = null,
  isLoading = false,
  selectedTheme = "emerald",
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm] = useDebounce(searchTerm, 300);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  // 🔑 Internal cache: holds the full selected object so it survives Redux list resets
  const [selectedItemCache, setSelectedItemCache] = useState(null);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const prevTermRef = useRef("");

  // Sync cache when selectedId is cleared externally (e.g., X button in parent)
  useEffect(() => {
    if (!selectedId) {
      setSelectedItemCache(null);
    }
  }, [selectedId]);

  // Sync cache when selectedId is provided but cache is empty (e.g., initialLeadId on mount)
  useEffect(() => {
    if (selectedId && !selectedItemCache) {
      const found = items.find((item) => item.id === selectedId);
      if (found) setSelectedItemCache(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, items]);

  // Only trigger onSearch when the debounced text has actually changed
  useEffect(() => {
    if (prevTermRef.current !== debouncedTerm) {
      if (onSearch) {
        onSearch(debouncedTerm);
      }
      prevTermRef.current = debouncedTerm;
    }
  }, [debouncedTerm, onSearch]);

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
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideWrapper =
        wrapperRef.current && wrapperRef.current.contains(event.target);
      const clickedInsideDropdown =
        dropdownRef.current && dropdownRef.current.contains(event.target);
      if (!clickedInsideWrapper && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayItems = onSearch
    ? items.slice(0, 8)
    : debouncedTerm
      ? items.filter((item) => searchFilter(item, debouncedTerm)).slice(0, 8)
      : items.slice(0, 8);

  // Use internal cache as the source of truth — never depends on items[]
  const selectedItem = selectedItemCache;

  const handleClear = () => {
    setSearchTerm("");
    setSelectedItemCache(null);
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
        <div
          className={`flex items-center justify-between w-full px-4 py-2.5 ${theme.bg} border ${theme.border} rounded-md shadow-sm transition-colors`}
        >
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

          {isOpen &&
            coords &&
            createPortal(
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
                    // ✨ Skeleton rows
                    <>
                      {[...Array(3)].map((_, i) => (
                        <li
                          key={i}
                          className="px-4 py-3 border-b border-gray-100 dark:border-dark-border/50 last:border-0"
                        >
                          <div className="animate-pulse flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                            </div>
                          </div>
                        </li>
                      ))}
                    </>
                  ) : displayItems.length > 0 ? (
                    displayItems.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => {
                          // 🔑 Cache the full item object before clearing the search term
                          setSelectedItemCache(item);
                          onSelect(item.id);
                          setIsOpen(false);
                          setSearchTerm("");
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
              document.body,
            )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
