/**
 * District Search Component
 * Enhanced autocomplete search with fuzzy matching
 * Supports keyboard navigation and accessibility
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Check, ChevronDown } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import type { DistrictData } from '@/hooks/useDistrictSearch';

interface DistrictSearchProps {
  districts: DistrictData[];
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: DistrictData[];
  placeholder?: string;
  className?: string;
  showAllOnFocus?: boolean;
}

export function DistrictSearch({
  districts,
  selectedDistrict,
  onSelectDistrict,
  searchQuery,
  onSearchChange,
  searchResults,
  placeholder = 'Search district...',
  className = '',
  showAllOnFocus = true,
}: DistrictSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Display results
  const displayResults = searchQuery.trim() || !showAllOnFocus ? searchResults : districts;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < displayResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && displayResults[focusedIndex]) {
          handleSelect(displayResults[focusedIndex].district);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (district: string) => {
    onSelectDistrict(district);
    onSearchChange('');
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleClear = () => {
    onSelectDistrict('');
    onSearchChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-leaf-200 text-leaf-900 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        
        <Input
          ref={inputRef}
          type="text"
          value={selectedDistrict || searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-20 input-field"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedDistrict && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-soft-lg max-h-80 overflow-y-auto"
          >
            {displayResults.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No districts found
              </div>
            ) : (
              <div className="py-2">
                {displayResults.map((district, index) => {
                  const isSelected = district.district === selectedDistrict;
                  const isFocused = index === focusedIndex;

                  return (
                    <motion.div
                      key={district.district}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        isFocused || isSelected
                          ? 'bg-leaf-50'
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => handleSelect(district.district)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-slate-900">
                              {highlightMatch(district.district, searchQuery)}
                            </h4>
                            {isSelected && (
                              <Check className="h-4 w-4 text-leaf-600 flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <Badge variant="secondary" className="text-xs font-normal">
                              {district.weather_pattern}
                            </Badge>
                            <Badge variant="outline" className="text-xs font-normal">
                              {district.avg_rainfall}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-600 truncate">
                            <span className="font-medium">Crops:</span>{' '}
                            {highlightMatch(district.recommended_crops, searchQuery)}
                          </p>
                          
                          <p className="text-xs text-slate-500 truncate">
                            <span className="font-medium">Soil:</span> {district.soil_type}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Results count */}
            {displayResults.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
                <p className="text-xs text-slate-600">
                  {displayResults.length} district{displayResults.length !== 1 ? 's' : ''} found
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts hint */}
      {isOpen && (
        <div className="absolute -bottom-6 right-0 text-xs text-slate-400">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </div>
      )}
    </div>
  );
}

/**
 * Compact District Search (for smaller spaces)
 */
export function CompactDistrictSearch({
  districts,
  selectedDistrict,
  onSelectDistrict,
  className = '',
}: {
  districts: DistrictData[];
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Simple filter (without Fuse.js)
  const filteredDistricts = districts.filter(d =>
    d.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {selectedDistrict || 'Select district'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div className="p-2 border-b sticky top-0 bg-white">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm"
              />
            </div>
            
            <div>
              {filteredDistricts.map(d => (
                <div
                  key={d.district}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-leaf-50 ${
                    d.district === selectedDistrict ? 'bg-leaf-50 font-semibold' : ''
                  }`}
                  onClick={() => {
                    onSelectDistrict(d.district);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  {d.district}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
