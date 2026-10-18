import React, { useState, useEffect, useRef, useMemo } from 'react';
import { apiGet } from '@/lib/httpClient';
import { Input } from '@/components/ui/input';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { Loader2, Sprout, X, ChevronDown, Check } from 'lucide-react';
import rawCropsDataset from '@/data/cropsData.json';

export interface CropOption {
  id: string | number;
  name: string;
  scientificName?: string;
  category?: string;
  season?: string;
  localNames?: string[];
}

interface CropAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const POPULAR_CROP_NAMES = [
  'Rice (Paddy)',
  'Ragi (Finger Millet)',
  'Maize (Corn)',
  'Cotton',
  'Tomato',
  'Sugarcane',
  'Groundnut (Peanut)',
  'Pigeon Pea (Toor Dal / Red Gram)',
  'Chickpea (Chana)',
  'Chilli',
  'Coffee',
  'Arecanut'
];

// Pre-process master dataset into normalized CropOption items
const BUNDLED_CROPS: CropOption[] = (rawCropsDataset as any[]).map((c, index) => {
  const rawSci = c.scientific_name || c.scientificName;
  const validSci = rawSci && rawSci.toLowerCase() !== 'unknown' ? rawSci : undefined;
  const seasonStr = Array.isArray(c.season) ? c.season.join(', ') : (c.season || '');
  return {
    id: c.id || `crop_${index}`,
    name: c.name,
    scientificName: validSci,
    category: c.category,
    season: seasonStr,
    localNames: Array.isArray(c.local_names) ? c.local_names : [],
  };
});

export function CropAutocomplete({
  value,
  onChange,
  placeholder = 'Search crop (e.g. Rice, Ragi, Tomato, Cotton)...',
  className = '',
}: CropAutocompleteProps) {
  const [query, setQuery] = useState(value || '');
  const [apiResults, setApiResults] = useState<CropOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useOnClickOutside(dropdownRef, () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  });

  // Keep internal query synchronized with external value
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Case-insensitive client-side search across bundled crops
  const filteredCrops = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      // If query is empty, return top popular crops
      return BUNDLED_CROPS.filter((c) =>
        POPULAR_CROP_NAMES.some((p) => p.toLowerCase() === c.name.toLowerCase())
      );
    }

    // Rank matching: 
    // 1. Name starts with query
    // 2. Name contains query
    // 3. Local names contain query (e.g., akki, ragi, chawal)
    // 4. Scientific name or category contains query
    const startsWithName: CropOption[] = [];
    const containsName: CropOption[] = [];
    const aliasMatch: CropOption[] = [];
    const otherMatch: CropOption[] = [];

    for (const crop of BUNDLED_CROPS) {
      const lowerName = crop.name.toLowerCase();
      if (lowerName.startsWith(q)) {
        startsWithName.push(crop);
      } else if (lowerName.includes(q)) {
        containsName.push(crop);
      } else if (crop.localNames?.some((ln) => ln.toLowerCase().includes(q))) {
        aliasMatch.push(crop);
      } else if (
        (crop.scientificName && crop.scientificName.toLowerCase().includes(q)) ||
        (crop.category && crop.category.toLowerCase().includes(q)) ||
        (crop.season && crop.season.toLowerCase().includes(q))
      ) {
        otherMatch.push(crop);
      }
    }

    return [...startsWithName, ...containsName, ...aliasMatch, ...otherMatch].slice(0, 15);
  }, [query]);

  // Asynchronously query backend API and merge results
  useEffect(() => {
    const trimmed = (query || '').trim();
    if (!trimmed || trimmed.length < 2) {
      setApiResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await apiGet(`/api/crops/search?query=${encodeURIComponent(trimmed)}`);
        if (isMounted && Array.isArray(data)) {
          const parsed: CropOption[] = data.map((d: any, idx: number) => {
            const rawSci = d.scientificName || d.scientific_name;
            const validSci = rawSci && rawSci.toLowerCase() !== 'unknown' ? rawSci : undefined;
            return {
              id: d.id ?? `api_${idx}`,
              name: d.name || d.nameEnglish || '',
              scientificName: validSci,
              category: d.category || d.district,
              season: d.season,
              localNames: Array.isArray(d.localNames) ? d.localNames : [],
            };
          }).filter((c) => c.name.trim().length > 0);
          setApiResults(parsed);
        }
      } catch (err) {
        // Fallback silently to client-side bundled matches
        console.warn('API crop search error, relying on bundled dataset:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Merge client-side and backend results, deduplicating by normalized name
  const combinedResults = useMemo(() => {
    const map = new Map<string, CropOption>();

    // 1. Add client matches first
    for (const crop of filteredCrops) {
      const key = crop.name.trim().toLowerCase();
      map.set(key, crop);
    }

    // 2. Add API matches
    for (const crop of apiResults) {
      const key = crop.name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, crop);
      } else {
        // Enhance existing entry if API provides additional details
        const existing = map.get(key)!;
        if (!existing.scientificName && crop.scientificName) {
          existing.scientificName = crop.scientificName;
        }
      }
    }

    return Array.from(map.values()).slice(0, 12);
  }, [filteredCrops, apiResults]);

  const handleSelect = (cropName: string) => {
    const cleanName = cropName.trim();
    setQuery(cleanName);
    onChange(cleanName);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    onChange('');
    setIsOpen(true);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // Support manual / custom entry immediately
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < combinedResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : combinedResults.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < combinedResults.length) {
        e.preventDefault();
        handleSelect(combinedResults[highlightedIndex].name);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const isExactMatch = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    return combinedResults.some((c) => c.name.toLowerCase() === q);
  }, [query, combinedResults]);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div className="relative flex items-center">
        <Sprout className="absolute left-3.5 h-4 w-4 text-gold-400/50 pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className="bg-earth-main border-earth-border focus-visible:ring-gold-400 text-gold-100 rounded-xl h-11 pl-10 pr-16"
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-gold-400/70" />
          )}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-gold-100/40 hover:text-gold-200 hover:bg-gold-400/10 transition-colors"
              title="Clear crop"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 rounded-md text-gold-100/40 hover:text-gold-200 transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gold-400' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-earth-elevated border border-earth-border/80 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header indicator */}
          <div className="px-3.5 py-1.5 bg-earth-main/60 border-b border-earth-border/40 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gold-100/40">
            <span>{query.trim() ? 'Matching Crops (Case-Insensitive)' : 'Popular Crops to Cultivate'}</span>
            <span>{combinedResults.length} options</span>
          </div>

          {combinedResults.length > 0 ? (
            <div className="py-1">
              {combinedResults.map((crop, index) => {
                const isSelected = query.trim().toLowerCase() === crop.name.toLowerCase();
                const isHighlighted = highlightedIndex === index;
                const sci = crop.scientificName;
                const sub = sci && crop.category
                  ? `${sci} • ${crop.category}`
                  : (sci || crop.category || crop.season || 'Agricultural Crop');

                return (
                  <div
                    key={`${crop.id}-${crop.name}`}
                    className={`px-3.5 py-2.5 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isHighlighted
                        ? 'bg-gold-400/20 text-gold-200'
                        : isSelected
                        ? 'bg-gold-400/10 text-gold-300'
                        : 'hover:bg-gold-400/10 text-gold-100'
                    }`}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(crop.name)}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-tight text-gold-100 truncate">
                          {crop.name}
                        </span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-gold-100/50 uppercase tracking-widest truncate mt-0.5">
                        {sub}
                      </span>
                    </div>

                    {crop.season && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-gold-400/70 bg-gold-400/10 px-2 py-0.5 rounded-full border border-gold-400/20 shrink-0">
                        {crop.season.split(',')[0]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-gold-100/60 font-medium">
                No matching standard crops found for &quot;<span className="text-gold-300 font-bold">{query}</span>&quot;
              </p>
              <p className="text-[10px] text-gold-100/40 uppercase tracking-wider mt-1">
                You can still keep this custom crop name for your field.
              </p>
            </div>
          )}

          {/* Custom crop option if user typed something not matching exactly */}
          {query.trim().length > 0 && !isExactMatch && (
            <div
              className="px-3.5 py-2.5 bg-earth-main/90 border-t border-earth-border/50 cursor-pointer hover:bg-gold-400/15 flex items-center justify-between transition-colors"
              onClick={() => handleSelect(query.trim())}
            >
              <span className="text-xs text-gold-100/70">
                Use custom crop: <strong className="text-gold-300">&quot;{query.trim()}&quot;</strong>
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20">
                Select Custom
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
